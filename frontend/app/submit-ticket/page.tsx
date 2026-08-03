'use client';

import { useState, useEffect, useRef } from 'react';
import SiteNav from '../components/SiteNav';

type Signal = 'idle' | 'loading' | 'low' | 'medium' | 'high';

const API_URL = 'http://localhost:3000';
const DEBOUNCE_MS = 900;
const MIN_LENGTH = 8;

const SIGNAL_META: Record<Signal, { label: string; color: string; note: string }> = {
  idle: { label: '—', color: '#A9A296', note: 'Keep describing the issue to get a priority read.' },
  loading: { label: '…', color: '#A9A296', note: 'Analyzing…' },
  low: { label: 'Low', color: 'var(--low)', note: 'Reads as routine. A manager will confirm.' },
  medium: { label: 'Medium', color: 'var(--medium)', note: 'Reads as non-urgent but active. A manager will confirm.' },
  high: { label: 'High', color: 'var(--high)', note: 'Reads as urgent. Flagged for immediate review.' },
};

export default function SubmitTicketPage() {
  const [tenantName, setTenantName] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [signal, setSignal] = useState<Signal>('idle');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  // Detect a logged-in tenant and pre-fill their name
  useEffect(() => {
    const token = localStorage.getItem('fixit_tenant_token');
    if (token) {
      setIsLoggedIn(true);
      setTenantName(localStorage.getItem('fixit_tenant_name') || '');
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (description.trim().length < MIN_LENGTH) {
      setSignal('idle');
      return;
    }

    setSignal('loading');
    const currentRequestId = ++requestIdRef.current;

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/tickets/preview-priority`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description }),
        });
        if (!res.ok) throw new Error('Preview failed');
        const data = await res.json();

        if (currentRequestId !== requestIdRef.current) return;

        let mapped: Signal;
        if (data.priority === 'High') {
          mapped = 'high';
        } else if (data.priority === 'Low') {
          mapped = 'low';
        } else {
          mapped = 'medium';
        }
        setSignal(mapped);
      } catch (err) {
        console.error(err);
        if (currentRequestId === requestIdRef.current) {
          setSignal('idle');
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [description]);

  const meta = SIGNAL_META[signal];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const token = localStorage.getItem('fixit_tenant_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tenant_name: tenantName,
          unit_number: unitNumber,
          description,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit ticket');
      setStatus('success');
      if (!isLoggedIn) {
        setTenantName('');
      }
      setUnitNumber('');
      setDescription('');
      setSignal('idle');
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
          className="w-full max-w-md bg-white relative"
          style={{ border: '1px solid var(--line)', boxShadow: '0 1px 2px rgba(35,40,46,0.04)' }}
        >
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ background: 'var(--slate)', color: '#F5F3EE' }}
          >
            <div>
              <p
                className="text-[10px] tracking-[0.18em] uppercase opacity-70"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Maintenance Work Order
              </p>
              <h1
                className="text-xl mt-0.5"
                style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
              >
                Report an Issue
              </h1>
            </div>
            <span
              className="text-[11px] px-2 py-1 rounded-sm"
              style={{
                fontFamily: 'var(--font-mono)',
                background: 'rgba(245,243,238,0.12)',
                border: '1px solid rgba(245,243,238,0.25)',
              }}
            >
              NO. ____
            </span>
          </div>

          <div className="relative h-0 border-t border-dashed" style={{ borderColor: 'var(--line)' }}>
            <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full" style={{ background: 'var(--paper)' }} />
            <div className="absolute -right-2 -top-2 w-4 h-4 rounded-full" style={{ background: 'var(--paper)' }} />
          </div>

          {isLoggedIn && (
            <div
              className="mx-6 mt-4 px-3 py-2 rounded-sm text-xs"
              style={{ background: 'rgba(44,74,124,0.06)', color: 'var(--accent-blue)', fontFamily: 'var(--font-inter)' }}
            >
              Signed in as {tenantName} — this ticket will be linked to your account.
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-3.5">
            <div>
              <label htmlFor="tenantName" className="block text-[11px] uppercase tracking-wide mb-1" style={{ color: 'var(--slate)' }}>
                Tenant name
              </label>
              <input
                id="tenantName"
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                required
                readOnly={isLoggedIn}
                placeholder="Full name"
                className="w-full px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 rounded-sm transition"
                style={{
                  border: '1px solid var(--line)',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-inter)',
                  opacity: isLoggedIn ? 0.7 : 1,
                }}
              />
            </div>

            <div>
              <label htmlFor="unitNumber" className="block text-[11px] uppercase tracking-wide mb-1" style={{ color: 'var(--slate)' }}>
                Unit number
              </label>
              <input
                id="unitNumber"
                type="text"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                required
                placeholder="e.g. 4B"
                className="w-full px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 rounded-sm transition"
                style={{ border: '1px solid var(--line)', color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="description" className="block text-[11px] uppercase tracking-wide" style={{ color: 'var(--slate)' }}>
                  Describe the issue
                </label>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                      signal === 'loading' ? 'animate-pulse' : ''
                    }`}
                    style={{ background: meta.color }}
                  />
                  <span className="text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: meta.color }}>
                    {meta.label}
                  </span>
                </div>
              </div>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                placeholder="What's happening, and since when?"
                className="w-full px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 rounded-sm transition resize-none"
                style={{ border: '1px solid var(--line)', color: 'var(--ink)', fontFamily: 'var(--font-inter)' }}
              />
              <p className="text-[11px] mt-1 leading-snug" style={{ color: '#8A8478' }}>
                {meta.note}
              </p>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2.5 text-sm font-medium rounded-sm transition disabled:opacity-50"
              style={{ background: 'var(--slate)', color: '#F5F3EE', fontFamily: 'var(--font-inter)' }}
            >
              {status === 'loading' ? 'Submitting…' : 'Submit Work Order'}
            </button>

            {status === 'success' && (
              <p className="text-sm text-center" style={{ color: 'var(--low)' }}>
                Ticket logged. Your property manager has been notified.
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm text-center" style={{ color: 'var(--high)' }}>
                Couldn&apos;t submit. Check your connection and try again.
              </p>
            )}

            {!isLoggedIn && (
              <p className="text-[12px] text-center" style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}>
                Log in or create an account to track this ticket later.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}