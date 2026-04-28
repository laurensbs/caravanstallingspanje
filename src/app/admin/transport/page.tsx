'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Mail, Phone, Calendar, Trash2, Truck, ArrowRight, MapPin, CheckCircle2, Ban,
} from 'lucide-react';
import { Button, Badge, Skeleton, Select } from '@/components/ui';
import PageHeader from '@/components/admin/PageHeader';

type Entry = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  from_location: string;
  to_location: string;
  preferred_date: string | null;
  registration: string | null;
  brand: string | null;
  model: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: 'controleren', label: 'Controleren', tone: 'warning' as const },
  { value: 'gepland', label: 'Gepland', tone: 'accent' as const },
  { value: 'uitgevoerd', label: 'Uitgevoerd', tone: 'success' as const },
  { value: 'afgewezen', label: 'Afgewezen', tone: 'danger' as const },
];

function fmtDate(s: string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!s) return '—';
  return new Date(s).toLocaleDateString(
    'nl-NL',
    opts || { day: 'numeric', month: 'short', year: 'numeric' }
  );
}

function statusTone(status: string): 'warning' | 'success' | 'accent' | 'danger' | 'neutral' {
  return STATUS_OPTIONS.find((s) => s.value === status)?.tone ?? 'neutral';
}

export default function TransportPage() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter) params.set('status', filter);
      const r = await fetch(`/api/admin/transport?${params}`, { credentials: 'include' });
      const d = await r.json();
      setEntries(d.entries || []);
    } catch {
      setEntries([]);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const action = async (id: number, body: object, msg: string) => {
    const res = await fetch('/api/admin/transport', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...body }),
      credentials: 'include',
    });
    if (!res.ok) {
      toast.error('Kon actie niet uitvoeren');
      return;
    }
    toast.success(msg);
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Operatie"
        title="Transport"
        description="Aanvragen voor ophalen of brengen van caravans."
        actions={
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="min-w-[160px]"
          >
            <option value="">Alle statussen</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        }
      />

      {entries === null ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28" delayMs={i * 40} />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="card-surface p-12 text-center">
          <div className="w-12 h-12 rounded-[var(--radius-2xl)] bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
            <Truck size={18} className="text-text-subtle" />
          </div>
          <p className="text-sm text-text">
            {filter ? `Geen transport-aanvragen met status "${filter}"` : 'Nog geen transport-aanvragen'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {entries.map((e) => (
              <motion.li
                key={e.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="card-surface p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-text">{e.name}</h3>
                      <Badge tone={statusTone(e.status)}>
                        {STATUS_OPTIONS.find((s) => s.value === e.status)?.label || e.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-text-muted mt-1">
                      Aangemeld op {fmtDate(e.created_at)}
                    </p>
                  </div>

                  <div className="flex gap-1 shrink-0 items-center">
                    {e.status === 'controleren' && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            action(e.id, { action: 'set-status', status: 'gepland' }, 'Ingepland')
                          }
                        >
                          <CheckCircle2 size={12} /> Inplannen
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            action(e.id, { action: 'set-status', status: 'afgewezen' }, 'Afgewezen')
                          }
                        >
                          <Ban size={12} /> Afwijzen
                        </Button>
                      </>
                    )}
                    {e.status === 'gepland' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          action(e.id, { action: 'set-status', status: 'uitgevoerd' }, 'Voltooid')
                        }
                      >
                        <CheckCircle2 size={12} /> Voltooid
                      </Button>
                    )}
                    <button
                      onClick={() => action(e.id, { action: 'delete' }, 'Verwijderd')}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-[var(--radius-md)] text-text-muted hover:text-danger hover:bg-danger-soft transition-colors"
                      aria-label="Verwijderen"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
                  <span className="flex items-center gap-2 text-text">
                    <MapPin size={12} className="text-text-subtle shrink-0" />
                    <span className="truncate">{e.from_location}</span>
                    <ArrowRight size={11} className="text-text-subtle shrink-0" />
                    <span className="truncate">{e.to_location}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-text">
                    <Calendar size={12} className="text-text-subtle shrink-0" />
                    Voorkeur: {fmtDate(e.preferred_date)}
                  </span>
                  <a
                    href={`mailto:${e.email}`}
                    className="flex items-center gap-1.5 text-text hover:text-text"
                  >
                    <Mail size={12} className="text-text-subtle shrink-0" />
                    {e.email}
                  </a>
                  {e.phone && (
                    <a
                      href={`tel:${e.phone}`}
                      className="flex items-center gap-1.5 text-text hover:text-text"
                    >
                      <Phone size={12} className="text-text-subtle shrink-0" />
                      {e.phone}
                    </a>
                  )}
                </div>

                {(e.registration || e.brand || e.model) && (
                  <p className="text-[12px] text-text-muted mt-3">
                    Caravan:{' '}
                    {[e.brand, e.model, e.registration].filter(Boolean).join(' · ') || '—'}
                  </p>
                )}

                {e.notes && (
                  <p className="text-[12px] text-text-muted italic mt-3 pt-3 border-t border-border">
                    {e.notes}
                  </p>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </>
  );
}
