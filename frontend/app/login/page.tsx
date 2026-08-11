'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon } from '../components/EyeIcon';
import { AuthLogoPanel } from '../components/AuthLogoPanel';

type Role = 'tenant' | 'manager';

const API_URL = 'http://localhost:3000';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('tenant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const switchRole = (next: Role) => {
    setRole(next);
    setEmail('');
    setPassword('');
    setStatus('idle');
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    const endpoint = role === 'tenant' ? '/auth/tenant/login' : '/auth/manager/login';

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();

      if (role === 'tenant') {
        localStorage.setItem('fixit_tenant_token', data.access_token);
        localStorage.setItem('fixit_tenant_name', data.full_name);
        localStorage.setItem('fixit_tenant_email', data.email);
        router.push('/my-tickets');
      } else {
        localStorage.setItem('fixit_manager_token', data.access_token);
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const forgotPasswordHref = email
    ? `/forgot-password?email=${encodeURIComponent(email)}`
    : '/forgot-password';

  let submitLabel: string;
  if (status === 'loading') {
    submitLabel = 'Signing in…';
  } else if (role === 'tenant') {
    submitLabel = 'Sign in as Tenant';
  } else {
    submitLabel = 'Sign in as Manager';
  }

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
              Sign in to your FixIt account
            </h1>

            <div className="grid grid-cols-2 gap-1 p-1 rounded-md mb-6" style={{ background: '#EDEAE1' }}>
              <button
                type="button"
                onClick={() => switchRole('tenant')}
                className="py-2.5 text-sm font-medium rounded-sm transition-all"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: role === 'tenant' ? '#FFFFFF' : 'transparent',
                  color: role === 'tenant' ? 'var(--ink)' : 'var(--slate)',
                  boxShadow: role === 'tenant' ? '0 1px 2px rgba(35,40,46,0.08)' : 'none',
                }}
              >
                Tenant Login
              </button>
              <button
                type="button"
                onClick={() => switchRole('manager')}
                className="py-2.5 text-sm font-medium rounded-sm transition-all"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: role === 'manager' ? '#FFFFFF' : 'transparent',
                  color: role === 'manager' ? 'var(--ink)' : 'var(--slate)',
                  boxShadow: role === 'manager' ? '0 1px 2px rgba(35,40,46,0.08)' : 'none',
                }}
              >
                Manager Login
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder={role === 'tenant' ? 'you@example.com' : 'you@property.com'}
                  className="w-full px-4 py-3 text-base bg-transparent outline-none focus:ring-2 rounded-sm transition"
                  style={{ border: '1px solid var(--line)', color: 'var(--ink)', fontFamily: 'var(--font-inter)' }}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-[12px] uppercase tracking-wide" style={{ color: 'var(--slate)' }}>
                    Password
                  </label>
                  {role === 'tenant' && (
                    <Link
                      href={forgotPasswordHref}
                      className="text-[12px]"
                      style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-inter)' }}
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
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

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3.5 text-base font-medium rounded-sm transition disabled:opacity-50"
                style={{ background: 'var(--slate)', color: '#F5F3EE', fontFamily: 'var(--font-inter)' }}
              >
                {submitLabel}
              </button>

              {status === 'error' && (
                <p className="text-sm text-center" style={{ color: 'var(--high)' }}>
                  Invalid email or password.
                </p>
              )}

              {role === 'tenant' && (
                <p className="text-sm text-center" style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}>
                  New here?{' '}
                  <Link href="/tenant-register" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>
                    Create an account
                  </Link>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      <AuthLogoPanel />
    </div>
  );
}