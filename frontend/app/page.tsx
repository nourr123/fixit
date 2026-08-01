import Link from 'next/link';
import Image from 'next/image';
import SiteNav from './components/SiteNav';

export default function HomePage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <SiteNav />

      <div className="flex-1 grid lg:grid-cols-2 items-center px-6 lg:px-16 min-h-0 gap-10">
        {/* Left — copy + single CTA */}
        <div className="max-w-md">
          <p
            className="text-[11px] tracking-[0.18em] uppercase mb-4"
            style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}
          >
            Property Maintenance, Simplified
          </p>
          <h1
            className="text-4xl sm:text-5xl leading-tight mb-5"
            style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600, color: 'var(--ink)' }}
          >
            Tell us what&apos;s wrong.
            <br />
            We&apos;ll take it from here.
          </h1>
          <p
            className="text-sm leading-relaxed mb-8"
            style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}
          >
            FixIt reads every maintenance report for urgency the moment it&apos;s
            submitted, then routes it straight to the property manager&apos;s board —
            no tenant account required.
          </p>

          {/* Single CTA — back to the original slate style */}
          <Link
            href="/submit-ticket"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium rounded-sm transition"
            style={{ background: 'var(--slate)', color: '#F5F3EE', fontFamily: 'var(--font-inter)' }}
          >
            Report an issue{" "}
            <span aria-hidden>→</span>
          </Link>

          <div
            className="mt-10 pt-6 flex gap-6"
            style={{ borderTop: '1px solid var(--line)' }}
          >
            {[
              { n: '01', title: 'Submit', text: 'Describe the issue in under a minute' },
              { n: '02', title: 'Auto-triage', text: 'Priority assigned instantly by the parser' },
              { n: '03', title: 'Resolved', text: 'Manager tracks it live on the board' },
            ].map((step, i) => (
              <div key={step.n} className="flex-1 relative">
                <p
                  className="text-[11px] font-semibold mb-1.5"
                  style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}
                >
                  {step.n}
                </p>
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: 'var(--ink)', fontFamily: 'var(--font-inter)' }}
                >
                  {step.title}
                </p>
                <p
                  className="text-[11px] leading-snug"
                  style={{ color: '#8A8478', fontFamily: 'var(--font-inter)' }}
                >
                  {step.text}
                </p>
                {i < 2 && (
                  <span
                    className="hidden lg:block absolute top-1 -right-3 text-xs"
                    style={{ color: 'var(--line)' }}
                  >
                    ›
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right — bigger circular photo */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="relative w-[480px] h-[480px]">
            {/* decorative ring behind the photo */}
            <div
              className="absolute inset-0 rounded-full"
              style={{ border: '1px solid var(--line)', transform: 'scale(1.06)' }}
            />

            {/* the photo itself, clipped to a circle */}
            <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg">
              <Image
                src="/hero-photo.jpg"
                alt="Property maintenance"
                fill
                sizes="480px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}