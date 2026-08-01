'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Priority = 'High' | 'Medium' | 'Low';
type Status = 'Open' | 'In Progress' | 'Resolved';

type Ticket = {
  id: number;
  tenant_name: string;
  unit_number: string;
  description: string;
  priority: Priority;
  status: Status;
  needs_review: boolean;
  created_at: string;
};

const API_URL = 'http://localhost:3000';

const PRIORITY_VAR: Record<Priority, string> = {
  High: 'var(--priority-high, #C0392B)',
  Medium: 'var(--priority-medium, #D9A404)',
  Low: 'var(--priority-low, #4C8C4A)',
};

const STATUS_LABEL: Record<Status, { color: string; note: string }> = {
  Open: { color: 'var(--accent-blue, #2C4A7C)', note: 'Received, waiting to be picked up.' },
  'In Progress': { color: 'var(--priority-medium, #D9A404)', note: 'A manager is working on it.' },
  Resolved: { color: 'var(--priority-low, #4C8C4A)', note: 'Marked as fixed.' },
};

function EmptyState() {
  return (
    <div
      className="rounded-md p-8 text-center"
      style={{ border: '1px dashed var(--line)', color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}
    >
      <p className="text-sm mb-3">You have not reported any issues yet.</p>
      <a href="/submit-ticket"
        className="inline-block text-sm px-5 py-2.5 rounded-md"
        style={{ background: 'var(--slate)', color: '#F5F3EE' }}
      >
        Report an Issue
      </a>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const statusMeta = STATUS_LABEL[ticket.status];
  const createdDate = new Date(ticket.created_at).toLocaleDateString();

  return (
    <div
      className="relative rounded-md p-4 pl-5"
      style={{ background: '#FFFFFF', border: '1px solid var(--line)', boxShadow: '0 1px 2px rgba(35,40,46,0.05)' }}
    >
      <span
        className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
        style={{ background: PRIORITY_VAR[ticket.priority] }}
      />

      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <span
          className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: statusMeta.color, color: '#FFFFFF', fontFamily: 'var(--font-inter)' }}
        >
          {ticket.status}
        </span>
        <span className="text-xs" style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}>
          Unit {ticket.unit_number} - {createdDate}
        </span>
      </div>

      <p className="text-sm leading-snug mb-2" style={{ color: 'var(--ink)', fontFamily: 'var(--font-inter)' }}>
        {ticket.description}
      </p>

      <p className="text-xs" style={{ color: statusMeta.color, fontFamily: 'var(--font-inter)' }}>
        {statusMeta.note}
      </p>
    </div>
  );
}

export default function MyTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [tenantName, setTenantName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('fixit_tenant_token');
    if (!token) {
      router.push('/login');
      return;
    }
    setTenantName(localStorage.getItem('fixit_tenant_name') || '');
    setCheckedAuth(true);
  }, [router]);

  useEffect(() => {
    if (!checkedAuth) {
      return;
    }

    const loadTickets = async () => {
      setLoading(true);
      setLoadError(false);
      const token = localStorage.getItem('fixit_tenant_token');
      try {
        const res = await fetch(API_URL + '/tickets/mine', {
          headers: { Authorization: 'Bearer ' + token },
        });
        if (res.status === 401) {
          localStorage.removeItem('fixit_tenant_token');
          router.push('/login');
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to load tickets');
        }
        const data: Ticket[] = await res.json();
        setTickets(data);
      } catch (err) {
        console.error(err);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [checkedAuth, router]);

  const handleLogout = () => {
    localStorage.removeItem('fixit_tenant_token');
    localStorage.removeItem('fixit_tenant_name');
    localStorage.removeItem('fixit_tenant_email');
    router.push('/login');
  };

  if (!checkedAuth) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--paper, #F5F3EE)' }}>
      <div
        className="absolute -top-40 -right-40 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: 'var(--accent-blue)', opacity: 0.06, filter: 'blur(10px)' }}
      />

      <header
        className="w-full px-6 lg:px-10 py-5 flex items-center justify-between relative"
        style={{ borderBottom: '1px solid var(--line)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-md flex items-center justify-center text-sm"
            style={{ background: 'var(--ink)', color: '#F5F3EE', fontFamily: 'var(--font-fraunces)', fontWeight: 700 }}
          >
            F
          </span>
          <span style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: 'var(--ink)' }} className="text-lg">
            FixIt
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a href="/submit-ticket"
            className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-md transition hover:opacity-90"
            style={{ background: 'var(--slate)', color: '#F5F3EE', fontFamily: 'var(--font-inter)' }}
          >
            Report an issue{" "}
            <span aria-hidden>→</span>
          </a>
          <button
            onClick={handleLogout}
            className="text-sm px-5 py-2.5 rounded-md transition-colors hover:opacity-90"
            style={{ background: 'var(--slate)', color: '#F5F3EE', fontFamily: 'var(--font-inter)' }}
          >
            Log out
          </button>
        </div>
      </header>

      <section className="max-w-3xl mx-auto w-full px-6 lg:px-10 flex-1 py-12 relative">
        <h1
          className="text-3xl sm:text-4xl mb-2"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: 'var(--ink)' }}
        >
          My Reported Issues
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}>
          {tenantName ? 'Signed in as ' + tenantName : ''}
        </p>

        {loadError ? (
          <div
            className="mb-6 px-4 py-3 rounded-md text-sm"
            style={{ border: '1px solid var(--priority-high, #C0392B)', color: 'var(--priority-high, #C0392B)', fontFamily: 'var(--font-inter)' }}
          >
            Could not load your tickets. Check that the backend is running, then refresh.
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}>
            Loading your tickets...
          </p>
        ) : null}

        {!loading && tickets.length === 0 ? <EmptyState /> : null}

        {!loading && tickets.length > 0 ? (
          <div className="flex flex-col gap-3">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}