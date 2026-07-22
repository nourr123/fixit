'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '../components/SiteNav';

type Role = 'tenant' | 'manager';
const API_URL = 'http://localhost:3000';

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('role') as Role) || 'tenant';

  const [role, setRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      setStatus('sent');
    } catch (err) {
      console.error(err);
      setStatus('sent');
    }
  };

  return (
    <div
      className="w-full max-w-sm bg-white p-8"
      style={{ border: '1px solid var(--line)', boxShadow: '0 1px 2px rgba(35,40,46,0.04)' }}
    >
      <h1
        className="text-2xl mb-2"
        style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600, color: 'var(--ink)' }}
      >
        Reset your password
      </h1>

      {status === 'sent' ? (
        <>
          <p className="text-sm mb-6" style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}>
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a link to reset your password.
            Check your inbox (and spam folder).
          </p>
          <Link
            href="/login"
            className="block text-center text-sm underline"
            style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-inter)' }}
          >
            Back to login
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm mb-6" style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}>
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          <div className="grid grid-cols-2 gap-1 p-1 rounded-md mb-6" style={{ background: '#EDEAE1' }}>
            <button
              type="button"
              onClick={() => setRole('tenant')}
              className="py-2 text-sm font-medium rounded-sm transition-all"
              style={{
                fontFamily: 'var(--font-inter)',
                background: role === 'tenant' ? '#FFFFFF' : 'transparent',
                color: role === 'tenant' ? 'var(--ink)' : 'var(--slate)',
                boxShadow: role === 'tenant' ? '0 1px 2px rgba(35,40,46,0.08)' : 'none',
              }}
            >
              Tenant
            </button>
            <button
              type="button"
              onClick={() => setRole('manager')}
              className="py-2 text-sm font-medium rounded-sm transition-all"
              style={{
                fontFamily: 'var(--font-inter)',
                background: role === 'manager' ? '#FFFFFF' : 'transparent',
                color: role === 'manager' ? 'var(--ink)' : 'var(--slate)',
                boxShadow: role === 'manager' ? '0 1px 2px rgba(35,40,46,0.08)' : 'none',
              }}
            >
              Manager
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--slate)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-base bg-transparent outline-none focus:ring-2 rounded-sm transition"
                style={{ border: '1px solid var(--line)', color: 'var(--ink)', fontFamily: 'var(--font-inter)' }}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 text-sm font-medium rounded-sm transition disabled:opacity-50"
              style={{ background: 'var(--slate)', color: '#F5F3EE', fontFamily: 'var(--font-inter)' }}
            >
              {status === 'loading' ? 'Sending…' : 'Send reset link'}
            </button>

            <Link
              href="/login"
              className="block text-center text-sm underline"
              style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}
            >
              Back to login
            </Link>
          </form>
        </>
      )}
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--paper, #F5F3EE)' }}>
      <SiteNav />
      <div className="flex-1 flex items-center justify-center px-4 min-h-0">
        <Suspense fallback={null}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}