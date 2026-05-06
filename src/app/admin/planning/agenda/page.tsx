'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Calendar, Loader2, RefreshCw, Link2, Unlink, ExternalLink, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { Button, Select } from '@/components/ui';

type CalEvent = {
  id: number;
  google_event_id: string;
  summary: string | null;
  description: string | null;
  location: string | null;
  start_time: string | null;
  end_time: string | null;
  all_day: boolean;
  html_link: string | null;
  transport_request_id: number | null;
};
type TransportRow = {
  id: number;
  name: string;
  email: string;
  camping: string | null;
  preferred_date: string | null;
  return_date: string | null;
  status: string;
};

export default function AgendaPage() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [transports, setTransports] = useState<TransportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/calendar-events', { credentials: 'include' });
      const data = await res.json();
      setEvents(data.events || []);
      setTransports(data.transports || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function triggerSync() {
    setSyncing(true);
    setSyncError(null);
    try {
      const res = await fetch('/api/cron/calendar-sync', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) {
        setSyncError(data.error || 'Sync mislukt');
        toast.error(data.error || 'Sync mislukt');
        return;
      }
      toast.success(`Synced — ${data.upserted} nieuw/geüpdate, ${data.deleted} verwijderd${data.errors ? `, ${data.errors} errors` : ''}`);
      await loadData();
    } finally {
      setSyncing(false);
    }
  }

  async function linkEvent(eventId: number, transportId: number | null) {
    const res = await fetch(`/api/admin/calendar-events/${eventId}/link`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transportRequestId: transportId }),
      credentials: 'include',
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast.error(d?.error || 'Koppelen mislukt');
      return;
    }
    setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, transport_request_id: transportId } : e));
    toast.success(transportId ? 'Gekoppeld' : 'Ontkoppeld');
  }

  return (
    <>
      <PageHeader
        eyebrow="Planning"
        title="Google-agenda"
        description="Importeer events uit jullie Google-agenda en koppel ze aan transport-aanvragen."
      />

      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="text-[12px] text-text-muted">
          {events.length} events geïmporteerd · {events.filter((e) => e.transport_request_id).length} gekoppeld aan transport
        </div>
        <div className="flex gap-2">
          <a
            href="/api/admin/google-calendar/auth"
            className="text-[12px] text-text-muted hover:text-text inline-flex items-center gap-1.5"
          >
            <Link2 size={12} /> Re-authenticate Google
          </a>
          <Button variant="secondary" onClick={triggerSync} disabled={syncing}>
            {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Sync agenda
          </Button>
        </div>
      </div>

      {syncError && (
        <div className="mb-6 rounded-md p-3 text-[13px] flex items-start gap-2" style={{ background: 'var(--color-warning-soft)' }}>
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <div>
            <strong>Sync-fout:</strong> {syncError}
            {syncError.includes('GOOGLE_REFRESH_TOKEN') && (
              <p className="mt-1 text-text-muted">
                Bezoek <a href="/api/admin/google-calendar/auth" className="underline">/api/admin/google-calendar/auth</a> om eenmalig consent te geven, plak het refresh-token in Vercel env-vars, redeploy.
              </p>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="card-surface p-8 text-center text-text-muted">
          <Loader2 className="animate-spin inline" />
        </div>
      ) : events.length === 0 ? (
        <div className="card-surface p-8 text-center">
          <Calendar size={32} className="mx-auto text-text-muted mb-3" />
          <h3 className="font-medium mb-1">Nog geen events</h3>
          <p className="text-[13px] text-text-muted">Klik op &quot;Sync agenda&quot; om events uit Google Calendar te importeren.</p>
        </div>
      ) : (
        <div className="card-surface divide-y divide-border">
          {events.map((ev) => {
            const linkedTransport = transports.find((t) => t.id === ev.transport_request_id);
            return (
              <div key={ev.id} className="p-4 flex flex-wrap items-start gap-4 justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Calendar size={13} className="text-text-muted shrink-0" />
                    <strong className="text-[14px]">{ev.summary || '(zonder titel)'}</strong>
                    {ev.html_link && (
                      <a href={ev.html_link} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text">
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                  <div className="text-[12px] text-text-muted mt-1">
                    {ev.start_time ? new Date(ev.start_time).toLocaleString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                    {ev.location ? ` · ${ev.location}` : ''}
                  </div>
                  {ev.description && (
                    <div className="text-[12px] text-text-muted mt-1 line-clamp-2">{ev.description}</div>
                  )}
                  {linkedTransport && (
                    <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 rounded text-[11px]" style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
                      <Link2 size={11} /> Gekoppeld aan #{linkedTransport.id} {linkedTransport.name}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 items-start">
                  <Select
                    value={ev.transport_request_id ? String(ev.transport_request_id) : ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      linkEvent(ev.id, v ? Number(v) : null);
                    }}
                  >
                    <option value="">— niet gekoppeld —</option>
                    {transports.map((t) => (
                      <option key={t.id} value={t.id}>
                        #{t.id} {t.name}{t.camping ? ` · ${t.camping}` : ''}{t.preferred_date ? ` · ${t.preferred_date}` : ''}
                      </option>
                    ))}
                  </Select>
                  {ev.transport_request_id && (
                    <Button variant="ghost" onClick={() => linkEvent(ev.id, null)} title="Ontkoppel">
                      <Unlink size={12} />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
