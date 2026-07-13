'use client';

import { useState, useMemo } from 'react';
import SiteNav from '../components/SiteNav';

type Signal = 'idle' | 'low' | 'medium' | 'high';

const HIGH_WORDS = ['flood', 'fire', 'smoke', 'gas', 'burst', 'no heat', 'no power', 'leak', 'overflow', 'electrical', 'spark', 'ceiling'];
const MEDIUM_WORDS = ['broken', 'not working', 'stopped', 'wont', "won't", 'noise', 'stuck', 'clog'];

function previewSignal(text: string): Signal {
  const t = text.toLowerCase();
  if (t.length < 8) return 'idle';
  if (HIGH_WORDS.some((w) => t.includes(w))) return 'high';
  if (MEDIUM_WORDS.some((w) => t.includes(w))) return 'medium';
  return 'low';
}

const SIGNAL_META: Record<Signal, { label: string; color: string; note: string }> = {
  idle: { label: '—', color: '#A9A296', note: 'Keep describing the issue for a preliminary read.' },
  low: { label: 'Low', color: 'var(--low)', note: 'Reads as routine. A manager will confirm.' },
  medium: { label: 'Medium', color: 'var(--medium)', note: 'Reads as non-urgent but active. A manager will confirm.' },
  high: { label: 'High', color: 'var(--high)', note: 'Reads as urgent. Flagged for immediate review.' },
};

export default function SubmitTicketPage() {
  const [tenantName, setTenantName] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const signal = useMemo(() => previewSignal(description), [description]);
  const meta = SIGNAL_META[signal];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('http://localhost:3000/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_name: tenantName, unit_number: unitNumber, description }),
      });
      if (!res.ok) throw new Error('Failed to submit ticket');
      setStatus('success');
      setTenantName('');
      setUnitNumber('');
      setDescription('');
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
          {/* header */}
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

          {/* perforation line */}
          <div className="relative h-0 border-t border-dashed" style={{ borderColor: 'var(--line)' }}>
            <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full" style={{ background: 'var(--paper)' }} />
            <div className="absolute -right-2 -top-2 w-4 h-4 rounded-full" style={{ background: 'var(--paper)' }} />
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-3.5">
            <div>
              <label className="block text-[11px] uppercase tracking-wide mb-1" style={{ color: 'var(--slate)' }}>
                Tenant name
              </label>
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                required
                placeholder="Full name"
                className="w-full px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 rounded-sm transition"
                style={{ border: '1px solid var(--line)', color: 'var(--ink)', fontFamily: 'var(--font-inter)' }}
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wide mb-1" style={{ color: 'var(--slate)' }}>
                Unit number
              </label>
              <input
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
                <label className="block text-[11px] uppercase tracking-wide" style={{ color: 'var(--slate)' }}>
                  Describe the issue
                </label>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
                    style={{ background: meta.color }}
                  />
                  <span className="text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: meta.color }}>
                    {meta.label}
                  </span>
                </div>
              </div>
              <textarea
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
          </form>
        </div>
      </div>
    </div>
  );
}