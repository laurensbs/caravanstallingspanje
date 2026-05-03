'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Calendar, Trash2, Bell, Clock } from 'lucide-react';
import { Button, Badge, Skeleton } from '@/components/ui';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';

type Entry = {
  id: number;
  device_type: string;
  name: string;
  email: string;
  phone: string | null;
  camping: string | null;
  spot_number: string | null;
  start_date: string;
  end_date: string;
  notes: string | null;
  status: string;
  created_at: string;
  notified_at: string | null;
};

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function WachtlijstPage() {
  const [entries, setEntries] = useState<Entry[] | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/waitlist', { credentials: 'include' });
      const d = await r.json();
      setEntries(d.entries || []);
    } catch {
      setEntries([]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const action = async (id: number, type: 'notify' | 'delete') => {
    const res = await fetch('/api/admin/waitlist', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: type }),
      credentials: 'include',
    });
    if (!res.ok) {
      toast.error('Could not perform action');
      return;
    }
    toast.success(type === 'notify' ? 'Marked as notified' : 'Deleted');
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Waitlist"
        description={
          entries === null
            ? 'Loading…'
            : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} for periods where stock was full.`
        }
      />

      {entries === null ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24" delayMs={i * 40} />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No waitlist entries yet"
          description="When someone joins the waitlist for sold-out periods, they appear here."
        />
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {entries.map((e) => {
              const notified = e.status === 'genotificeerd';
              return (
                <motion.li
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="card-surface p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-text">{e.name}</h3>
                        <Badge tone="neutral">{e.device_type}</Badge>
                        {notified && <Badge tone="success">Contacted</Badge>}
                      </div>
                      <p className="text-xs text-text-muted mt-1 inline-flex items-center gap-1">
                        <Clock size={11} /> Submitted on {fmtDate(e.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!notified && (
                        <Button size="sm" variant="secondary" onClick={() => action(e.id, 'notify')}>
                          <Bell size={12} /> Mark
                        </Button>
                      )}
                      <button
                        onClick={() => action(e.id, 'delete')}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-[var(--radius-md)] text-text-muted hover:text-danger hover:bg-danger-soft transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-text">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-text-subtle shrink-0" />
                      {fmtDate(e.start_date)} – {fmtDate(e.end_date)}
                    </span>
                    {e.camping && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-text-subtle shrink-0" />
                        {e.camping}{e.spot_number ? ` · ${e.spot_number}` : ''}
                      </span>
                    )}
                    <a href={`mailto:${e.email}`} className="flex items-center gap-1.5 hover:text-text">
                      <Mail size={12} className="text-text-subtle shrink-0" />
                      {e.email}
                    </a>
                    {e.phone && (
                      <a href={`tel:${e.phone}`} className="flex items-center gap-1.5 hover:text-text">
                        <Phone size={12} className="text-text-subtle shrink-0" />
                        {e.phone}
                      </a>
                    )}
                  </div>
                  {e.notes && (
                    <p className="text-xs text-text-muted italic mt-3 pt-3 border-t border-border">{e.notes}</p>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </>
  );
}
