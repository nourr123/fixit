import Link from 'next/link';

export default function SiteNav() {
  return (
    <header className="w-full px-6 lg:px-10 py-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <span
          className="w-7 h-7 rounded-sm flex items-center justify-center text-xs font-bold"
          style={{ background: 'var(--slate)', color: '#F5F3EE', fontFamily: 'var(--font-mono)' }}
        >
          F
        </span>
        <span style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }} className="text-lg">
          FixIt
        </span>
      </Link>
      <nav
        className="hidden sm:flex items-center gap-6"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        <Link
          href="/about"
          className="text-base font-medium px-2 py-1.5 transition hover:opacity-70 relative group"
          style={{ color: 'var(--ink)' }}
        >
          About us
          <span
            className="absolute left-2 right-2 -bottom-0.5 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
            style={{ background: 'var(--slate)' }}
          />
        </Link>
        <Link
          href="/login"
          className="text-base font-medium px-5 py-2.5 rounded-sm shadow-sm transition hover:opacity-90 hover:shadow-md"
          style={{ background: 'var(--slate)', color: '#F5F3EE' }}
        >
          Manager login
        </Link>
      </nav>
    </header>
  );
}