'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '../components/SiteNav';

const API_URL = 'http://localhost:3000';

type Phase = 'missing-email' | 'sending' | 'sent';

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [phase, setPhase] = useState<Phase>(email ? 'sending' : 'missing-email');

  useEffect(() => {
    if (!email) return;

    const sendResetEmail = async () => {
      try {
        await fetch(`${API_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      } catch (err) {
        console.error(err);
      } finally {
        // Always show the same confirmation, whether or not the account exists.
        setPhase('sent');
      }
    };

    sendResetEmail();
  }, [email]);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--paper, #F5F3EE)' }}>
      <SiteNav />

      <div className="flex-1 flex items-center justify-center px-4 min-h-0">
        <div
          className="w-full max-w-sm bg-white p-8"
          style={{ border: '1px solid var(--line)', boxShadow: '0 1px 2px rgba(35,40,46,0.04)' }}
        >
          {phase === 'missing-email' && (
            <>
              <h1
                className="text-2xl mb-2"
                style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600, color: 'var(--ink)' }}
              >
                Reset your password
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}>
                Please enter your email on the login page first, then select
                &quot;Forgot password?&quot; to receive your reset link.
              </p>
              <Link
                href="/login"
                className="block text-center text-sm px-5 py-2.5 rounded-md"
                style={{ background: 'var(--slate)', color: '#F5F3EE', fontFamily: 'var(--font-inter)' }}
              >
                Back to login
              </Link>
            </>
          )}

          {phase === 'sending' && (
            <>
              <h1
                className="text-2xl mb-2"
                style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600, color: 'var(--ink)' }}
              >
                Reset your password
              </h1>
              <p className="text-sm" style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}>
                Sending your reset link…
              </p>
            </>
          )}

          {phase === 'sent' && (
            <>
              <h1
                className="text-2xl mb-2"
                style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600, color: 'var(--ink)' }}
              >
                Check your inbox
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}>
                If an account exists for <strong>{email}</strong>, an email has
                been sent containing a link to reset your password. The link
                will expire in 1 hour.
              </p>
              <Link
                href="/login"
                className="block text-center text-sm underline"
                style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-inter)' }}
              >
                Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}