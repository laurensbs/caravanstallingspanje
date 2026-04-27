'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus, Search, Trash2, Pencil, Calendar, MapPin, Tag, Receipt, Link as LinkIcon,
  AlertCircle, CheckCircle2, ChevronRight,
} from 'lucide-react';
import { Button, Input, Select, Textarea, Badge, Skeleton, Spinner } from '@/components/ui';
import Drawer from '@/components/Drawer';
import ConfirmDialog from '@/components/ConfirmDialog';

type Booking = {
  id: number;
  camping: string | null;
  start_date: string | null;
  end_date: string | null;
  spot_number: string | null;
  status: 'compleet' | 'controleren';
  notes: string | null;
  holded_invoice_id: string | null;
  holded_invoice_number: string | null;
};

type Fridge = {
  id: number;
  name: string;
  email: string | null;
  extra_email: string | null;
  device_type: string;
  notes: string | null;
  holded_contact_id: string | null;
  bookings: Booking[];
};

const emptyFridge = { name: '', email: '', extra_email: '', device_type: 'Grote koelkast', notes: '' };
const emptyBooking: { camping: string; start_date: string; end_date: string; spot_number: string; status: 'compleet' | 'controleren'; notes: string } = {
  camping: '', start_date: '', end_date: '', spot_number: '', status: 'compleet', notes: '',
};

function fmtDate(s: string | null): string {
  if (!s) return '';
  return new Date(s).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

function fmtPeriod(b: Booking): string {
  const start = fmtDate(b.start_date);
  const end = fmtDate(b.end_date);
  if (!start && !end) return '—';
  if (!end) return start;
  return `${start} – ${end}`;
}

function bookingDescription(b: Booking, fridgeName: string): string {
  const camping = b.camping || 'Stalling';
  const period = fmtPeriod(b);
  return `Koelkast huur — ${camping} — ${period} (${fridgeName})`;
}

export default function KoelkastenPage() {
  return (
    <Suspense fallback={<div className="text-text-muted text-sm"><Spinner size={16} /></div>}>
      <KoelkastenContent />
    </Suspense>
  );
}

function KoelkastenContent() {
  const searchParams = useSearchParams();

  const [year, setYear] = useState(0);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [drawerFridge, setDrawerFridge] = useState<Fridge | null>(null);
  const [fridgeForm, setFridgeForm] = useState(emptyFridge);
  const [savingFridge, setSavingFridge] = useState(false);
  const [holdedSyncing, setHoldedSyncing] = useState(false);

  const [bookingDialog, setBookingDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; bookingId?: number }>({ open: false, mode: 'create' });
  const [bookingForm, setBookingForm] = useState(emptyBooking);
  const [savingBooking, setSavingBooking] = useState(false);

  const [invoiceDialog, setInvoiceDialog] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null });
  const [invoiceForm, setInvoiceForm] = useState({ description: '', units: '1', subtotal: '', tax: '21', notes: '' });
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{ type: 'fridge' | 'booking'; id: number } | null>(null);

  // ─── Debounced search ───
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (year > 0) params.set('year', String(year));
      if (statusFilter) params.set('status', statusFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await fetch(`/api/admin/fridges?${params}`, { credentials: 'include' });
      const data = await res.json();
      setFridges(data.fridges || []);
    } catch {
      setFridges([]);
    } finally {
      setLoading(false);
    }
  }, [year, statusFilter, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  const refresh = useCallback(async () => {
    if (drawerFridge) {
      const res = await fetch(`/api/admin/fridges/${drawerFridge.id}`, { credentials: 'include' });
      if (res.ok) {
        const d = await res.json();
        setDrawerFridge(d.fridge);
      }
    }
    load();
  }, [drawerFridge, load]);

  const years = useMemo(() => {
    const set = new Set<number>();
    fridges.forEach(f => f.bookings.forEach(b => { if (b.start_date) set.add(new Date(b.start_date).getFullYear()); }));
    return Array.from(set).sort((a, b) => b - a);
  }, [fridges]);

  // ─── Fridge actions ───
  const openCreate = () => {
    setDrawerMode('create');
    setDrawerFridge(null);
    setFridgeForm(emptyFridge);
    setDrawerOpen(true);
  };

  const openEdit = (f: Fridge) => {
    setDrawerMode('edit');
    setDrawerFridge(f);
    setFridgeForm({
      name: f.name,
      email: f.email || '',
      extra_email: f.extra_email || '',
      device_type: f.device_type,
      notes: f.notes || '',
    });
    setDrawerOpen(true);
  };

  const saveFridge = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingFridge(true);
    try {
      const url = drawerMode === 'edit' && drawerFridge ? `/api/admin/fridges/${drawerFridge.id}` : '/api/admin/fridges';
      const method = drawerMode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fridgeForm),
        credentials: 'include',
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || 'Opslaan mislukt');
        return;
      }
      const data = await res.json().catch(() => ({}));
      toast.success(drawerMode === 'edit' ? 'Klant bijgewerkt' : 'Klant toegevoegd');
      if (drawerMode === 'create' && data.fridge) {
        setDrawerMode('edit');
        setDrawerFridge(data.fridge);
      }
      await refresh();
    } finally {
      setSavingFridge(false);
    }
  };

  const syncHolded = async () => {
    if (!drawerFridge) return;
    setHoldedSyncing(true);
    try {
      const res = await fetch(`/api/admin/fridges/${drawerFridge.id}/holded-contact`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Synchronisatie mislukt');
        return;
      }
      toast.success('Gekoppeld aan Holded');
      await refresh();
    } finally {
      setHoldedSyncing(false);
    }
  };

  // ─── Booking actions ───
  const openNewBooking = () => {
    setBookingForm(emptyBooking);
    setBookingDialog({ open: true, mode: 'create' });
  };

  const openEditBooking = (b: Booking) => {
    setBookingForm({
      camping: b.camping || '',
      start_date: b.start_date ? b.start_date.split('T')[0] : '',
      end_date: b.end_date ? b.end_date.split('T')[0] : '',
      spot_number: b.spot_number || '',
      status: b.status,
      notes: b.notes || '',
    });
    setBookingDialog({ open: true, mode: 'edit', bookingId: b.id });
  };

  const saveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawerFridge) return;
    setSavingBooking(true);
    try {
      const url = bookingDialog.mode === 'edit' && bookingDialog.bookingId
        ? `/api/admin/fridges/bookings/${bookingDialog.bookingId}`
        : `/api/admin/fridges/${drawerFridge.id}/bookings`;
      const method = bookingDialog.mode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingForm),
        credentials: 'include',
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || 'Opslaan mislukt');
        return;
      }
      toast.success(bookingDialog.mode === 'edit' ? 'Periode bijgewerkt' : 'Periode toegevoegd');
      setBookingDialog({ open: false, mode: 'create' });
      await refresh();
    } finally {
      setSavingBooking(false);
    }
  };

  // ─── Invoice ───
  const openInvoice = (b: Booking) => {
    if (!drawerFridge) return;
    setInvoiceForm({
      description: bookingDescription(b, drawerFridge.name),
      units: '1',
      subtotal: '',
      tax: '21',
      notes: '',
    });
    setInvoiceDialog({ open: true, booking: b });
  };

  const submitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceDialog.booking) return;
    const subtotal = parseFloat(invoiceForm.subtotal.replace(',', '.'));
    if (isNaN(subtotal) || subtotal < 0) {
      toast.error('Vul een geldig bedrag in');
      return;
    }
    setCreatingInvoice(true);
    try {
      const res = await fetch(`/api/admin/fridges/bookings/${invoiceDialog.booking.id}/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: invoiceForm.description,
          units: parseFloat(invoiceForm.units) || 1,
          subtotal,
          tax: parseFloat(invoiceForm.tax) || 0,
          notes: invoiceForm.notes,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Factuur mislukt');
        return;
      }
      toast.success(`Factuur ${data.holdedInvoiceNumber || 'aangemaakt'}`);
      setInvoiceDialog({ open: false, booking: null });
      await refresh();
    } finally {
      setCreatingInvoice(false);
    }
  };

  // ─── Delete ───
  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    const url = confirmDelete.type === 'fridge'
      ? `/api/admin/fridges/${confirmDelete.id}`
      : `/api/admin/fridges/bookings/${confirmDelete.id}`;
    const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) {
      toast.error('Verwijderen mislukt');
      return;
    }
    toast.success('Verwijderd');
    if (confirmDelete.type === 'fridge') {
      setDrawerOpen(false);
      setDrawerFridge(null);
    }
    setConfirmDelete(null);
    await refresh();
  };

  return (
    <div className="max-w-6xl">
      <header className="flex items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-medium text-text tracking-tight">Koelkasten</h1>
          <p className="text-sm text-text-muted mt-1">{fridges.length} klanten</p>
        </div>
        <Button onClick={openCreate}><Plus size={14} /> Nieuwe klant</Button>
      </header>

      <div className="flex flex-wrap gap-2 mb-6">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Zoek naam, e-mail of camping..."
            className="w-full h-10 pl-9 pr-3 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors placeholder:text-text-subtle"
          />
        </div>
        <select
          value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          className="h-10 px-3 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors"
        >
          <option value={0}>Alle jaren</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-3 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors"
        >
          <option value="">Alle statussen</option>
          <option value="compleet">Compleet</option>
          <option value="controleren">Controleren</option>
        </select>
      </div>

      <div className="bg-surface border border-border rounded-[var(--radius-xl)] overflow-hidden">
        {loading ? (
          <div className="divide-y divide-border">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <Skeleton className="w-9 h-9 rounded-full" />
                <Skeleton className="h-4 flex-1 max-w-xs" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : fridges.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-muted">Geen klanten gevonden</div>
        ) : (
          <ul className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {fridges.map(f => {
                const hasCheck = f.bookings.some(b => b.status === 'controleren');
                const hasInvoice = f.bookings.some(b => b.holded_invoice_number);
                return (
                  <motion.li
                    key={f.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={() => openEdit(f)}
                      className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2 transition-colors text-left group"
                    >
                      <div className="w-9 h-9 rounded-full bg-surface-2 text-text flex items-center justify-center text-xs font-medium shrink-0 border border-border">
                        {f.name.split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase()).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-text">{f.name}</span>
                          {f.holded_contact_id && (
                            <span title="Gekoppeld aan Holded">
                              <LinkIcon size={11} className="text-text-subtle" />
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-text-muted mt-0.5 truncate">
                          {f.device_type} · {f.bookings.length} periode{f.bookings.length === 1 ? '' : 's'}{f.email ? ` · ${f.email}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {hasInvoice && <Badge tone="success"><Receipt size={10} /> Factuur</Badge>}
                        {hasCheck && <Badge tone="warning"><AlertCircle size={10} /> Controleren</Badge>}
                        <ChevronRight size={14} className="text-text-subtle group-hover:text-text transition-colors" />
                      </div>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* ─── Fridge drawer ─── */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerMode === 'edit' && drawerFridge ? drawerFridge.name : 'Nieuwe klant'}
        subtitle={drawerMode === 'edit' && drawerFridge ? drawerFridge.device_type : undefined}
        footer={drawerMode === 'edit' && drawerFridge ? (
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete({ type: 'fridge', id: drawerFridge.id })}>
              <Trash2 size={14} /> Verwijderen
            </Button>
            <Button onClick={() => saveFridge()} loading={savingFridge}>Opslaan</Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Annuleren</Button>
            <Button onClick={() => saveFridge()} loading={savingFridge}>Toevoegen</Button>
          </>
        )}
      >
        <form onSubmit={saveFridge} className="space-y-4">
          <Input label="Naam" required value={fridgeForm.name} onChange={e => setFridgeForm({ ...fridgeForm, name: e.target.value })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="E-mail" type="email" value={fridgeForm.email} onChange={e => setFridgeForm({ ...fridgeForm, email: e.target.value })} />
            <Input label="Extra e-mail" type="email" value={fridgeForm.extra_email} onChange={e => setFridgeForm({ ...fridgeForm, extra_email: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text mb-1.5">Soort apparaat</label>
            <input
              list="device-types"
              value={fridgeForm.device_type}
              onChange={e => setFridgeForm({ ...fridgeForm, device_type: e.target.value })}
              className="w-full h-10 px-3 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors"
            />
            <datalist id="device-types">
              <option value="Grote koelkast" />
              <option value="Tafelmodel koelkast" />
              <option value="Airco" />
              <option value="Grote koelkast + airco" />
              <option value="Grote koelkast + airco unit" />
            </datalist>
          </div>
          <Textarea label="Notities" value={fridgeForm.notes} onChange={e => setFridgeForm({ ...fridgeForm, notes: e.target.value })} />
        </form>

        {drawerMode === 'edit' && drawerFridge && (
          <>
            {/* Holded sync */}
            <div className="mt-8 p-4 bg-surface-2 rounded-[var(--radius-lg)] border border-border">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="text-xs font-medium text-text mb-1">Holded</div>
                  <p className="text-xs text-text-muted">
                    {drawerFridge.holded_contact_id
                      ? `Gekoppeld (id ${drawerFridge.holded_contact_id.slice(0, 8)}…)`
                      : 'Nog niet gekoppeld'}
                  </p>
                </div>
                {!drawerFridge.holded_contact_id && (
                  <Button size="sm" variant="secondary" onClick={syncHolded} loading={holdedSyncing}>
                    Koppelen
                  </Button>
                )}
              </div>
            </div>

            {/* Bookings */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium uppercase tracking-wider text-text-muted">Periodes</h3>
                <Button size="sm" variant="secondary" onClick={openNewBooking}><Plus size={12} /> Toevoegen</Button>
              </div>
              {drawerFridge.bookings.length === 0 ? (
                <p className="text-xs text-text-muted italic">Nog geen periodes</p>
              ) : (
                <ul className="space-y-2">
                  {drawerFridge.bookings.map(b => (
                    <li key={b.id} className="bg-surface border border-border rounded-[var(--radius-md)] p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge tone={b.status === 'compleet' ? 'success' : 'warning'}>
                              {b.status === 'compleet' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                              {b.status}
                            </Badge>
                            {b.holded_invoice_number && (
                              <Badge tone="accent"><Receipt size={10} /> {b.holded_invoice_number}</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-text">
                            <span className="flex items-center gap-1.5"><MapPin size={11} className="text-text-subtle" />{b.camping || '—'}</span>
                            <span className="flex items-center gap-1.5"><Calendar size={11} className="text-text-subtle" />{fmtPeriod(b)}</span>
                            {b.spot_number && <span className="flex items-center gap-1.5"><Tag size={11} className="text-text-subtle" />{b.spot_number}</span>}
                          </div>
                          {b.notes && <p className="text-xs text-text-muted italic">{b.notes}</p>}
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            onClick={() => openEditBooking(b)}
                            className="w-7 h-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                            aria-label="Bewerken"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete({ type: 'booking', id: b.id })}
                            className="w-7 h-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:text-danger hover:bg-danger-soft transition-colors"
                            aria-label="Verwijderen"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      {!b.holded_invoice_number && (
                        <div className="pt-2 border-t border-border">
                          <Button size="sm" variant="secondary" onClick={() => openInvoice(b)}>
                            <Receipt size={12} /> Factuur in Holded
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </Drawer>

      {/* ─── Booking dialog (modal) ─── */}
      <AnimatePresence>
        {bookingDialog.open && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingDialog({ open: false, mode: 'create' })}
              className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="relative bg-bg border border-border rounded-[var(--radius-xl)] shadow-lg max-w-md w-full p-6"
            >
              <h2 className="text-base font-medium text-text mb-4">
                {bookingDialog.mode === 'edit' ? 'Periode bewerken' : 'Nieuwe periode'}
              </h2>
              <form onSubmit={saveBooking} className="space-y-4">
                <Input label="Camping" value={bookingForm.camping} onChange={e => setBookingForm({ ...bookingForm, camping: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Startdatum" type="date" value={bookingForm.start_date} onChange={e => setBookingForm({ ...bookingForm, start_date: e.target.value })} />
                  <Input label="Einddatum" type="date" value={bookingForm.end_date} onChange={e => setBookingForm({ ...bookingForm, end_date: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Pleknummer" value={bookingForm.spot_number} onChange={e => setBookingForm({ ...bookingForm, spot_number: e.target.value })} />
                  <Select label="Status" value={bookingForm.status} onChange={e => setBookingForm({ ...bookingForm, status: e.target.value as 'compleet' | 'controleren' })}>
                    <option value="compleet">Compleet</option>
                    <option value="controleren">Controleren</option>
                  </Select>
                </div>
                <Textarea label="Opmerking" value={bookingForm.notes} onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })} />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setBookingDialog({ open: false, mode: 'create' })}>Annuleren</Button>
                  <Button type="submit" loading={savingBooking}>
                    {bookingDialog.mode === 'edit' ? 'Opslaan' : 'Toevoegen'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Invoice dialog ─── */}
      <AnimatePresence>
        {invoiceDialog.open && invoiceDialog.booking && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInvoiceDialog({ open: false, booking: null })}
              className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="relative bg-bg border border-border rounded-[var(--radius-xl)] shadow-lg max-w-md w-full p-6"
            >
              <h2 className="text-base font-medium text-text mb-1">Factuur in Holded</h2>
              <p className="text-xs text-text-muted mb-4">Controleer en pas aan voor verzenden.</p>
              <form onSubmit={submitInvoice} className="space-y-4">
                <Input label="Omschrijving" required value={invoiceForm.description} onChange={e => setInvoiceForm({ ...invoiceForm, description: e.target.value })} />
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Aantal" type="number" min="1" step="1" value={invoiceForm.units} onChange={e => setInvoiceForm({ ...invoiceForm, units: e.target.value })} />
                  <Input label="Bedrag (€)" required inputMode="decimal" placeholder="0,00" value={invoiceForm.subtotal} onChange={e => setInvoiceForm({ ...invoiceForm, subtotal: e.target.value })} />
                  <Input label="Btw (%)" type="number" min="0" max="100" step="1" value={invoiceForm.tax} onChange={e => setInvoiceForm({ ...invoiceForm, tax: e.target.value })} />
                </div>
                <Textarea label="Notities" value={invoiceForm.notes} onChange={e => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setInvoiceDialog({ open: false, booking: null })}>Annuleren</Button>
                  <Button type="submit" loading={creatingInvoice}><Receipt size={14} /> Verstuur naar Holded</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmDelete}
        title={confirmDelete?.type === 'fridge' ? 'Klant verwijderen?' : 'Periode verwijderen?'}
        description={confirmDelete?.type === 'fridge' ? 'De klant en alle bijbehorende periodes worden permanent verwijderd.' : 'Deze periode wordt permanent verwijderd.'}
        confirmLabel="Verwijderen"
        destructive
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
