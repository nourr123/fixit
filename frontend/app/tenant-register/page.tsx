'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLogoPanel } from '../components/AuthLogoPanel';

const API_URL = 'http://localhost:3000';

export default function TenantRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/auth/tenant/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Registration failed');
      }
      const data = await res.json();
      localStorage.setItem('fixit_tenant_token', data.access_token);
      localStorage.setItem('fixit_tenant_name', data.full_name);
      localStorage.setItem('fixit_tenant_email', data.email);
      router.push('/my-tickets');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong. Try again.');
      setStatus('error');
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden" style={{ background: 'var(--paper, #F5F3EE)' }}>
      {/* Left — logo + form panel */}
      <div className="flex-1 min-h-0 flex flex-col order-2 lg:order-1">
        <div className="px-6 lg:px-10 py-6">
          <Link href="/" className="flex items-center gap-2 w-fit">
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
        </div>

        <div className="flex-1 min-h-0 flex items-center justify-center px-6 overflow-y-auto">
          <div className="w-full max-w-sm py-6">
            <h1
              className="text-2xl sm:text-3xl mb-8"
              style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600, color: 'var(--ink)' }}
            >
              Create your FixIt account
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-[12px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--slate)' }}>
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Your full name"
                  className="w-full px-4 py-3 text-base bg-transparent outline-none focus:ring-2 rounded-sm transition"
                  style={{ border: '1px solid var(--line)', color: 'var(--ink)', fontFamily: 'var(--font-inter)' }}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-[12px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--slate)' }}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 text-base bg-transparent outline-none focus:ring-2 rounded-sm transition"
                  style={{ border: '1px solid var(--line)', color: 'var(--ink)', fontFamily: 'var(--font-inter)' }}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[12px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--slate)' }}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 text-base bg-transparent outline-none focus:ring-2 rounded-sm transition"
                  style={{ border: '1px solid var(--line)', color: 'var(--ink)', fontFamily: 'var(--font-inter)' }}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3.5 text-base font-medium rounded-sm transition disabled:opacity-50"
                style={{ background: 'var(--slate)', color: '#F5F3EE', fontFamily: 'var(--font-inter)' }}
              >
                {status === 'loading' ? 'Creating account…' : 'Create Account'}
              </button>

              {status === 'error' && (
                <p className="text-sm text-center" style={{ color: 'var(--high)' }}>
                  {errorMsg}
                </p>
              )}

              <p className="text-sm text-center" style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <AuthLogoPanel />
    </div>
  );
}