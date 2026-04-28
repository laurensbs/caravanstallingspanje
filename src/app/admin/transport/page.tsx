'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Mail, Phone, Calendar, Trash2, Truck, ArrowRight, MapPin, CheckCircle2, Ban,
  Plus, ChevronDown, Refrigerator, Warehouse,
} from 'lucide-react';
import { Button, Badge, Skeleton, Select, Input } from '@/components/ui';
import PageHeader from '@/components/admin/PageHeader';
import Drawer from '@/components/Drawer';
import CampingPicker from '@/components/CampingPicker';

type Entry = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  from_location: string;
  to_location: string;
  preferred_date: string | null;
  return_date: string | null;
  camping: string | null;
  registration: string | null;
  brand: string | null;
  model: string | null;
  notes: string | null;
  status: string;
  created_via?: string;
  created_at: string;
};

type CustomerOverview = {
  fridges: Array<{
    id: number;
    name: string;
    device_type: string;
    bookings: Array<{
      id: number;
      camping: string | null;
      spot_number: string | null;
      start_date: string | null;
      end_date: string | null;
      status: string;
      holded_invoice_number: string | null;
    }>;
  }>;
  stalling: Array<{
    id: number;
    type: string;
    start_date: string;
    end_date: string | null;
    status: string;
    registration: string | null;
  }>;
  otherTransports: Array<{
    id: number;
    camping: string | null;
    preferred_date: string | null;
    return_date: string | null;
    status: string;
    created_via: string;
  }>;
};

const STATUS_OPTIONS = [
  { value: 'controleren', label: 'Controleren', tone: 'warning' as const },
  { value: 'gepland', label: 'Gepland', tone: 'accent' as const },
  { value: 'uitgevoerd', label: 'Uitgevoerd', tone: 'success' as const },
  { value: 'afgewezen', label: 'Afgewezen', tone: 'danger' as const },
];

function fmtDate(s: string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('nl-NL', opts || { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusTone(status: string): 'warning' | 'success' | 'accent' | 'danger' | 'neutral' {
  return STATUS_OPTIONS.find((s) => s.value === status)?.tone ?? 'neutral';
}

const emptyForm = {
  name: '', email: '', phone: '', camping: '',
  outbound_date: '', return_date: '',
  registration: '', brand: '', model: '', notes: '',
};

export default function TransportPage() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [filter, setFilter] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [overviewCache, setOverviewCache] = useState<Record<string, CustomerOverview>>({});

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

  useEffect(() => { load(); }, [load]);

  const action = async (id: number, body: object, msg: string) => {
    const res = await fetch('/api/admin/transport', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...body }),
      credentials: 'include',
    });
    if (!res.ok) { toast.error('Kon actie niet uitvoeren'); return; }
    toast.success(msg);
    load();
  };

  const submitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Kon transport niet aanmaken');
        return;
      }
      toast.success('Transport toegevoegd');
      setForm(emptyForm);
      setDrawerOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = async (e: Entry) => {
    if (expandedId === e.id) { setExpandedId(null); return; }
    setExpandedId(e.id);
    if (!overviewCache[e.email]) {
      try {
        const r = await fetch(`/api/admin/customer-overview?email=${encodeURIComponent(e.email)}`, { credentials: 'include' });
        const d = await r.json();
        setOverviewCache((c) => ({ ...c, [e.email]: d }));
      } catch { /* ignore */ }
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Operatie"
        title="Transport"
        description="Aanvragen voor ophalen of brengen van caravans."
        actions={
          <div className="flex gap-2 items-center">
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="min-w-[160px]">
              <option value="">Alle statussen</option>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
            <Button onClick={() => setDrawerOpen(true)}>
              <Plus size={14} /> Transport toevoegen
            </Button>
          </div>
        }
      />

      {entries === null ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" delayMs={i * 40} />)}
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
            {entries.map((e) => {
              const overview = overviewCache[e.email];
              const isExpanded = expandedId === e.id;
              return (
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
                        {e.created_via === 'admin' && (
                          <Badge tone="neutral">Handmatig</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted mt-1">
                        Aangemeld op {fmtDate(e.created_at)}
                      </p>
                    </div>

                    <div className="flex gap-1 shrink-0 items-center">
                      {e.status === 'controleren' && (
                        <>
                          <Button size="sm" variant="secondary"
                            onClick={() => action(e.id, { action: 'set-status', status: 'gepland' }, 'Ingepland')}>
                            <CheckCircle2 size={12} /> Inplannen
                          </Button>
                          <Button size="sm" variant="ghost"
                            onClick={() => action(e.id, { action: 'set-status', status: 'afgewezen' }, 'Afgewezen')}>
                            <Ban size={12} /> Afwijzen
                          </Button>
                        </>
                      )}
                      {e.status === 'gepland' && (
                        <Button size="sm" variant="secondary"
                          onClick={() => action(e.id, { action: 'set-status', status: 'uitgevoerd' }, 'Voltooid')}>
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
                      Heen: {fmtDate(e.preferred_date)}{e.return_date ? ` · Terug: ${fmtDate(e.return_date)}` : ''}
                    </span>
                    <a href={`mailto:${e.email}`} className="flex items-center gap-1.5 text-text hover:text-text">
                      <Mail size={12} className="text-text-subtle shrink-0" />
                      {e.email}
                    </a>
                    {e.phone && (
                      <a href={`tel:${e.phone}`} className="flex items-center gap-1.5 text-text hover:text-text">
                        <Phone size={12} className="text-text-subtle shrink-0" />
                        {e.phone}
                      </a>
                    )}
                  </div>

                  {(e.registration || e.brand || e.model) && (
                    <p className="text-[12px] text-text-muted mt-3">
                      Caravan: {[e.brand, e.model, e.registration].filter(Boolean).join(' · ') || '—'}
                    </p>
                  )}

                  {e.notes && (
                    <p className="text-[12px] text-text-muted italic mt-3 pt-3 border-t border-border">
                      {e.notes}
                    </p>
                  )}

                  <button
                    onClick={() => toggleExpand(e)}
                    className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-text-muted hover:text-text transition-colors"
                  >
                    <ChevronDown size={13} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    Klant 360°{overview ? ` (${overview.fridges.reduce((a, f) => a + f.bookings.length, 0)} koelkast/airco · ${overview.stalling.length} stalling · ${overview.otherTransports.length - 1 >= 0 ? overview.otherTransports.length - 1 : 0} andere transporten)` : ''}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden mt-4 pt-4 border-t border-border"
                      >
                        <CustomerOverviewView overview={overview} currentTransportId={e.id} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Nieuw transport" width={580}>
        <form onSubmit={submitNew} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Naam" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="E-mail" type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Telefoon" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <div>
              <label className="block text-xs font-medium text-text mb-1.5">Camping <span className="text-text-subtle">*</span></label>
              <CampingPicker value={form.camping} onChange={(v) => setForm({ ...form, camping: v })}
                placeholder="Bijv. Eurocamping" required ariaLabel="Camping" />
            </div>
            <Input label="Heen-datum" type="date" required value={form.outbound_date}
              onChange={(e) => setForm({ ...form, outbound_date: e.target.value })} />
            <Input label="Terug-datum" type="date" required value={form.return_date}
              onChange={(e) => setForm({ ...form, return_date: e.target.value })} />
            <Input label="Kenteken" value={form.registration}
              onChange={(e) => setForm({ ...form, registration: e.target.value })} />
            <Input label="Merk" value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            <Input label="Model" value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text mb-1.5">Notities</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setDrawerOpen(false)}>Annuleren</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Bezig…' : 'Opslaan'}</Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}

function CustomerOverviewView({ overview, currentTransportId }: { overview?: CustomerOverview; currentTransportId: number }) {
  if (!overview) {
    return <Skeleton className="h-16 w-full" />;
  }
  const totalBookings = overview.fridges.reduce((acc, f) => acc + f.bookings.length, 0);
  if (overview.fridges.length === 0 && overview.stalling.length === 0 && overview.otherTransports.length <= 1) {
    return <p className="text-[12px] text-text-muted">Geen andere diensten gekoppeld aan dit e-mailadres.</p>;
  }
  return (
    <div className="space-y-4">
      {totalBookings > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-2 flex items-center gap-1.5">
            <Refrigerator size={12} /> Koelkast / Airco
          </h4>
          <div className="space-y-1.5">
            {overview.fridges.flatMap((f) =>
              f.bookings.map((b) => (
                <div key={b.id} className="flex items-center gap-3 text-[13px] py-1.5 px-2 rounded-[var(--radius-sm)] bg-surface-2">
                  <span className="font-medium">{f.device_type}</span>
                  <span className="text-text-muted">·</span>
                  <span className="text-text-muted truncate flex-1">
                    {b.start_date ? fmtDate(b.start_date) : '—'} → {b.end_date ? fmtDate(b.end_date) : '—'}
                  </span>
                  <Badge tone={b.status === 'compleet' ? 'success' : 'warning'}>{b.status}</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {overview.stalling.length > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-2 flex items-center gap-1.5">
            <Warehouse size={12} /> Stalling
          </h4>
          <div className="space-y-1.5">
            {overview.stalling.map((s) => (
              <div key={s.id} className="flex items-center gap-3 text-[13px] py-1.5 px-2 rounded-[var(--radius-sm)] bg-surface-2">
                <span className="font-medium capitalize">{s.type}</span>
                <span className="text-text-muted">·</span>
                <span className="text-text-muted truncate flex-1">
                  Start {fmtDate(s.start_date)}{s.registration ? ` · ${s.registration}` : ''}
                </span>
                <Badge tone={s.status === 'akkoord' || s.status === 'betaald' ? 'success' : 'warning'}>{s.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      {overview.otherTransports.filter((t) => t.id !== currentTransportId).length > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-2 flex items-center gap-1.5">
            <Truck size={12} /> Andere transporten
          </h4>
          <div className="space-y-1.5">
            {overview.otherTransports
              .filter((t) => t.id !== currentTransportId)
              .map((t) => (
                <div key={t.id} className="flex items-center gap-3 text-[13px] py-1.5 px-2 rounded-[var(--radius-sm)] bg-surface-2">
                  <span className="text-text-muted truncate flex-1">
                    {t.camping || '—'} · {fmtDate(t.preferred_date)}
                  </span>
                  <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
