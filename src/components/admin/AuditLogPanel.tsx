'use client';

import { useEffect, useState } from 'react';
import { Activity, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import EmptyState from './EmptyState';
import { Skeleton } from '@/components/ui';

// Audit-log paneel — toont laatste activity_log entries. Gebruikt op
// /admin/instellingen voor compliance-zicht ("wie deed wat wanneer").
//
// Wat we tonen:
//   - tijdstempel (relative + tooltip met absolute)
//   - actor (admin-naam, of "system" voor cron/webhook)
//   - actie (vrije tekst, NL)
//   - entity-type + id (collapsable details)
//
// Auto-refresh elke 30s zolang het paneel zichtbaar is — geen polling-storm.

type Event = {
  id: number;
  actor: string | null;
  role: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  entity_label: string | null;
  details: string | null;
  created_at: string;
};

const REFRESH_MS = 30_000;

export default function AuditLogPanel({ limit = 50 }: { limit?: number }) {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  async function load() {
    setRefreshing(true);
    try {
      const r = await fetch(`/api/admin/activity?limit=${limit}`, { credentials: 'include' });
      const d = await r.json();
      setEvents(Array.isArray(d.events) ? d.events : []);
    } catch {
      setEvents([]);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-sm font-semibold inline-flex items-center gap-2">
            <Activity size={14} /> Audit-log
          </h2>
          <p className="text-[12px] text-text-muted mt-0.5">
            Laatste {limit} acties — automatisch ververst, klik op een rij voor details.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={refreshing}
          aria-label="Vernieuwen"
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[var(--radius-md)] border border-border bg-surface hover:border-border-strong text-[12px] disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Laden…' : 'Vernieuwen'}
        </button>
      </div>

      {events === null ? (
        <div className="space-y-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10" delayMs={i * 30} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="Nog geen activiteit"
          description="Acties op klanten, betalingen en webhook-events verschijnen hier."
          icon={Activity}
        />
      ) : (
        <ul className="card-surface divide-y divide-border">
          {events.map((e) => {
            const isOpen = expanded.has(e.id);
            const time = new Date(e.created_at);
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => toggle(e.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left px-3 py-2.5 flex items-start gap-3 hover:bg-surface-2 transition-colors"
                >
                  <span aria-hidden className="mt-0.5 text-text-subtle shrink-0">
                    {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-[13px] font-medium truncate">{e.action}</span>
                      {e.entity_label && (
                        <span className="text-[12px] text-text-muted truncate">· {e.entity_label}</span>
                      )}
                    </div>
                    <div className="text-[11px] text-text-subtle mt-0.5 flex flex-wrap gap-x-2">
                      <time dateTime={e.created_at} title={time.toLocaleString('nl-NL')}>
                        {relativeTime(time)}
                      </time>
                      <span aria-hidden>·</span>
                      <span>{e.actor || 'systeem'}</span>
                      {e.entity_type && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="font-mono">{e.entity_type}{e.entity_id ? `#${e.entity_id}` : ''}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
                {isOpen && e.details && (
                  <div className="px-3 pb-3 pl-9">
                    <pre className="text-[11px] bg-surface-2 border border-border rounded p-2 whitespace-pre-wrap break-words font-mono text-text-muted">
                      {e.details}
                    </pre>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const sec = Math.round(diffMs / 1000);
  if (sec < 60) return `${sec}s geleden`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min geleden`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} uur geleden`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day} dag${day === 1 ? '' : 'en'} geleden`;
  return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}
