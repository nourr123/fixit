import SiteNav from '../components/SiteNav';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--paper, #F5F3EE)' }}>
      {/* soft decorative glow */}
      <div
        className="absolute -top-40 -right-40 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: 'var(--accent-blue)', opacity: 0.07, filter: 'blur(10px)' }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{ background: 'var(--medium)', opacity: 0.06, filter: 'blur(10px)' }}
      />

      <SiteNav />

      <section className="max-w-5xl mx-auto px-6 lg:px-10 flex-1 grid md:grid-cols-2 gap-10 items-center py-16 relative w-full">
        {/* left: illustration */}
        <div className="flex justify-center md:justify-start order-1">
          <div
            className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full overflow-hidden flex items-center justify-center"
            style={{ border: '1px solid var(--line)', background: 'var(--accent-blue)' }}
          >
            <svg viewBox="0 0 240 240" className="w-[72%] h-[72%]" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFFFFF" d="M120 30 L200 90 L182 90 L182 190 L58 190 L58 90 L40 90 Z" />
              <rect fill="#9FC4E8" x="100" y="140" width="40" height="50" rx="3" />
              <g transform="translate(20,10) rotate(-30 120 115)">
                <circle cx="150" cy="95" r="16" fill="none" stroke="#9FC4E8" strokeWidth="9" />
                <rect fill="#9FC4E8" x="158" y="88" width="52" height="12" rx="3" />
                <rect fill="#9FC4E8" x="200" y="80" width="12" height="26" rx="2" />
              </g>
              <circle cx="180" cy="185" r="14" fill="#F5F3EE" />
              <path d="M173 185 L178 190 L188 178" stroke="var(--accent-blue)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* right: text */}
        <div className="order-2">
          <p
            className="text-[11px] tracking-[0.18em] uppercase mb-3"
            style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}
          >
            About FixIt
          </p>
          <h1
            className="text-3xl sm:text-4xl mb-6"
            style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: 'var(--ink)' }}
          >
            Maintenance requests, simplified.
          </h1>

          <ul className="space-y-3 mb-8 max-w-md">
            <li className="flex items-start gap-3">
              <span
                className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(44,74,124,0.1)' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="var(--accent-blue)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-sm leading-snug" style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}>
                No account needed to report an issue — just describe it and submit.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span
                className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(44,74,124,0.1)' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="var(--accent-blue)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-sm leading-snug" style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}>
                Each report is automatically prioritized and sent to the manager&apos;s board.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span
                className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(44,74,124,0.1)' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="var(--accent-blue)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-sm leading-snug" style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}>
                Creating an account is optional — it lets you track your tickets and lets you get notified by email when their status changes.
              </span>
            </li>
          </ul>

          <a href="/submit-ticket"
            className="inline-flex items-center gap-2 text-sm px-6 py-3 rounded-md transition hover:opacity-90"
            style={{ background: 'var(--slate)', color: '#F5F3EE', fontFamily: 'var(--font-inter)' }}
          >
            Report an issue{" "}
            <span aria-hidden>→</span>
          </a>
        </div>
      </section>
    </div>
  );
}