'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Mail, Phone, Calendar, Trash2, Truck, ArrowRight, MapPin, CheckCircle2, Ban,
  Plus, ChevronDown, Refrigerator, Warehouse, Pencil,
  FileCheck2, Square, CheckSquare, Receipt, Search, X,
} from 'lucide-react';
import { Button, Badge, Skeleton, Select, Input } from '@/components/ui';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';
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
  outbound_time: string | null;
  return_date: string | null;
  return_time: string | null;
  camping: string | null;
  registration: string | null;
  brand: string | null;
  model: string | null;
  notes: string | null;
  status: string;
  created_via?: string;
  transport_mode?: string | null;
  pickup_location?: string | null;
  created_at: string;
  holded_invoice_id?: string | null;
  holded_invoice_number?: string | null;
  holded_invoice_status?: string | null;
  holded_invoice_url?: string | null;
  paid_at?: string | null;
  sales_invoice_converted_at?: string | null;
  sales_invoice_converted_by?: string | null;
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
  { value: 'controleren', label: 'Review',    tone: 'warning' as const },
  { value: 'betaald',     label: 'Paid',      tone: 'success' as const },
  { value: 'gepland',     label: 'Scheduled', tone: 'accent'  as const },
  { value: 'uitgevoerd',  label: 'Completed', tone: 'success' as const },
  { value: 'afgewezen',   label: 'Rejected',  tone: 'danger'  as const },
];

function fmtDate(s: string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-GB', opts || { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusTone(status: string): 'warning' | 'success' | 'accent' | 'danger' | 'neutral' {
  return STATUS_OPTIONS.find((s) => s.value === status)?.tone ?? 'neutral';
}

function stallingLabel(s: string): string {
  const map: Record<string, string> = {
    controleren: 'Review', akkoord: 'Approved', betaald: 'Paid', afgewezen: 'Rejected',
  };
  return map[s] || s;
}

const emptyForm = {
  name: '', email: '', phone: '', camping: '',
  outbound_date: '', outbound_time: '',
  return_date: '', return_time: '',
  registration: '', brand: '', model: '', notes: '',
};

export default function TransportPage() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [overviewCache, setOverviewCache] = useState<Record<string, CustomerOverview>>({});

  const visibleEntries = (() => {
    if (!entries) return null;
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      [e.name, e.email, e.phone, e.camping, e.registration, e.brand, e.model]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    );
  })();

  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      const t = ev.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (ev.key === '/') {
        ev.preventDefault();
        document.getElementById('transport-search')?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
    if (!res.ok) { toast.error('Could not perform action'); return; }
    toast.success(msg);
    load();
  };

  const toggleSalesInvoice = async (id: number, converted: boolean) => {
    try {
      const res = await fetch(`/api/admin/transport/${id}/sales-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ converted }),
        credentials: 'include',
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || 'Update failed');
        return;
      }
      toast.success(converted ? 'Marked as converted to sales invoice' : 'Sales invoice flag cleared');
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const openEdit = (e: Entry) => {
    setEditingId(e.id);
    setForm({
      name: e.name,
      email: e.email,
      phone: e.phone || '',
      camping: e.camping || e.to_location || '',
      outbound_date: e.preferred_date ? e.preferred_date.slice(0, 10) : '',
      outbound_time: e.outbound_time || '',
      return_date: e.return_date ? e.return_date.slice(0, 10) : '',
      return_time: e.return_time || '',
      registration: e.registration || '',
      brand: e.brand || '',
      model: e.model || '',
      notes: e.notes || '',
    });
    setDrawerOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const submitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let res: Response;
      if (editingId) {
        res = await fetch('/api/admin/transport', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, action: 'update', fields: form }),
          credentials: 'include',
        });
      } else {
        res = await fetch('/api/admin/transport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
          credentials: 'include',
        });
      }
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || 'Save failed');
        return;
      }
      toast.success(editingId ? 'Transport updated' : 'Transport added');
      setForm(emptyForm);
      setEditingId(null);
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
        eyebrow="Operations"
        title="Transport"
        description="Requests for caravan pickup or delivery."
        actions={
          <div className="flex gap-2 items-center">
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="min-w-[160px]">
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
            <Button onClick={openCreate}>
              <Plus size={14} /> Add transport
            </Button>
          </div>
        }
      />

      <div className="relative max-w-md mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
        <input
          id="transport-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') setSearch(''); }}
          placeholder="Search by name, email, camping, registration…"
          aria-label="Search transport requests"
          className="w-full h-9 pl-9 pr-9 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors placeholder:text-text-subtle"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} aria-label="Clear" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-text-subtle hover:text-text">
            <X size={12} />
          </button>
        )}
        <kbd className="hidden md:inline-block absolute right-9 top-1/2 -translate-y-1/2 text-[10px] text-text-subtle border border-border rounded px-1.5 py-0.5 pointer-events-none">/</kbd>
      </div>

      {entries === null ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" delayMs={i * 40} />)}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Truck}
          title={filter ? `No requests with status "${filter}"` : 'No transport requests yet'}
          description={filter ? 'Try clearing the filter.' : 'Public bookings will appear here once paid.'}
        />
      ) : visibleEntries && visibleEntries.length === 0 ? (
        <EmptyState
          icon={Search}
          title={`No matches for "${search}"`}
          description="Try a different search term, or press Esc to clear."
        />
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {visibleEntries!.map((e) => {
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
                          <Badge tone="neutral">Manual</Badge>
                        )}
                        {e.transport_mode === 'wij_rijden' && (
                          <Badge tone="accent">We drive</Badge>
                        )}
                        {e.transport_mode === 'zelf' && (
                          <Badge tone="accent">Self</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted mt-1">
                        Submitted on {fmtDate(e.created_at)}
                      </p>
                    </div>

                    <div className="flex gap-1 shrink-0 items-center">
                      {e.status === 'controleren' && (
                        <>
                          <Button size="sm" variant="secondary"
                            onClick={() => action(e.id, { action: 'set-status', status: 'gepland' }, 'Scheduled')}>
                            <CheckCircle2 size={12} /> Schedule
                          </Button>
                          <Button size="sm" variant="ghost"
                            onClick={() => action(e.id, { action: 'set-status', status: 'afgewezen' }, 'Rejected')}>
                            <Ban size={12} /> Reject
                          </Button>
                        </>
                      )}
                      {e.status === 'gepland' && (
                        <Button size="sm" variant="secondary"
                          onClick={() => action(e.id, { action: 'set-status', status: 'uitgevoerd' }, 'Completed')}>
                          <CheckCircle2 size={12} /> Complete
                        </Button>
                      )}
                      <button
                        onClick={() => openEdit(e)}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-[var(--radius-md)] text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => action(e.id, { action: 'delete' }, 'Deleted')}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-[var(--radius-md)] text-text-muted hover:text-danger hover:bg-danger-soft transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
                    {e.transport_mode === 'zelf' ? (
                      <span className="flex items-center gap-2 text-text">
                        <MapPin size={12} className="text-text-subtle shrink-0" />
                        <span className="truncate">
                          <strong>Customer picks up from storage themselves</strong>
                          {e.camping ? ` → ${e.camping}` : ''}
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-text">
                        <MapPin size={12} className="text-text-subtle shrink-0" />
                        <span className="truncate">
                          <strong>We pick up:</strong> {e.pickup_location || e.camping || e.from_location}
                          <ArrowRight size={11} className="inline mx-1 text-text-subtle" />
                          Storage
                        </span>
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-text">
                      <Calendar size={12} className="text-text-subtle shrink-0" />
                      {e.transport_mode === 'zelf' ? 'Visiting:' : 'We drive:'} {fmtDate(e.preferred_date)}{e.outbound_time ? ` ${e.outbound_time}` : ''}
                      {e.return_date ? ` · Return: ${fmtDate(e.return_date)}${e.return_time ? ` ${e.return_time}` : ''}` : ''}
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

                  {e.holded_invoice_id && (
                    <SalesInvoiceStripTransport
                      paidAt={e.paid_at ?? null}
                      holdedPaid={e.holded_invoice_status === 'paid'}
                      holdedNumber={e.holded_invoice_number ?? null}
                      holdedUrl={e.holded_invoice_url ?? null}
                      holdedId={e.holded_invoice_id ?? null}
                      convertedAt={e.sales_invoice_converted_at ?? null}
                      convertedBy={e.sales_invoice_converted_by ?? null}
                      onToggle={(c) => toggleSalesInvoice(e.id, c)}
                    />
                  )}

                  <button
                    onClick={() => toggleExpand(e)}
                    className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-text-muted hover:text-text transition-colors"
                  >
                    <ChevronDown size={13} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    Customer 360°{overview ? ` (${overview.fridges.reduce((a, f) => a + f.bookings.length, 0)} fridge/AC · ${overview.stalling.length} storage · ${overview.otherTransports.length - 1 >= 0 ? overview.otherTransports.length - 1 : 0} other transports)` : ''}
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

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingId ? 'Edit transport' : 'New transport'} width={580}>
        <form onSubmit={submitNew} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Name" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Phone" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <div>
              <label className="block text-xs font-medium text-text mb-1.5">Campsite <span className="text-text-subtle">*</span></label>
              <CampingPicker value={form.camping} onChange={(v) => setForm({ ...form, camping: v })}
                placeholder="e.g. Eurocamping" required ariaLabel="Campsite" />
            </div>
            <Input label="Outbound date" type="date" required value={form.outbound_date}
              onChange={(e) => setForm({ ...form, outbound_date: e.target.value })} />
            <Input label="Outbound time" type="time" value={form.outbound_time}
              onChange={(e) => setForm({ ...form, outbound_time: e.target.value })} />
            <Input label="Return date" type="date" required value={form.return_date}
              onChange={(e) => setForm({ ...form, return_date: e.target.value })} />
            <Input label="Return time" type="time" value={form.return_time}
              onChange={(e) => setForm({ ...form, return_time: e.target.value })} />
            <Input label="Registration" value={form.registration}
              onChange={(e) => setForm({ ...form, registration: e.target.value })} />
            <Input label="Brand" value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            <Input label="Model" value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
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
    return <p className="text-[12px] text-text-muted">No other services linked to this email address.</p>;
  }
  return (
    <div className="space-y-4">
      {totalBookings > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-2 flex items-center gap-1.5">
            <Refrigerator size={12} /> Fridge / AC
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
                  <Badge tone={b.status === 'compleet' ? 'success' : 'warning'}>{b.status === 'compleet' ? 'Complete' : b.status === 'controleren' ? 'Review' : b.status}</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {overview.stalling.length > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-2 flex items-center gap-1.5">
            <Warehouse size={12} /> Storage
          </h4>
          <div className="space-y-1.5">
            {overview.stalling.map((s) => (
              <div key={s.id} className="flex items-center gap-3 text-[13px] py-1.5 px-2 rounded-[var(--radius-sm)] bg-surface-2">
                <span className="font-medium capitalize">{s.type}</span>
                <span className="text-text-muted">·</span>
                <span className="text-text-muted truncate flex-1">
                  From {fmtDate(s.start_date)}{s.registration ? ` · ${s.registration}` : ''}
                </span>
                <Badge tone={s.status === 'akkoord' || s.status === 'betaald' ? 'success' : 'warning'}>{stallingLabel(s.status)}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      {overview.otherTransports.filter((t) => t.id !== currentTransportId).length > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-2 flex items-center gap-1.5">
            <Truck size={12} /> Other transports
          </h4>
          <div className="space-y-1.5">
            {overview.otherTransports
              .filter((t) => t.id !== currentTransportId)
              .map((t) => (
                <div key={t.id} className="flex items-center gap-3 text-[13px] py-1.5 px-2 rounded-[var(--radius-sm)] bg-surface-2">
                  <span className="text-text-muted truncate flex-1">
                    {t.camping || '—'} · {fmtDate(t.preferred_date)}
                  </span>
                  <Badge tone={statusTone(t.status)}>{STATUS_OPTIONS.find((x) => x.value === t.status)?.label || t.status}</Badge>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SalesInvoiceStripTransport({
  paidAt, holdedPaid, holdedNumber, holdedUrl, holdedId, convertedAt, convertedBy, onToggle,
}: {
  paidAt: string | null;
  holdedPaid: boolean;
  holdedNumber: string | null;
  holdedUrl: string | null;
  holdedId?: string | null;
  convertedAt: string | null;
  convertedBy: string | null;
  onToggle: (converted: boolean) => void;
}) {
  const linkUrl = holdedUrl
    ? holdedUrl
    : holdedId ? `https://app.holded.com/sales/proforms#open:proform-${holdedId}` : null;
  const isConverted = !!convertedAt;
  const canToggle = holdedPaid || isConverted;
  const fmt = (s: string | null) =>
    s ? new Date(s).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div
      className={`mt-3 rounded-[var(--radius-md)] border p-3 ${
        isConverted
          ? 'bg-success-soft border-success/30'
          : holdedPaid
            ? 'bg-warning-soft border-warning/30'
            : 'bg-surface-2 border-border'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={() => canToggle && onToggle(!isConverted)}
          disabled={!canToggle}
          className={`mt-0.5 transition-colors ${
            isConverted ? 'text-success' : canToggle ? 'text-warning hover:text-text' : 'text-text-subtle cursor-not-allowed'
          }`}
          title={!canToggle ? 'Available once Holded marks the pro forma as paid' : isConverted ? 'Click to undo' : 'Click to mark as converted'}
        >
          {isConverted ? <CheckSquare size={16} /> : <Square size={16} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-[12px]">
            <FileCheck2 size={12} className={isConverted ? 'text-success' : holdedPaid ? 'text-warning' : 'text-text-subtle'} />
            <span className={`font-medium ${isConverted ? 'text-success' : 'text-text'}`}>
              {isConverted ? 'Converted to sales invoice' : holdedPaid ? 'Needs to be made into sales invoice' : 'Awaiting payment before sales invoice'}
            </span>
            {linkUrl && (
              <a href={linkUrl} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline underline-offset-2 ml-auto">
                <Receipt size={11} /> {holdedNumber || 'Pro forma'}
              </a>
            )}
          </div>
          <div className="text-[11px] text-text-muted mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            {paidAt && <span>Paid {fmt(paidAt)} · via Stripe</span>}
            {isConverted && <span>by {convertedBy || 'admin'} on {fmt(convertedAt)}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
