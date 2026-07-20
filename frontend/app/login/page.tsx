'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Role = 'tenant' | 'manager';

const API_URL = 'http://localhost:3000';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('tenant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const switchRole = (next: Role) => {
    setRole(next);
    setEmail('');
    setPassword('');
    setStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

            <div
              className="grid grid-cols-2 gap-1 p-1 rounded-md mb-6"
              style={{ background: '#EDEAE1' }}
            >
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
                <label className="block text-[12px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--slate)' }}>
                  Email
                </label>
                <input
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
                <label className="block text-[12px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--slate)' }}>
                  Password
                </label>
                <input
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
                {status === 'loading' ? 'Signing in…' : role === 'tenant' ? 'Sign in as Tenant' : 'Sign in as Manager'}
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

      {/* Right — logo panel (fond bleu, logo blanc pour contraste) */}
      <div
        className="hidden lg:flex flex-1 min-h-0 items-center justify-center order-1 lg:order-2"
        style={{ background: 'var(--accent-blue)' }}
      >
        <div className="w-[70%] max-w-md">
          <svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <g transform="translate(30,40)">
              <path fill="#FFFFFF" d="M60 0 L120 45 L108 45 L108 110 L12 110 L12 45 L0 45 Z" />
              <rect fill="#9FC4E8" x="48" y="70" width="24" height="40" rx="2" />
              <g transform="translate(35,20) rotate(-35 60 45)">
                <circle cx="60" cy="45" r="14" fill="none" stroke="#9FC4E8" strokeWidth={8} />
                <rect fill="#9FC4E8" x="66" y="40" width="46" height="10" rx="3" />
                <rect fill="#9FC4E8" x="104" y="34" width="10" height="22" rx="2" />
              </g>
            </g>
            <text
              x="175"
              y="105"
              fontSize="58"
              fill="#FFFFFF"
              style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
            >
              Fix<tspan fill="#9FC4E8">It</tspan>
            </text>
            <text
              x="177"
              y="130"
              fontSize="13"
              fill="#C7D6E5"
              letterSpacing="2"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              PROPERTY MAINTENANCE BOARD
            </text>
            <line x1="177" y1="145" x2="470" y2="145" stroke="#C7D6E5" strokeWidth={1.5} strokeDasharray="4 3" />
          </svg>
        </div>
      </div>
    </div>
  );
}