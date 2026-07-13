export type Priority = 'High' | 'Medium' | 'Low';

export interface PriorityResult {
  priority: Priority;
  needsReview: boolean;
}

const HIGH_KEYWORDS = [
  'flood', 'flooding', 'burst', 'pipe burst', 'no heat', 'no power',
  'gas leak', 'gas smell', 'smoke', 'fire', 'spark', 'sparking',
  'exposed wire', 'electrical hazard', 'sewage', 'ceiling collapsing',
  'ceiling caving', 'water everywhere', 'overflowing', 'overflow',
  'carbon monoxide', 'no electricity', 'no water',
];

const MEDIUM_KEYWORDS = [
  'not working', 'stopped working', 'stopped cooling', "won't turn on",
  "won't click", "wont click", 'noise', 'noisy', 'leaking slowly',
  'clogged', 'clog', 'stuck', 'not cooling', 'not heating',
  'broken', 'malfunctioning',
];

const LOW_KEYWORDS = [
  'loose handle', 'loose', 'scuffed', 'scuff', 'paint', 'cosmetic',
  'squeaky', 'squeak', 'minor', 'scratch', 'dent', 'cabinet door',
  'chipped', 'faded',
];

/**
 * Classifies a ticket description into a priority level using
 * keyword-based heuristics. Used as a fallback when the LLM
 * call fails or times out.
 */
export function classifyPriority(description: string): PriorityResult {
  const text = description.toLowerCase().trim();

  if (text.length < 8) {
    return { priority: 'Medium', needsReview: true };
  }

  if (HIGH_KEYWORDS.some((word) => text.includes(word))) {
    return { priority: 'High', needsReview: false };
  }

  if (MEDIUM_KEYWORDS.some((word) => text.includes(word))) {
    return { priority: 'Medium', needsReview: false };
  }

  if (LOW_KEYWORDS.some((word) => text.includes(word))) {
    return { priority: 'Low', needsReview: false };
  }

  return { priority: 'Medium', needsReview: true };
}