'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '../components/SiteNav';

type Role = 'tenant' | 'manager';
const API_URL = 'http://localhost:3000';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.6 19.6 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a19.7 19.7 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const role = (searchParams.get('role') as Role) || 'tenant';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, role, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'This reset link is invalid or has expired.');
      }
      setStatus('success');
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong.');
      setStatus('error');
    }
  };

  if (!token) {
    return (
      <p className="text-sm text-center" style={{ color: 'var(--high)', fontFamily: 'var(--font-inter)' }}>
        This reset link is missing or invalid.{' '}
        <Link href="/forgot-password" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>
          Request a new one
        </Link>
      </p>
    );
  }

  return (
    <div
      className="w-full max-w-sm bg-white p-8"
      style={{ border: '1px solid var(--line)', boxShadow: '0 1px 2px rgba(35,40,46,0.04)' }}
    >
      <h1
        className="text-2xl mb-2"
        style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600, color: 'var(--ink)' }}
      >
        Set a new password
      </h1>

      {status === 'success' ? (
        <p className="text-sm" style={{ color: 'var(--low)', fontFamily: 'var(--font-inter)' }}>
          Password updated. Redirecting you to login…
        </p>
      ) : (
        <>
          <p className="text-sm mb-6" style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}>
            Choose a new password for your {role === 'tenant' ? 'tenant' : 'manager'} account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--slate)' }}>
                New password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 pr-11 text-base bg-transparent outline-none focus:ring-2 rounded-sm transition"
                  style={{ border: '1px solid var(--line)', color: 'var(--ink)', fontFamily: 'var(--font-inter)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--slate)' }}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[12px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--slate)' }}>
                Confirm password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Repeat your password"
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
              {status === 'loading' ? 'Updating…' : 'Update password'}
            </button>

            {status === 'error' && (
              <p className="text-sm text-center" style={{ color: 'var(--high)' }}>
                {errorMsg}
              </p>
            )}
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--paper, #F5F3EE)' }}>
      <SiteNav />
      <div className="flex-1 flex items-center justify-center px-4 min-h-0">
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}