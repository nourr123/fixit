'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import SiteNav from '../components/SiteNav';

export default function ManagerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('http://localhost:3000/auth/manager/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      localStorage.setItem('fixit_manager_token', data.access_token);
      setStatus('success');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <SiteNav />

      <div className="flex-1 flex items-center justify-center px-4 min-h-0">
        <div
          className="w-full max-w-lg bg-white"
          style={{ border: '1px solid var(--line)', boxShadow: '0 1px 2px rgba(35,40,46,0.04)' }}
        >
          <div
            className="px-8 py-6"
            style={{ background: 'var(--slate-dark)', color: '#F5F3EE' }}
          >
            <p
              className="text-[11px] tracking-[0.18em] uppercase opacity-70"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              Restricted Access
            </p>
            <h1 className="text-2xl mt-1" style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}>
              Manager Login
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
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
                placeholder="you@property.com"
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
                placeholder="••••••••"
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
              {status === 'loading' ? 'Signing in…' : 'Sign in'}
            </button>

            {status === 'success' && (
              <p className="text-sm text-center" style={{ color: 'var(--low)' }}>
                Signed in. Redirecting to your dashboard…
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm text-center" style={{ color: 'var(--high)' }}>
                Invalid email or password.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}