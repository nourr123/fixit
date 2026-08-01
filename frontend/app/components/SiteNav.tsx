'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const VISIBLE_ON = ['/', '/about', '/submit-ticket'];

export default function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const showLinks = VISIBLE_ON.includes(pathname);

  const [isTenantLoggedIn, setIsTenantLoggedIn] = useState(false);

  useEffect(() => {
    setIsTenantLoggedIn(!!localStorage.getItem('fixit_tenant_token'));
  }, [pathname]);

  const handleTenantLogout = () => {
    localStorage.removeItem('fixit_tenant_token');
    localStorage.removeItem('fixit_tenant_name');
    localStorage.removeItem('fixit_tenant_email');
    setIsTenantLoggedIn(false);
    router.push('/');
  };

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

      {showLinks && (
        <nav
          className="hidden sm:flex items-center gap-6"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          {isTenantLoggedIn ? (
            <>
              <Link
                href="/my-tickets"
                className="text-base font-medium px-2 py-1.5 transition hover:opacity-70 relative group"
                style={{ color: 'var(--ink)' }}
              >
                My tickets{" "}
                <span
                  className="absolute left-2 right-2 -bottom-0.5 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                  style={{ background: 'var(--slate)' }}
                />
              </Link>
              <button
                onClick={handleTenantLogout}
                className="text-base font-medium px-5 py-2.5 rounded-sm shadow-sm transition hover:opacity-90 hover:shadow-md"
                style={{ background: 'var(--slate)', color: '#F5F3EE' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/about"
                className="text-base font-medium px-2 py-1.5 transition hover:opacity-70 relative group"
                style={{ color: 'var(--ink)' }}
              >
                About us{" "}
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
                Login
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}