'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus, Search, Trash2, Pencil, Calendar, MapPin, Tag, Receipt, Link as LinkIcon,
  AlertCircle, CheckCircle2, ChevronRight, ExternalLink, Truck, Send, Mail, RefreshCw,
} from 'lucide-react';
import { Button, Input, Select, Textarea, Badge, Skeleton, Spinner } from '@/components/ui';
import Drawer from '@/components/Drawer';
import ConfirmDialog from '@/components/ConfirmDialog';
import PageHeader from '@/components/admin/PageHeader';
import CustomerPicker, { type CustomerLite } from '@/components/CustomerPicker';
import NewCustomerDialog from '@/components/NewCustomerDialog';

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
  holded_invoice_url: string | null;
  holded_invoice_status: string | null;
  payment_link_url: string | null;
  payment_link_sent_at: string | null;
  payment_link_email: string | null;
  payment_link_amount_cents: number | null;
};

type Fridge = {
  id: number;
  name: string;
  email: string | null;
  extra_email: string | null;
  device_type: string;
  notes: string | null;
  holded_contact_id: string | null;
  customer_id: number | null;
  bookings: Booking[];
};

const emptyFridge: { name: string; email: string; extra_email: string; device_type: string; notes: string; customer_id: number | null } = {
  name: '', email: '', extra_email: '', device_type: 'Grote koelkast', notes: '', customer_id: null,
};
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
  const [deviceFilter, setDeviceFilter] = useState(searchParams.get('device') || '');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [holdedStatuses, setHoldedStatuses] = useState<Record<number, { status: string; publicUrl?: string }>>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [drawerFridge, setDrawerFridge] = useState<Fridge | null>(null);
  const [fridgeForm, setFridgeForm] = useState(emptyFridge);
  const [pickedCustomer, setPickedCustomer] = useState<CustomerLite | null>(null);
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);
  const [newCustomerInitial, setNewCustomerInitial] = useState<string | undefined>(undefined);
  const [savingFridge, setSavingFridge] = useState(false);
  const [holdedSyncing, setHoldedSyncing] = useState(false);

  const [bookingDialog, setBookingDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; bookingId?: number }>({ open: false, mode: 'create' });
  const [bookingForm, setBookingForm] = useState(emptyBooking);
  const [savingBooking, setSavingBooking] = useState(false);

  const [invoiceDialog, setInvoiceDialog] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null });
  const [invoiceForm, setInvoiceForm] = useState({ description: '', units: '1', subtotal: '', tax: '21', notes: '' });
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  const [payLinkDialog, setPayLinkDialog] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null });
  const [payLinkForm, setPayLinkForm] = useState({ description: '', amount: '', email: '', tax: '21' });
  const [sendingPayLink, setSendingPayLink] = useState(false);

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

  // Fetch Holded payment status for invoiced bookings (cheap; runs once on mount and after refresh)
  useEffect(() => {
    fetch('/api/admin/fridges/holded-status', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { statuses: {} })
      .then(d => setHoldedStatuses(d.statuses || {}))
      .catch(() => { /* silent */ });
  }, [fridges.length]);

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
    fridges.forEach(f => (f.bookings || []).forEach(b => { if (b.start_date) set.add(new Date(b.start_date).getFullYear()); }));
    return Array.from(set).sort((a, b) => b - a);
  }, [fridges]);

  // ─── Fridge actions ───
  const openCreate = () => {
    setDrawerMode('create');
    setDrawerFridge(null);
    setFridgeForm(emptyFridge);
    setPickedCustomer(null);
    setDrawerOpen(true);
  };

  const openEdit = (f: Fridge) => {
    setDrawerMode('edit');
    setDrawerFridge(f);
    setPickedCustomer(null);
    setFridgeForm({
      name: f.name,
      email: f.email || '',
      extra_email: f.extra_email || '',
      device_type: f.device_type || 'Grote koelkast',
      notes: f.notes || '',
      customer_id: f.customer_id ?? null,
    });
    setDrawerOpen(true);
    // Als de fridge al een gekoppelde klant heeft, halen we de details op
    // zodat de picker direct de juiste klant in "geselecteerd"-state toont.
    if (f.customer_id) {
      fetch(`/api/admin/customers/${f.customer_id}`, { credentials: 'include' })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.customer) {
            setPickedCustomer({
              id: data.customer.id,
              name: data.customer.name,
              email: data.customer.email,
              phone: data.customer.phone,
              holded_contact_id: data.customer.holded_contact_id,
            });
          }
        })
        .catch(() => { /* ignore */ });
    }
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

  const saveBooking = async (e: React.FormEvent, force = false) => {
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
        body: JSON.stringify({ ...bookingForm, force }),
        credentials: 'include',
      });
      if (res.status === 409) {
        const d = await res.json().catch(() => ({}));
        if (d.soldOut && confirm(`${d.error}\n\nToch toevoegen (force)?`)) {
          // Recurse met force=true. Vermijd recursie-loop: nu accepteert backend.
          const forceRes = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...bookingForm, force: true }),
            credentials: 'include',
          });
          if (!forceRes.ok) {
            const fd = await forceRes.json().catch(() => ({}));
            toast.error(fd.error || 'Opslaan mislukt');
            return;
          }
          toast.success('Periode toegevoegd (force)');
          setBookingDialog({ open: false, mode: 'create' });
          await refresh();
          return;
        }
        return;
      }
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
        toast.error(data.error || 'Pro forma mislukt');
        return;
      }
      toast.success(`Pro forma ${data.holdedInvoiceNumber || 'aangemaakt'}`);
      setInvoiceDialog({ open: false, booking: null });
      await refresh();
    } finally {
      setCreatingInvoice(false);
    }
  };

  // ─── Stuur betaallink ───
  // fridgeContext is optioneel — bij aanroep vanuit het lijst-overzicht geven
  // we expliciet de fridge mee zodat we niet hoeven te wachten op
  // setDrawerFridge (state-update is async). Vanuit de drawer pakken we 'm
  // uit drawerFridge.
  const openPayLink = (b: Booking, fridgeContext?: Fridge) => {
    const f = fridgeContext || drawerFridge;
    if (!f) return;
    setPayLinkForm({
      description: bookingDescription(b, f.name),
      amount: '',
      email: f.email || '',
      tax: '21',
    });
    setPayLinkDialog({ open: true, booking: b });
  };

  const sendPayLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payLinkDialog.booking) return;
    const amount = parseFloat(payLinkForm.amount.replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Vul een geldig bedrag in');
      return;
    }
    if (!payLinkForm.email || !payLinkForm.email.includes('@')) {
      toast.error('Vul een geldig e-mailadres in');
      return;
    }
    setSendingPayLink(true);
    try {
      const res = await fetch(`/api/admin/fridges/bookings/${payLinkDialog.booking.id}/payment-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountEur: amount,
          description: payLinkForm.description,
          email: payLinkForm.email,
          taxPercent: parseFloat(payLinkForm.tax) || 21,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Verzenden mislukt');
        return;
      }
      if (data.mailOk === false) {
        toast.error(`Pro forma ${data.holdedInvoiceNumber || ''} aangemaakt, maar mail mislukt: ${data.mailError || ''}`);
      } else {
        toast.success(`Betaallink verstuurd naar ${data.sentTo}`);
      }
      setPayLinkDialog({ open: false, booking: null });
      await refresh();
    } finally {
      setSendingPayLink(false);
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

  // Client-side device-type filter (capacity-cards in /admin/koelkasten en
  // /admin/dashboard linken hier naartoe via ?device=…). Match op substring
  // zodat 'Grote koelkast' óók 'Grote koelkast + airco' meeneemt.
  const visibleFridges = deviceFilter
    ? fridges.filter(f => (f.device_type || '').toLowerCase().includes(deviceFilter.toLowerCase()))
    : fridges;

  return (
    <>
      <PageHeader
        eyebrow="Operatie"
        title="Koelkasten"
        description={`${fridges.length} klanten in beheer.`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={async () => {
              try {
                const res = await fetch('/api/admin/customers/auto-link', { method: 'POST', credentials: 'include' });
                const d = await res.json();
                if (!res.ok) {
                  toast.error(d.error || 'Auto-koppelen mislukt');
                  return;
                }
                toast.success(`Gekoppeld: ${d.fridges} koelkasten · ${d.stalling} stalling · ${d.transport} transport (overgeslagen: ${d.skipped})`);
                load();
              } catch {
                toast.error('Auto-koppelen mislukt');
              }
            }}>
              <LinkIcon size={14} /> Auto-koppel klanten
            </Button>
            <Button onClick={openCreate}>
              <Plus size={14} /> Nieuwe klant
            </Button>
          </div>
        }
      />

      <ActiveBookingsOverview onFilterDevice={setDeviceFilter} activeFilter={deviceFilter} />

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
        {deviceFilter && (
          <button
            type="button"
            onClick={() => setDeviceFilter('')}
            className="inline-flex items-center gap-1.5 h-10 px-3 text-sm bg-accent-soft text-accent border border-accent/30 rounded-[var(--radius-md)] hover:bg-accent-soft/70 transition-colors"
            title="Filter wissen"
          >
            {deviceFilter} ×
          </button>
        )}
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
        ) : visibleFridges.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-muted">
            {deviceFilter ? `Geen klanten met "${deviceFilter}"` : 'Geen klanten gevonden'}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {visibleFridges.map(f => {
                // Defensief: een vers aangemaakte of gecorrumpeerde fridge
                // kan zonder bookings-array door de UI komen.
                const bookings = Array.isArray(f.bookings) ? f.bookings : [];
                const hasCheck = bookings.some(b => b.status === 'controleren');
                const hasInvoice = bookings.some(b => b.holded_invoice_number);
                // Sorteer periodes op startdatum (recentst eerst) en toon
                // standaard de eerste 3; rest komt in de drawer.
                const sortedBookings = [...bookings].sort((a, b) => {
                  const ta = a.start_date ? new Date(a.start_date).getTime() : 0;
                  const tb = b.start_date ? new Date(b.start_date).getTime() : 0;
                  return tb - ta;
                });
                const previewBookings = sortedBookings.slice(0, 3);
                const extraBookings = sortedBookings.length - previewBookings.length;
                return (
                  <motion.li
                    key={f.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 py-3.5 hover:bg-surface-2 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <button
                        type="button"
                        onClick={() => { setDrawerFridge(f); openEdit(f); }}
                        className="w-9 h-9 rounded-full bg-surface-2 text-text flex items-center justify-center text-xs font-medium shrink-0 border border-border mt-0.5 hover:border-border-strong"
                        aria-label="Klant openen"
                      >
                        {f.name.split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase()).join('')}
                      </button>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => openEdit(f)}
                            className="flex items-center gap-2 flex-wrap min-w-0 text-left hover:underline underline-offset-2 decoration-text-subtle"
                          >
                            <span className="text-sm font-medium text-text">{f.name}</span>
                            {f.holded_contact_id && (
                              <span title="Gekoppeld aan Holded">
                                <LinkIcon size={11} className="text-text-subtle" />
                              </span>
                            )}
                            <span className="text-xs text-text-muted">
                              · {f.device_type}{f.email ? ` · ${f.email}` : ''}
                            </span>
                          </button>
                          <div className="flex items-center gap-2 shrink-0">
                            {hasInvoice && <Badge tone="success"><Receipt size={10} /> Pro forma</Badge>}
                            {hasCheck && <Badge tone="warning"><AlertCircle size={10} /> Controleren</Badge>}
                            <button
                              type="button"
                              onClick={() => openEdit(f)}
                              className="text-text-subtle hover:text-text transition-colors"
                              aria-label="Details openen"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                        {previewBookings.length === 0 ? (
                          <p className="text-[11px] text-text-subtle italic">Nog geen periodes</p>
                        ) : (
                          <div className="space-y-1.5">
                            {previewBookings.map(b => {
                              // 'compleet' = onze werk-status (intake klaar), NIET hetzelfde
                              // als betaald. Alleen Holded's invoice-status mag tot 'Paid' leiden.
                              const live = holdedStatuses[b.id];
                              const holdedPaid = live?.status === 'paid' || b.holded_invoice_status === 'paid';
                              const linkSent = !!b.payment_link_sent_at && !holdedPaid;
                              const holdedUrl = live?.publicUrl || b.holded_invoice_url || null;
                              const period = fmtPeriod(b);
                              return (
                                <div key={b.id} className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border ${
                                      holdedPaid
                                        ? 'bg-success-soft text-success border-success/30'
                                        : linkSent
                                          ? 'bg-accent-soft text-accent border-accent/30'
                                          : b.status === 'controleren'
                                            ? 'bg-warning-soft text-warning border-warning/30'
                                            : 'bg-surface-2 text-text-muted border-border'
                                    }`}
                                    title={`${period} · ${b.status}${b.holded_invoice_number ? ` · ${b.holded_invoice_number}` : ''}`}
                                  >
                                    {holdedPaid && <CheckCircle2 size={9} />}
                                    {!holdedPaid && linkSent && <Send size={9} />}
                                    {!holdedPaid && !linkSent && b.status === 'controleren' && <AlertCircle size={9} />}
                                    <span className="tabular-nums">{period}</span>
                                    {b.camping && <span className="opacity-70">· {b.camping}</span>}
                                  </span>
                                  {/* Stuur-betaallink-knop is altijd zichtbaar — ook bij betaalde
                                      periodes voor vervolg-/extra-betalingen. Label past zich aan op de status. */}
                                  <button
                                    type="button"
                                    onClick={() => openPayLink(b, f)}
                                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border transition-colors ${
                                      holdedPaid
                                        ? 'text-text-muted border-border bg-surface hover:text-text hover:border-text-muted'
                                        : b.payment_link_sent_at
                                          ? 'text-text-muted border-border bg-surface hover:text-text'
                                          : 'text-text border-border bg-surface hover:text-accent hover:border-accent'
                                    }`}
                                    title={holdedPaid ? 'Send another payment link' : b.payment_link_sent_at ? 'Resend payment link' : 'Send payment link'}
                                  >
                                    {b.payment_link_sent_at ? <RefreshCw size={10} /> : <Send size={10} />}
                                    {holdedPaid ? 'New link' : b.payment_link_sent_at ? 'Resend link' : 'Send payment link'}
                                  </button>
                                  {holdedUrl && (
                                    <a
                                      href={holdedUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline underline-offset-2"
                                      title="Open pro forma in Holded"
                                    >
                                      <Receipt size={10} /> {b.holded_invoice_number || 'Pro forma'}
                                    </a>
                                  )}
                                  {b.holded_invoice_number && !holdedUrl && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-text-muted">
                                      <Receipt size={10} /> {b.holded_invoice_number}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                            {extraBookings > 0 && (
                              <button
                                type="button"
                                onClick={() => openEdit(f)}
                                className="text-[11px] text-text-muted hover:text-text underline-offset-2 hover:underline"
                              >
                                +{extraBookings} meer periode{extraBookings === 1 ? '' : 's'} bekijken
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
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
          {drawerMode === 'create' && (
            <div>
              <label className="block text-xs font-medium text-text mb-1.5">Klant</label>
              <CustomerPicker
                value={pickedCustomer}
                onSelect={(c) => {
                  setPickedCustomer(c);
                  setFridgeForm({
                    ...fridgeForm,
                    customer_id: c.id,
                    name: c.name,
                    email: c.email || '',
                  });
                }}
                onClear={() => {
                  setPickedCustomer(null);
                  setFridgeForm({ ...fridgeForm, customer_id: null, name: '', email: '' });
                }}
                onCreateNew={(q) => {
                  setNewCustomerInitial(q);
                  setNewCustomerOpen(true);
                }}
              />
              <p className="text-[11px] text-text-muted mt-1.5">
                Selecteer een bestaande klant of maak een nieuwe aan — die komt direct ook in Holded.
              </p>
            </div>
          )}
          {drawerMode === 'edit' && (
            <>
              <div>
                <label className="block text-xs font-medium text-text mb-1.5">
                  Klant {fridgeForm.customer_id ? '· gekoppeld' : '· nog niet gekoppeld'}
                </label>
                <CustomerPicker
                  value={pickedCustomer}
                  onSelect={(c) => {
                    setPickedCustomer(c);
                    setFridgeForm({
                      ...fridgeForm,
                      customer_id: c.id,
                      name: c.name,
                      email: c.email || fridgeForm.email,
                    });
                  }}
                  onClear={() => {
                    setPickedCustomer(null);
                    setFridgeForm({ ...fridgeForm, customer_id: null });
                  }}
                  onCreateNew={(q) => {
                    setNewCustomerInitial(q);
                    setNewCustomerOpen(true);
                  }}
                  placeholder="Zoek bestaande klant…"
                />
                <p className="text-[11px] text-text-muted mt-1.5">
                  Link deze koelkast/airco aan een centrale klant uit Holded; nieuwe klant hier ook aan te maken.
                </p>
              </div>
              <Input label="Naam" required value={fridgeForm.name} onChange={e => setFridgeForm({ ...fridgeForm, name: e.target.value })} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input label="E-mail" type="email" value={fridgeForm.email} onChange={e => setFridgeForm({ ...fridgeForm, email: e.target.value })} />
                <Input label="Extra e-mail" type="email" value={fridgeForm.extra_email} onChange={e => setFridgeForm({ ...fridgeForm, extra_email: e.target.value })} />
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-medium text-text mb-1.5">Soort apparaat</label>
            <input
              list="device-types"
              value={fridgeForm.device_type ?? ''}
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
            {/* Holded sync — alleen tonen als er écht nog geen koppeling is.
               Een gekoppelde centrale customer of bestaand holded_contact_id
               op de fridge zelf telt allebei als gekoppeld. */}
            {!drawerFridge.holded_contact_id && !drawerFridge.customer_id && !pickedCustomer?.holded_contact_id && (
              <div className="mt-8 p-4 bg-surface-2 rounded-[var(--radius-lg)] border border-border">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="text-xs font-medium text-text mb-1">Holded</div>
                    <p className="text-xs text-text-muted">Nog niet gekoppeld</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={syncHolded} loading={holdedSyncing}>
                    Koppelen
                  </Button>
                </div>
              </div>
            )}

            {/* Bookings */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium uppercase tracking-wider text-text-muted">Periodes</h3>
                <Button size="sm" variant="secondary" onClick={openNewBooking}><Plus size={12} /> Toevoegen</Button>
              </div>
              {(drawerFridge.bookings || []).length === 0 ? (
                <p className="text-xs text-text-muted italic">Nog geen periodes</p>
              ) : (
                <ul className="space-y-2">
                  {(drawerFridge.bookings || []).map(b => {
                    const holded = holdedStatuses[b.id];
                    // 'paid' is enkel waar als Holded zegt dat de pro forma is voldaan.
                    // Onze interne 'compleet' status betekent intake-klaar, niet betaald.
                    const holdedPaid = holded?.status === 'paid' || b.holded_invoice_status === 'paid';
                    const partial = holded?.status === 'partial';
                    const linkSent = !!b.payment_link_sent_at;
                    // Holded URL kan komen uit live-status (publicUrl) of uit
                    // de gecachte holded_invoice_url kolom — beide tonen we als
                    // klikbare link.
                    const holdedUrl = holded?.publicUrl || b.holded_invoice_url || null;
                    return (
                    <li key={b.id} className="bg-surface border border-border rounded-[var(--radius-md)] p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge tone={b.status === 'compleet' ? 'accent' : 'warning'}>
                              {b.status === 'compleet' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                              {b.status === 'compleet' ? 'Intake complete' : 'Review'}
                            </Badge>
                            {b.holded_invoice_number && (
                              <Badge tone="accent"><Receipt size={10} /> {b.holded_invoice_number}</Badge>
                            )}
                            {holdedPaid && <Badge tone="success">Paid</Badge>}
                            {partial && <Badge tone="warning">Partially paid</Badge>}
                            {linkSent && !holdedPaid && (
                              <Badge tone="accent">Link sent · awaiting payment</Badge>
                            )}
                            {b.holded_invoice_number && !holdedPaid && !partial && !linkSent && holded?.status === 'unpaid' && (
                              <Badge tone="warning">Open</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-text">
                            <span className="flex items-center gap-1.5"><MapPin size={11} className="text-text-subtle" />{b.camping || '—'}</span>
                            <span className="flex items-center gap-1.5"><Calendar size={11} className="text-text-subtle" />{fmtPeriod(b)}</span>
                            {b.spot_number && <span className="flex items-center gap-1.5"><Tag size={11} className="text-text-subtle" />{b.spot_number}</span>}
                          </div>
                          {b.payment_link_sent_at && (
                            <p className="text-[11px] text-text-muted">
                              Payment link sent to {b.payment_link_email || '—'} on {new Date(b.payment_link_sent_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              {b.payment_link_amount_cents != null && ` · €${(b.payment_link_amount_cents / 100).toFixed(2)}`}
                            </p>
                          )}
                          {b.notes && <p className="text-xs text-text-muted italic">{b.notes}</p>}
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            onClick={() => openEditBooking(b)}
                            className="w-7 h-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                            aria-label="Edit"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete({ type: 'booking', id: b.id })}
                            className="w-7 h-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:text-danger hover:bg-danger-soft transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border flex flex-wrap gap-2">
                        {!b.holded_invoice_number && (
                          <Button size="sm" variant="secondary" onClick={() => openInvoice(b)}>
                            <Receipt size={12} /> Manual pro forma
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant={b.payment_link_sent_at ? 'secondary' : 'primary'}
                          onClick={() => openPayLink(b)}
                        >
                          {b.payment_link_sent_at ? <RefreshCw size={12} /> : <Send size={12} />}
                          {holdedPaid ? 'New payment link' : b.payment_link_sent_at ? 'Resend payment link' : 'Send payment link'}
                        </Button>
                        {b.payment_link_url && (
                          <a
                            href={b.payment_link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-muted hover:text-text underline-offset-4 hover:underline transition-colors px-2 self-center"
                          >
                            <ExternalLink size={11} /> Open betaallink
                          </a>
                        )}
                        {holdedUrl && (
                          <a
                            href={holdedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent hover:underline underline-offset-4 px-2 self-center"
                          >
                            <Receipt size={11} /> Open pro forma in Holded
                          </a>
                        )}
                      </div>
                    </li>
                    );
                  })}
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
              <h2 className="text-base font-medium text-text mb-1">Pro forma in Holded</h2>
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

      {/* ─── Stuur betaallink dialog ─── */}
      <AnimatePresence>
        {payLinkDialog.open && payLinkDialog.booking && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPayLinkDialog({ open: false, booking: null })}
              className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="relative bg-bg border border-border rounded-[var(--radius-xl)] shadow-lg max-w-md w-full p-6"
            >
              <h2 className="text-base font-medium text-text mb-1 inline-flex items-center gap-2">
                <Mail size={16} /> Betaallink versturen
              </h2>
              <p className="text-xs text-text-muted mb-4">
                We maken direct een pro forma in Holded met het lokaal bekende adres en btw-nummer, en mailen de klant een Stripe-betaallink. Hij blijft 30 dagen geldig.
              </p>
              <form onSubmit={sendPayLink} className="space-y-4">
                <Input
                  label="Omschrijving"
                  required
                  value={payLinkForm.description}
                  onChange={e => setPayLinkForm({ ...payLinkForm, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Bedrag (€)"
                    required
                    inputMode="decimal"
                    placeholder="0,00"
                    value={payLinkForm.amount}
                    onChange={e => setPayLinkForm({ ...payLinkForm, amount: e.target.value })}
                  />
                  <Input
                    label="Btw (%)"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={payLinkForm.tax}
                    onChange={e => setPayLinkForm({ ...payLinkForm, tax: e.target.value })}
                  />
                </div>
                <Input
                  label="E-mail klant"
                  type="email"
                  required
                  value={payLinkForm.email}
                  onChange={e => setPayLinkForm({ ...payLinkForm, email: e.target.value })}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setPayLinkDialog({ open: false, booking: null })}>Annuleren</Button>
                  <Button type="submit" loading={sendingPayLink}><Send size={14} /> Verstuur betaallink</Button>
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

      <NewCustomerDialog
        open={newCustomerOpen}
        onClose={() => setNewCustomerOpen(false)}
        initialQuery={newCustomerInitial}
        onCreated={(c) => {
          setPickedCustomer(c);
          setFridgeForm({
            ...fridgeForm,
            customer_id: c.id,
            name: c.name,
            email: c.email || '',
          });
        }}
      />
    </>
  );
}

type ActiveBooking = {
  id: number;
  fridge_id: number;
  customer_name: string;
  email: string | null;
  device_type: string;
  camping: string | null;
  spot_number: string | null;
  start_date: string;
  end_date: string;
  status: string;
};

type ActiveStats = {
  large: { current: number; capacity: number };
  table: { current: number; capacity: number };
  airco: { current: number; capacity: number };
};

function ActiveBookingsOverview({ onFilterDevice, activeFilter }: {
  onFilterDevice: (device: string) => void;
  activeFilter: string;
}) {
  const [data, setData] = useState<{ bookings: ActiveBooking[]; stats: ActiveStats } | null>(null);

  useEffect(() => {
    fetch('/api/admin/active-bookings', { credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ bookings: [], stats: { large: { current: 0, capacity: 0 }, table: { current: 0, capacity: 0 }, airco: { current: 0, capacity: 0 } } }));
  }, []);

  if (!data) {
    return (
      <section className="mb-8">
        <Skeleton className="h-32 w-full" />
      </section>
    );
  }

  // filterValue = wat we als deviceFilter zetten als de card geklikt wordt;
  // we matchen substring zodat 'Grote koelkast' óók 'Grote koelkast + airco'
  // pakt zonder dat we hier alle varianten hoeven te kennen.
  const cards = [
    { label: 'Grote koelkast', filterValue: 'Grote koelkast', ...data.stats.large },
    { label: 'Tafelmodel', filterValue: 'Tafelmodel', ...data.stats.table },
    { label: 'Airco', filterValue: 'Airco', ...data.stats.airco },
  ];

  return (
    <section className="mb-10">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted mb-4 flex items-center gap-2">
        <Truck size={13} /> Op dit moment uit ({data.bookings.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {cards.map((c) => {
          const active = activeFilter && c.filterValue.toLowerCase().includes(activeFilter.toLowerCase());
          const pct = c.capacity > 0 ? Math.min(100, Math.round((c.current / c.capacity) * 100)) : 0;
          const barColor =
            pct >= 90 ? 'var(--color-danger)' :
            pct >= 70 ? 'var(--color-warning)' :
            'var(--color-accent)';
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => onFilterDevice(active ? '' : c.filterValue)}
              className={`card-surface p-5 text-left transition-all hover:border-accent/40 ${
                active ? 'ring-2 ring-accent/40 border-accent/40' : ''
              }`}
              title={active ? 'Filter uitzetten' : `Filter op ${c.label}`}
            >
              <div className="flex items-center justify-between">
                <div className="text-[12px] uppercase tracking-[0.18em] text-text-muted font-medium">{c.label}</div>
                {active && <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Actief ✓</span>}
              </div>
              <div className="flex items-baseline gap-2 mt-2 mb-3">
                <span className="text-3xl font-semibold tabular-nums">{c.current}</span>
                <span className="text-[13px] text-text-muted">/ {c.capacity} bezet</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
                <div style={{ width: `${pct}%`, background: barColor, height: '100%' }} />
              </div>
              <p className="text-[11px] text-text-muted mt-2">
                {Math.max(0, c.capacity - c.current)} beschikbaar · {pct}%
              </p>
            </button>
          );
        })}
      </div>
      {data.bookings.length > 0 && (
        <div className="card-surface divide-y divide-border">
          {data.bookings.map((b) => (
            <div key={b.id} className="px-5 py-3.5 flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-medium truncate">{b.customer_name}</div>
                <div className="text-[12px] text-text-muted truncate">
                  {b.device_type}{b.camping ? ` · ${b.camping}` : ''}{b.spot_number ? ` (${b.spot_number})` : ''}
                </div>
              </div>
              <span className="text-[12px] tabular-nums text-text-muted shrink-0">
                terug {new Date(b.end_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
