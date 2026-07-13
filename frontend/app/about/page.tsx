import Image from 'next/image';
import SiteNav from '../components/SiteNav';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
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

      <section className="max-w-5xl mx-auto px-6 lg:px-10 flex-1 grid md:grid-cols-2 gap-10 items-center py-16 relative">
        {/* left: image in a circle */}
        <div className="flex justify-center md:justify-start order-1">
          <div
            className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full overflow-hidden flex items-center justify-center"
            style={{ border: '1px solid var(--line)', background: 'var(--accent-blue)' }}
          >
            <Image
              src="/about-illustration.png"
              alt="About FixIt"
              fill
              className="object-contain p-6"
              priority
            />
          </div>
        </div>

        {/* right: text */}
        <div className="order-2">
          <h1
            className="text-3xl sm:text-4xl mb-5"
            style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: 'var(--ink)' }}
          >
            About Us
          </h1>
          <p
            className="text-sm leading-relaxed max-w-md mb-8"
            style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}
          >
            FixIt reads every tenant report the moment it arrives, ranks it by
            urgency, and puts it straight on the manager&apos;s board — no
            accounts, no paperwork, nothing lost in an inbox.
          </p>
          <a
            href="/submit-ticket"
            className="inline-block text-sm px-6 py-3 rounded-md transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent-blue)', color: '#FFFFFF', fontFamily: 'var(--font-inter)' }}
          >
            Report an Issue
          </a>
        </div>
      </section>
    </div>
  );
}
