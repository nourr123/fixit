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
};

const API_URL = 'http://localhost:3000';
const COLUMNS: Status[] = ['Open', 'In Progress', 'Resolved'];

const PRIORITY_VAR: Record<Priority, string> = {
  High: 'var(--priority-high, #C0392B)',
  Medium: 'var(--priority-medium, #D9A404)',
  Low: 'var(--priority-low, #4C8C4A)',
};

const STATUS_META: Record<Status, { color: string; icon: JSX.Element }> = {
  Open: {
    color: 'var(--accent-blue, #2C4A7C)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 12h4l1.5 3h5L16 12h4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="6" width="18" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  'In Progress': {
    color: 'var(--priority-medium, #D9A404)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path
          d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4l-2.3 2.3-2-2 2.3-2.3z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  Resolved: {
    color: 'var(--priority-low, #4C8C4A)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [hoverColumn, setHoverColumn] = useState<Status | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('fixit_manager_token');
    if (!token) {
      router.push('/login');
      return;
    }
    setCheckedAuth(true);
  }, [router]);

  useEffect(() => {
    if (!checkedAuth) return;

    const loadTickets = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const res = await fetch(`${API_URL}/tickets`);
        if (!res.ok) throw new Error('Failed to load tickets');
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
  }, [checkedAuth]);

  const handleLogout = () => {
    localStorage.removeItem('fixit_manager_token');
    router.push('/login');
  };

  const handleDrop = async (status: Status) => {
    const id = draggedId;
    setDraggedId(null);
    setHoverColumn(null);
    if (id === null) return;

    const previous = tickets;
    const target = tickets.find((t) => t.id === id);
    if (!target || target.status === status) return;

    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));

    try {
      const res = await fetch(`${API_URL}/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
    } catch (err) {
      console.error(err);
      setTickets(previous);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Delete this ticket? This cannot be undone.');
    if (!confirmed) return;

    const previous = tickets;
    setTickets((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`${API_URL}/tickets/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete ticket');
    } catch (err) {
      console.error(err);
      setTickets(previous);
    }
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
      <div
        className="absolute -bottom-32 -left-32 w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{ background: 'var(--medium)', opacity: 0.05, filter: 'blur(10px)' }}
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

        <button
          onClick={handleLogout}
          className="text-sm px-5 py-2.5 rounded-md transition-colors"
          style={{ background: 'var(--ink)', color: '#F5F3EE', fontFamily: 'var(--font-inter)' }}
        >
          Log out
        </button>
      </header>

      <section className="max-w-7xl mx-auto w-full px-6 lg:px-10 flex-1 py-12 relative">
        <h1
          className="text-3xl sm:text-4xl mb-8"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: 'var(--ink)' }}
        >
          Maintenance Board
        </h1>

        {loadError && (
          <div
            className="mb-6 px-4 py-3 rounded-md text-sm"
            style={{ border: '1px solid var(--priority-high, #C0392B)', color: 'var(--priority-high, #C0392B)', fontFamily: 'var(--font-inter)' }}
          >
            Couldn&apos;t load tickets. Check that the backend is running, then refresh.
          </div>
        )}

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}>
            Loading tickets…
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {COLUMNS.map((column) => {
              const columnTickets = tickets.filter((t) => t.status === column);
              const isHover = hoverColumn === column;
              const meta = STATUS_META[column];

              return (
                <div
                  key={column}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setHoverColumn(column);
                  }}
                  onDragLeave={() => setHoverColumn((c) => (c === column ? null : c))}
                  onDrop={() => handleDrop(column)}
                  className="rounded-lg p-4 min-h-[420px] transition-colors"
                  style={{
                    background: isHover ? 'rgba(60, 90, 150, 0.06)' : 'transparent',
                    border: `1px dashed ${isHover ? 'var(--accent-blue)' : 'var(--line)'}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-5 px-1">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: meta.color, color: '#FFFFFF' }}
                      >
                        {meta.icon}
                      </span>
                      <h2
                        className="text-sm tracking-wide uppercase"
                        style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: 'var(--ink)' }}
                      >
                        {column}
                      </h2>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--medium)', color: 'var(--ink)', fontFamily: 'var(--font-inter)' }}
                    >
                      {columnTickets.length}
                    </span>
                  </div>

                  {columnTickets.length === 0 ? (
                    <div
                      className="rounded-md py-8 flex items-center justify-center"
                      style={{ border: '1px dashed var(--line)', color: meta.color, opacity: 0.35 }}
                    >
                      <span style={{ transform: 'scale(1.6)' }}>{meta.icon}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {columnTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          draggable
                          onDragStart={() => setDraggedId(ticket.id)}
                          onDragEnd={() => {
                            setDraggedId(null);
                            setHoverColumn(null);
                          }}
                          className="group relative rounded-md p-4 pl-5 cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5 hover:rotate-[0.4deg]"
                          style={{
                            background: '#FFFFFF',
                            border: ticket.needs_review
                              ? '1px solid var(--priority-medium, #D9A404)'
                              : '1px solid var(--line)',
                            boxShadow: '0 1px 2px rgba(35,40,46,0.05)',
                            opacity: draggedId === ticket.id ? 0.4 : 1,
                          }}
                        >
                          <span
                            className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
                            style={{ background: PRIORITY_VAR[ticket.priority] }}
                          />

                          <button
                            onClick={() => handleDelete(ticket.id)}
                            aria-label="Delete ticket"
                            className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--slate)', background: 'transparent' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = 'var(--priority-high, #C0392B)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = 'var(--slate)';
                            }}
                          >
                            ✕
                          </button>

                          {ticket.needs_review && (
                            <div
                              className="inline-flex items-center gap-1 mb-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                              style={{
                                background: 'rgba(217, 164, 4, 0.12)',
                                color: 'var(--priority-medium, #D9A404)',
                                fontFamily: 'var(--font-inter)',
                              }}
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 9v4M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Needs Review
                            </div>
                          )}

                          <div className="flex items-center justify-between mb-2 pr-4">
                            <span
                              className="text-xs font-semibold"
                              style={{ color: PRIORITY_VAR[ticket.priority], fontFamily: 'var(--font-inter)' }}
                            >
                              {ticket.priority}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}>
                              Unit {ticket.unit_number}
                            </span>
                          </div>

                          <p
                            className="text-sm leading-snug mb-2"
                            style={{ color: 'var(--ink)', fontFamily: 'var(--font-inter)' }}
                          >
                            {ticket.description}
                          </p>

                          <p className="text-xs" style={{ color: 'var(--slate)', fontFamily: 'var(--font-inter)' }}>
                            {ticket.tenant_name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}