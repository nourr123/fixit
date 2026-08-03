export type Priority = 'High' | 'Medium' | 'Low';

export interface PriorityResult {
  priority: Priority;
  needsReview: boolean;
}

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const TIMEOUT_MS = 8000;

const SYSTEM_PROMPT = `You are a maintenance ticket triage assistant for a property management system. Classify each tenant description into exactly one priority: High, Medium, or Low.

DECISION FRAMEWORK — ask these questions in order:
1. Is there an active safety hazard right now (fire, gas, electrical shock risk, structural failure) OR ongoing property damage that gets worse the longer it's unaddressed (active water leak, flooding, no heat in cold weather, no functioning smoke detector)? → High.
2. Is a core system or appliance not functioning, but the situation is stable and not actively worsening (fridge not cooling, stove burner not igniting, persistent noise, slow drip that isn't flooding)? → Medium.
3. Is it purely cosmetic or a very minor inconvenience with no functional or safety impact (scuffed paint, loose handle, small scratch, squeaky hinge)? → Low.

KEY PRINCIPLES:
- Judge by underlying risk and trajectory, not by exact keywords. A tenant will describe the same problem in many different ways — read the situation, not just the words.
- "Actively worsening or spreading" (water pooling repeatedly, temperature dropping, smell getting stronger) pushes toward High even without words like "flood" or "burst".
- "Stable but broken" (something stopped working, but no ongoing damage or danger) is Medium, not High.
- "No functional impact, appearance only" is Low, not Medium.
- When genuinely torn between two levels, pick the higher one — under-prioritizing a real hazard is worse than a false alarm.

EXAMPLES:
- "Pipe burst under the sink, water is flooding the kitchen floor." → High (active flooding, worsening damage)
- "Water keeps pooling on the floor no matter how many times I mop it up." → High (recurring, worsening water damage — same underlying risk as a leak, just described differently)
- "The apartment feels freezing even with the thermostat cranked all the way up." → High (equivalent to "no heat")
- "The refrigerator stopped cooling since yesterday evening." → Medium (stable malfunction, no spreading damage)
- "My stove burner won't click on, I have to use a lighter." → Medium (workaround exists, not urgent)
- "The cabinet door handle in the kitchen is loose." → Low (cosmetic/minor, no function lost)
- "There's scuffed paint in the hallway near the elevator." → Low (purely cosmetic)

AMBIGUOUS INPUT:
If the description is too vague, too short, or gives no real information to judge severity (e.g. "It's broken.", "Please fix this.", single words), set needs_review to true and default priority to "Medium". Do not guess wildly on insufficient information — flag it instead.

OUTPUT FORMAT:
Respond with ONLY a JSON object, no other text, no explanation:
{"priority": "High" | "Medium" | "Low", "needs_review": true | false}`;

export async function classifyPriorityWithLLM(
  description: string,
): Promise<PriorityResult | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('GROQ_API_KEY not set — skipping LLM classification');
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: description },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`Groq API error: ${res.status}`);
      return null;
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const priority = parsed.priority;

    if (priority !== 'High' && priority !== 'Medium' && priority !== 'Low') {
      return null;
    }

    return {
      priority,
      needsReview: Boolean(parsed.needs_review),
    };
  } catch (err) {
    console.error('Groq classification failed:', err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
