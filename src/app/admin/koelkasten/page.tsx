'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus, Search, Trash2, Pencil, Calendar, MapPin, Tag, Receipt, Link as LinkIcon,
  AlertCircle, CheckCircle2, ChevronRight, ExternalLink, Truck, Send, Mail, RefreshCw,
  FileCheck2, Square, CheckSquare, Wind, Refrigerator,
} from 'lucide-react';
import { Button, Input, Select, Textarea, Badge, Skeleton, Spinner } from '@/components/ui';
import Drawer from '@/components/Drawer';
import ConfirmDialog from '@/components/ConfirmDialog';
import PageHeader from '@/components/admin/PageHeader';
import CustomerPicker, { type CustomerLite } from '@/components/CustomerPicker';
import NewCustomerDialog from '@/components/NewCustomerDialog';
import CampingPicker from '@/components/CampingPicker';

type Booking = {
  id: number;
  camping: string | null;
  start_date: string | null;
  end_date: string | null;
  spot_number: string | null;
  status: 'compleet' | 'controleren';
  notes: string | null;
  device_type: string | null;
  holded_invoice_id: string | null;
  holded_invoice_number: string | null;
  holded_invoice_url: string | null;
  holded_invoice_status: string | null;
  payment_link_url: string | null;
  payment_link_sent_at: string | null;
  payment_link_email: string | null;
  payment_link_amount_cents: number | null;
  paid_at: string | null;
  stripe_payment_intent_id: string | null;
  sales_invoice_converted_at: string | null;
  sales_invoice_converted_by: string | null;
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

const DEVICE_TYPES = [
  { value: 'Grote koelkast', label: 'Large fridge', icon: Refrigerator },
  { value: 'Tafelmodel koelkast', label: 'Table fridge', icon: Refrigerator },
  { value: 'Airco', label: 'AC unit', icon: Wind },
] as const;
const DEVICE_VALUES: string[] = DEVICE_TYPES.map(d => d.value);

const emptyFridge: { name: string; email: string; extra_email: string; device_type: string; notes: string; customer_id: number | null } = {
  name: '', email: '', extra_email: '', device_type: 'Grote koelkast', notes: '', customer_id: null,
};
const emptyBooking: { camping: string; start_date: string; end_date: string; spot_number: string; status: 'compleet' | 'controleren'; notes: string } = {
  camping: '', start_date: '', end_date: '', spot_number: '', status: 'compleet', notes: '',
};

function fmtDate(s: string | null): string {
  if (!s) return '';
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function fmtPeriod(b: Booking): string {
  const start = fmtDate(b.start_date);
  const end = fmtDate(b.end_date);
  if (!start && !end) return '—';
  if (!end) return start;
  return `${start} – ${end}`;
}

function bookingDescription(b: Booking, fridgeName: string): string {
  const camping = b.camping || 'Storage';
  const period = fmtPeriod(b);
  return `Fridge rental — ${camping} — ${period} (${fridgeName})`;
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
  const urlDevice = searchParams.get('device') || '';
  const urlStatus = searchParams.get('status') || '';

  const [year, setYear] = useState(0);
  const [statusFilter, setStatusFilter] = useState(urlStatus);
  const [deviceFilter, setDeviceFilter] = useState(urlDevice);
  // Sync filter-state met query-string. useState-initial wordt alleen op
  // de eerste mount uitgelezen; sidebar-navigatie tussen ?device=Airco en
  // ?device=… verandert niet de pathname dus zonder deze sync zou de
  // filter blijven hangen op z'n initiële waarde.
  useEffect(() => { setDeviceFilter(urlDevice); }, [urlDevice]);
  useEffect(() => { setStatusFilter(urlStatus); }, [urlStatus]);
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

  // Inline-expand voor klant-rij — toont alle Holded data + adres in een
  // slide-down direct in de lijst, geen drawer nodig om de basis te zien.
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [holdedSnapshots, setHoldedSnapshots] = useState<Record<number, Record<string, unknown> | null>>({});
  const [snapshotLoading, setSnapshotLoading] = useState<number | null>(null);

  const toggleExpand = async (f: Fridge) => {
    if (expandedId === f.id) { setExpandedId(null); return; }
    setExpandedId(f.id);
    // Lazy: haal customer-detail op als 'r één gekoppeld is, alleen als
    // we 'm nog niet hebben gecached.
    if (f.customer_id && holdedSnapshots[f.id] === undefined) {
      setSnapshotLoading(f.id);
      try {
        const res = await fetch(`/api/admin/customers/${f.customer_id}`, { credentials: 'include' });
        if (res.ok) {
          const d = await res.json();
          setHoldedSnapshots((m) => ({ ...m, [f.id]: d.customer || null }));
        }
      } catch { /* silent */ }
      finally { setSnapshotLoading(null); }
    }
  };

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
        toast.error(d.error || 'Save failed');
        return;
      }
      const data = await res.json().catch(() => ({}));
      toast.success(drawerMode === 'edit' ? 'Customer updated' : 'Customer added');
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
        toast.error(data.error || 'Sync failed');
        return;
      }
      toast.success('Linked to Holded');
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
        if (d.soldOut && confirm(`${d.error}\n\nAdd anyway (force)?`)) {
          // Recurse met force=true. Vermijd recursie-loop: nu accepteert backend.
          const forceRes = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...bookingForm, force: true }),
            credentials: 'include',
          });
          if (!forceRes.ok) {
            const fd = await forceRes.json().catch(() => ({}));
            toast.error(fd.error || 'Save failed');
            return;
          }
          toast.success('Period added (force)');
          setBookingDialog({ open: false, mode: 'create' });
          await refresh();
          return;
        }
        return;
      }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || 'Save failed');
        return;
      }
      toast.success(bookingDialog.mode === 'edit' ? 'Period updated' : 'Period added');
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
      toast.error('Enter a valid amount');
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
        toast.error(data.error || 'Pro forma failed');
        return;
      }
      toast.success(`Pro forma ${data.holdedInvoiceNumber || 'created'}`);
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
      toast.error('Enter a valid amount');
      return;
    }
    if (!payLinkForm.email || !payLinkForm.email.includes('@')) {
      toast.error('Enter a valid email address');
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
        toast.error(data.error || 'Sending failed');
        return;
      }
      if (data.mailOk === false) {
        toast.error(`Pro forma ${data.holdedInvoiceNumber || ''} created, but mail failed: ${data.mailError || ''}`);
      } else {
        toast.success(`Payment link sent to ${data.sentTo}`);
      }
      setPayLinkDialog({ open: false, booking: null });
      await refresh();
    } finally {
      setSendingPayLink(false);
    }
  };

  // ─── Sales-invoice toggle ───
  // Optimistic update: vink direct in UI aan, rollback bij fout. Refresh
  // daarna om ook converted_by + converted_at uit DB op te halen.
  const toggleSalesInvoice = async (bookingId: number, converted: boolean) => {
    try {
      const res = await fetch(`/api/admin/fridges/bookings/${bookingId}/sales-invoice`, {
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
      await refresh();
    } catch {
      toast.error('Update failed');
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
      toast.error('Delete failed');
      return;
    }
    toast.success('Deleted');
    if (confirmDelete.type === 'fridge') {
      setDrawerOpen(false);
      setDrawerFridge(null);
    }
    setConfirmDelete(null);
    await refresh();
  };

  // Slim device-type filter — match op booking-niveau zodat klanten met
  // zowel een koelkast als een airco onder de juiste tab verschijnen, met
  // alleen de matchende periodes uitgelicht. Booking.device_type heeft
  // voorrang; fallback op fridge.device_type voor pre-migratie data.
  const matchDevice = (b: Booking, f: Fridge) => {
    const dt = (b.device_type || f.device_type || '').toLowerCase();
    return dt.includes(deviceFilter.toLowerCase());
  };
  const visibleFridges = deviceFilter
    ? fridges
        .map(f => ({ ...f, bookings: (f.bookings || []).filter(b => matchDevice(b, f)) }))
        .filter(f => f.bookings.length > 0)
    : fridges;

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Fridges"
        description={`${fridges.length} customers managed.`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={async () => {
              try {
                const res = await fetch('/api/admin/customers/auto-link', { method: 'POST', credentials: 'include' });
                const d = await res.json();
                if (!res.ok) {
                  toast.error(d.error || 'Auto-link failed');
                  return;
                }
                toast.success(`Linked: ${d.fridges} fridges · ${d.stalling} storage · ${d.transport} transport (skipped: ${d.skipped})`);
                load();
              } catch {
                toast.error('Auto-link failed');
              }
            }}>
              <LinkIcon size={14} /> Auto-link customers
            </Button>
            <Button onClick={openCreate}>
              <Plus size={14} /> New customer
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
            placeholder="Search name, email or campsite..."
            className="w-full h-10 pl-9 pr-3 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors placeholder:text-text-subtle"
          />
        </div>
        <select
          value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          className="h-10 px-3 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors"
        >
          <option value={0}>All years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-3 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors"
        >
          <option value="">All statuses</option>
          <option value="compleet">Complete</option>
          <option value="controleren">Review</option>
        </select>
        {deviceFilter && (
          <button
            type="button"
            onClick={() => setDeviceFilter('')}
            className="inline-flex items-center gap-1.5 h-10 px-3 text-sm bg-accent-soft text-accent border border-accent/30 rounded-[var(--radius-md)] hover:bg-accent-soft/70 transition-colors"
            title="Clear filter"
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
            {deviceFilter ? `No customers with "${deviceFilter}"` : 'No customers found'}
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
                        aria-label="Open customer for editing"
                        title="Open for editing"
                      >
                        {f.name.split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase()).join('')}
                      </button>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => toggleExpand(f)}
                            className="flex items-center gap-2 flex-wrap min-w-0 text-left hover:underline underline-offset-2 decoration-text-subtle"
                            title={expandedId === f.id ? 'Hide details' : 'Show all details'}
                          >
                            <motion.span
                              animate={{ rotate: expandedId === f.id ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="inline-flex"
                            >
                              <ChevronRight size={12} className="text-text-subtle" />
                            </motion.span>
                            <span className="text-sm font-medium text-text">{f.name}</span>
                            {f.holded_contact_id && (
                              <span title="Linked to Holded">
                                <LinkIcon size={11} className="text-text-subtle" />
                              </span>
                            )}
                            {/* Toon unieke device-types die deze klant heeft —
                                bv. een klant met zowel een koelkast als airco
                                ziet beide chips. */}
                            {(() => {
                              const types = Array.from(new Set(
                                (f.bookings || []).map(b => b.device_type || f.device_type || '').filter(Boolean)
                              ));
                              if (types.length === 0 && f.device_type) types.push(f.device_type);
                              return types.map((t) => {
                                const isAirco = t.toLowerCase().includes('airco');
                                const Icon = isAirco ? Wind : Refrigerator;
                                return (
                                  <span key={t} className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                                    <Icon size={10} /> {t}
                                  </span>
                                );
                              });
                            })()}
                            {f.email && <span className="text-xs text-text-muted">· {f.email}</span>}
                          </button>
                          <div className="flex items-center gap-2 shrink-0">
                            {hasInvoice && <Badge tone="success"><Receipt size={10} /> Pro forma</Badge>}
                            {hasCheck && <Badge tone="warning"><AlertCircle size={10} /> Review</Badge>}
                            <button
                              type="button"
                              onClick={() => openEdit(f)}
                              className="text-text-subtle hover:text-text transition-colors"
                              aria-label="Open details"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                        {previewBookings.length === 0 ? (
                          <p className="text-[11px] text-text-subtle italic">No periods yet</p>
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
                                    title={`${period} · ${b.device_type || f.device_type || 'fridge'} · ${b.status}${b.holded_invoice_number ? ` · ${b.holded_invoice_number}` : ''}`}
                                  >
                                    {(() => {
                                      const dt = (b.device_type || f.device_type || '').toLowerCase();
                                      const Icon = dt.includes('airco') ? Wind : Refrigerator;
                                      return <Icon size={9} className="opacity-80" />;
                                    })()}
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
                                  {b.sales_invoice_converted_at ? (
                                    <span
                                      className="inline-flex items-center gap-1 text-[11px] font-medium text-success bg-success-soft border border-success/30 rounded-full px-2 py-0.5"
                                      title={`Converted to sales invoice by ${b.sales_invoice_converted_by || 'admin'}`}
                                    >
                                      <FileCheck2 size={10} /> Sales invoice
                                    </span>
                                  ) : holdedPaid ? (
                                    <button
                                      type="button"
                                      onClick={() => toggleSalesInvoice(b.id, true)}
                                      className="inline-flex items-center gap-1 text-[11px] font-medium text-warning bg-warning-soft border border-warning/30 rounded-full px-2 py-0.5 hover:bg-warning-soft/70 transition-colors"
                                      title="Mark as converted to sales invoice"
                                    >
                                      <Square size={10} /> Needs sales invoice
                                    </button>
                                  ) : null}
                                </div>
                              );
                            })}
                            {extraBookings > 0 && (
                              <button
                                type="button"
                                onClick={() => openEdit(f)}
                                className="text-[11px] text-text-muted hover:text-text underline-offset-2 hover:underline"
                              >
                                +{extraBookings} more period{extraBookings === 1 ? '' : 's'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Slide-down customer panel — Holded data + alle periodes
                        + adres in één blik. Geen drawer-roundtrip nodig. */}
                    <AnimatePresence initial={false}>
                      {expandedId === f.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <CustomerInlinePanel
                            fridge={f}
                            customer={holdedSnapshots[f.id] as InlineCustomer | null | undefined}
                            loading={snapshotLoading === f.id}
                            onOpenDrawer={() => openEdit(f)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
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
        title={drawerMode === 'edit' && drawerFridge ? drawerFridge.name : 'New customer'}
        subtitle={drawerMode === 'edit' && drawerFridge ? drawerFridge.device_type : undefined}
        footer={drawerMode === 'edit' && drawerFridge ? (
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete({ type: 'fridge', id: drawerFridge.id })}>
              <Trash2 size={14} /> Delete
            </Button>
            <Button onClick={() => saveFridge()} loading={savingFridge}>Save</Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={() => saveFridge()} loading={savingFridge}>Add</Button>
          </>
        )}
      >
        <form onSubmit={saveFridge} className="space-y-4">
          {drawerMode === 'create' && (
            <div>
              <label className="block text-xs font-medium text-text mb-1.5">Customer</label>
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
                Select an existing customer or create a new one — they will also be added to Holded.
              </p>
            </div>
          )}
          {drawerMode === 'edit' && (
            <>
              <div>
                <label className="block text-xs font-medium text-text mb-1.5">
                  Customer {fridgeForm.customer_id ? '· linked' : '· not linked yet'}
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
                  placeholder="Search existing customer…"
                />
                <p className="text-[11px] text-text-muted mt-1.5">
                  Link this fridge/AC to a central customer from Holded; new customer can also be created here.
                </p>
              </div>
              <Input label="Name" required value={fridgeForm.name} onChange={e => setFridgeForm({ ...fridgeForm, name: e.target.value })} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input label="Email" type="email" value={fridgeForm.email} onChange={e => setFridgeForm({ ...fridgeForm, email: e.target.value })} />
                <Input label="Extra email" type="email" value={fridgeForm.extra_email} onChange={e => setFridgeForm({ ...fridgeForm, extra_email: e.target.value })} />
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-medium text-text mb-2">Device type</label>
            <div className="grid grid-cols-3 gap-2">
              {DEVICE_TYPES.map((opt) => {
                const Icon = opt.icon;
                const selected = fridgeForm.device_type === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    type="button"
                    onClick={() => setFridgeForm({ ...fridgeForm, device_type: opt.value })}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-[var(--radius-md)] border-2 transition-all ${
                      selected
                        ? 'border-accent bg-accent-soft'
                        : 'border-border bg-surface hover:border-border-strong'
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="device-tick"
                        className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-accent text-accent-fg flex items-center justify-center"
                        transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                      >
                        <CheckCircle2 size={11} strokeWidth={3} />
                      </motion.span>
                    )}
                    <Icon size={20} className={selected ? 'text-accent' : 'text-text-muted'} />
                    <span className={`text-[11px] font-medium leading-tight text-center ${selected ? 'text-text' : 'text-text-muted'}`}>
                      {opt.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            {/* Vrije tekst-veld als de klant een afwijkende setup heeft. */}
            <input
              list="device-types"
              placeholder="Or type a custom value…"
              value={DEVICE_VALUES.includes(fridgeForm.device_type ?? '') ? '' : (fridgeForm.device_type ?? '')}
              onChange={e => setFridgeForm({ ...fridgeForm, device_type: e.target.value })}
              className="mt-2 w-full h-9 px-3 text-[13px] bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors text-text-muted"
            />
            <datalist id="device-types">
              <option value="Grote koelkast + airco" />
              <option value="Grote koelkast + airco unit" />
            </datalist>
          </div>
          <Textarea label="Notes" value={fridgeForm.notes} onChange={e => setFridgeForm({ ...fridgeForm, notes: e.target.value })} />
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
                    <p className="text-xs text-text-muted">Not linked yet</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={syncHolded} loading={holdedSyncing}>
                    Link
                  </Button>
                </div>
              </div>
            )}

            {/* Bookings */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium uppercase tracking-wider text-text-muted">Periods</h3>
                <Button size="sm" variant="secondary" onClick={openNewBooking}><Plus size={12} /> Add</Button>
              </div>
              {(drawerFridge.bookings || []).length === 0 ? (
                <p className="text-xs text-text-muted italic">No periods yet</p>
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
                            <span className="flex items-center gap-1.5">
                              {(() => {
                                const dt = (b.device_type || drawerFridge.device_type || '').toLowerCase();
                                const Icon = dt.includes('airco') ? Wind : Refrigerator;
                                return <Icon size={11} className="text-text-subtle" />;
                              })()}
                              {b.device_type || drawerFridge.device_type || '—'}
                            </span>
                            <span className="flex items-center gap-1.5"><Calendar size={11} className="text-text-subtle" />{fmtPeriod(b)}</span>
                            <span className="flex items-center gap-1.5"><MapPin size={11} className="text-text-subtle" />{b.camping || '—'}</span>
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
                            <ExternalLink size={11} /> Open payment link
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
                      {/* Sales-invoice conversie-tracker. Verschijnt zodra 'r een
                          pro forma in Holded staat — checkbox is alleen klikbaar als
                          de pro forma ook al betaald is, anders te vroeg. */}
                      {b.holded_invoice_id && (
                        <SalesInvoiceStrip
                          paidAt={b.paid_at}
                          holdedPaid={holdedPaid}
                          convertedAt={b.sales_invoice_converted_at}
                          convertedBy={b.sales_invoice_converted_by}
                          onToggle={(c) => toggleSalesInvoice(b.id, c)}
                        />
                      )}
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
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center"
                  aria-hidden
                >
                  <Calendar size={15} />
                </span>
                <h2 className="text-base font-medium text-text">
                  {bookingDialog.mode === 'edit' ? 'Edit period' : 'New period'}
                </h2>
              </div>
              <p className="text-[12px] text-text-muted mb-5">
                When does the rental start, and where is it standing?
              </p>
              <form onSubmit={saveBooking} className="space-y-4">
                {/* Locatie-blok — camping + spot prominent met iconen. */}
                <div className="rounded-[var(--radius-md)] border border-border bg-surface-2 p-3 space-y-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                    <MapPin size={12} /> Location
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-text mb-1">Campsite</label>
                    <CampingPicker
                      value={bookingForm.camping}
                      onChange={(name) => setBookingForm({ ...bookingForm, camping: name })}
                      placeholder="Search or pick a campsite…"
                      ariaLabel="Campsite"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-text mb-1 flex items-center gap-1.5">
                      <Tag size={11} className="text-text-subtle" /> Spot number
                    </label>
                    <input
                      value={bookingForm.spot_number}
                      onChange={e => setBookingForm({ ...bookingForm, spot_number: e.target.value })}
                      placeholder="e.g. A12"
                      className="w-full h-9 px-3 text-[13px] bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                {/* Periode + status */}
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Start date" type="date" value={bookingForm.start_date} onChange={e => setBookingForm({ ...bookingForm, start_date: e.target.value })} />
                  <Input label="End date" type="date" value={bookingForm.end_date} onChange={e => setBookingForm({ ...bookingForm, end_date: e.target.value })} />
                </div>
                <Select label="Status" value={bookingForm.status} onChange={e => setBookingForm({ ...bookingForm, status: e.target.value as 'compleet' | 'controleren' })}>
                  <option value="compleet">Complete</option>
                  <option value="controleren">Review</option>
                </Select>
                <Textarea label="Notes" value={bookingForm.notes} onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })} />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setBookingDialog({ open: false, mode: 'create' })}>Cancel</Button>
                  <Button type="submit" loading={savingBooking}>
                    {bookingDialog.mode === 'edit' ? 'Save' : 'Add period'}
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
              <p className="text-xs text-text-muted mb-4">Review and adjust before sending.</p>
              <form onSubmit={submitInvoice} className="space-y-4">
                <Input label="Description" required value={invoiceForm.description} onChange={e => setInvoiceForm({ ...invoiceForm, description: e.target.value })} />
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Quantity" type="number" min="1" step="1" value={invoiceForm.units} onChange={e => setInvoiceForm({ ...invoiceForm, units: e.target.value })} />
                  <Input label="Amount (€)" required inputMode="decimal" placeholder="0,00" value={invoiceForm.subtotal} onChange={e => setInvoiceForm({ ...invoiceForm, subtotal: e.target.value })} />
                  <Input label="VAT (%)" type="number" min="0" max="100" step="1" value={invoiceForm.tax} onChange={e => setInvoiceForm({ ...invoiceForm, tax: e.target.value })} />
                </div>
                <Textarea label="Notes" value={invoiceForm.notes} onChange={e => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setInvoiceDialog({ open: false, booking: null })}>Cancel</Button>
                  <Button type="submit" loading={creatingInvoice}><Receipt size={14} /> Send to Holded</Button>
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
                <Mail size={16} /> Send payment link
              </h2>
              <p className="text-xs text-text-muted mb-4">
                We immediately create a pro forma in Holded with the locally known address and VAT number, and email the customer a Stripe payment link. It stays valid for 30 days.
              </p>
              <form onSubmit={sendPayLink} className="space-y-4">
                <Input
                  label="Description"
                  required
                  value={payLinkForm.description}
                  onChange={e => setPayLinkForm({ ...payLinkForm, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Amount (€)"
                    required
                    inputMode="decimal"
                    placeholder="0,00"
                    value={payLinkForm.amount}
                    onChange={e => setPayLinkForm({ ...payLinkForm, amount: e.target.value })}
                  />
                  <Input
                    label="VAT (%)"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={payLinkForm.tax}
                    onChange={e => setPayLinkForm({ ...payLinkForm, tax: e.target.value })}
                  />
                </div>
                <Input
                  label="Customer email"
                  type="email"
                  required
                  value={payLinkForm.email}
                  onChange={e => setPayLinkForm({ ...payLinkForm, email: e.target.value })}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setPayLinkDialog({ open: false, booking: null })}>Cancel</Button>
                  <Button type="submit" loading={sendingPayLink}><Send size={14} /> Send payment link</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmDelete}
        title={confirmDelete?.type === 'fridge' ? 'Delete customer?' : 'Delete period?'}
        description={confirmDelete?.type === 'fridge' ? 'The customer and all associated periods will be permanently deleted.' : 'This period will be permanently deleted.'}
        confirmLabel="Delete"
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
    { label: 'Large fridge', filterValue: 'Grote koelkast', ...data.stats.large },
    { label: 'Tabletop', filterValue: 'Tafelmodel', ...data.stats.table },
    { label: 'AC unit', filterValue: 'Airco', ...data.stats.airco },
  ];

  return (
    <section className="mb-10">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted mb-4 flex items-center gap-2">
        <Truck size={13} /> Currently out ({data.bookings.length})
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
              title={active ? 'Clear filter' : `Filter by ${c.label}`}
            >
              <div className="flex items-center justify-between">
                <div className="text-[12px] uppercase tracking-[0.18em] text-text-muted font-medium">{c.label}</div>
                {active && <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Active ✓</span>}
              </div>
              <div className="flex items-baseline gap-2 mt-2 mb-3">
                <span className="text-3xl font-semibold tabular-nums">{c.current}</span>
                <span className="text-[13px] text-text-muted">/ {c.capacity} occupied</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
                <div style={{ width: `${pct}%`, background: barColor, height: '100%' }} />
              </div>
              <p className="text-[11px] text-text-muted mt-2">
                {Math.max(0, c.capacity - c.current)} available · {pct}%
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
                back {new Date(b.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// Sales-invoice tracker-strip — toont paid_at + checkbox 'Converted to sales
// invoice'. Checkbox is disabled tot de Holded-pro forma als 'paid' staat,
// want anders zou je 'm te vroeg afvinken. Undo (uitvinken) is altijd toegestaan.
function SalesInvoiceStrip({
  paidAt, holdedPaid, convertedAt, convertedBy, onToggle,
}: {
  paidAt: string | null;
  holdedPaid: boolean;
  convertedAt: string | null;
  convertedBy: string | null;
  onToggle: (converted: boolean) => void;
}) {
  const isConverted = !!convertedAt;
  const canToggle = holdedPaid || isConverted;
  const fmt = (s: string | null) =>
    s ? new Date(s).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div
      className={`mt-2 rounded-[var(--radius-md)] border p-2.5 ${
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
            isConverted
              ? 'text-success'
              : canToggle
                ? 'text-warning hover:text-text'
                : 'text-text-subtle cursor-not-allowed'
          }`}
          title={!canToggle ? 'Available once Holded marks the pro forma as paid' : isConverted ? 'Click to undo' : 'Click to mark as converted'}
          aria-label="Toggle sales invoice"
        >
          {isConverted ? <CheckSquare size={16} /> : <Square size={16} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap text-[12px]">
            <FileCheck2 size={11} className={isConverted ? 'text-success' : holdedPaid ? 'text-warning' : 'text-text-subtle'} />
            <span className={`font-medium ${isConverted ? 'text-success' : 'text-text'}`}>
              {isConverted ? 'Converted to sales invoice' : holdedPaid ? 'Needs to be made into sales invoice' : 'Awaiting payment before sales invoice'}
            </span>
          </div>
          <div className="text-[11px] text-text-muted mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
            {paidAt && <span>Paid {fmt(paidAt)} · via Stripe</span>}
            {isConverted && (
              <span>by {convertedBy || 'admin'} on {fmt(convertedAt)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Inline customer panel ────────────────────────────────────────────
// Slide-down met alle Holded-info — kenteken (uit customFields), adres,
// custom fields, tags, plus alle periodes. Klik op "Edit" opent de
// volledige drawer voor wijzigingen.
type InlineCustomer = {
  id: number;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  vat_number: string | null;
  notes: string | null;
  holded_contact_id: string | null;
  holded_synced_at: string | null;
  holded_custom_fields?: Array<{ field?: string; value?: string; name?: string; id?: string }> | null;
  holded_tags?: string[] | null;
  holded_code?: string | null;
  holded_iban?: string | null;
  holded_secondary_email?: string | null;
};

function CustomerInlinePanel({
  fridge,
  customer,
  loading,
  onOpenDrawer,
}: {
  fridge: Fridge;
  customer: InlineCustomer | null | undefined;
  loading: boolean;
  onOpenDrawer: () => void;
}) {
  const cf = customer?.holded_custom_fields || [];
  const tags = customer?.holded_tags || [];
  // Vaak interessant kenteken als string: zoek 'm in custom fields op naam.
  const plate = cf.find((f) =>
    /kenteken|plate|registration/i.test(f.field || f.name || '')
  )?.value;

  return (
    <div
      className="mt-3 ml-13 mr-2 mb-1 rounded-[var(--radius-lg)] border bg-surface-2 p-4 space-y-3"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {loading ? (
        <div className="flex items-center gap-2 text-[12px] text-text-muted">
          <Spinner size={14} /> Loading customer details…
        </div>
      ) : !customer ? (
        <div className="text-[12px] text-text-muted">
          {fridge.customer_id
            ? 'Customer linked but no Holded snapshot yet — open the drawer and click "Pull Holded data".'
            : 'No central customer linked yet. Open the drawer to link or create one.'}
        </div>
      ) : (
        <>
          {/* Quick-row: kenteken + IBAN + intern code als ze er zijn */}
          {(plate || customer.holded_code || customer.holded_iban) && (
            <div className="flex flex-wrap gap-3 text-[12px]">
              {plate && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-accent/30 bg-accent-soft text-accent font-medium">
                  <Tag size={11} /> {plate}
                </span>
              )}
              {customer.holded_code && (
                <span className="inline-flex items-center gap-1.5 text-text-muted">
                  <span className="text-text-subtle">Code:</span>
                  <span className="font-mono text-text">{customer.holded_code}</span>
                </span>
              )}
              {customer.holded_iban && (
                <span className="inline-flex items-center gap-1.5 text-text-muted">
                  <span className="text-text-subtle">IBAN:</span>
                  <span className="font-mono text-text">{customer.holded_iban}</span>
                </span>
              )}
            </div>
          )}

          {/* Contact-info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[12px]">
            {customer.email && (
              <InlineRow icon={Mail} label="Email" value={customer.email} />
            )}
            {customer.phone && (
              <InlineRow label="Phone" value={customer.phone} />
            )}
            {customer.mobile && (
              <InlineRow label="Mobile" value={customer.mobile} />
            )}
            {customer.holded_secondary_email && (
              <InlineRow label="Secondary email" value={customer.holded_secondary_email} />
            )}
            {customer.vat_number && (
              <InlineRow label="VAT" value={customer.vat_number} />
            )}
          </div>

          {/* Adres — als hele blok */}
          {(customer.address || customer.city || customer.country) && (
            <div className="text-[12px]">
              <span className="text-text-subtle text-[11px] uppercase tracking-[0.14em] block mb-0.5">Address</span>
              <span className="text-text">
                {[
                  customer.address,
                  [customer.postal_code, customer.city].filter(Boolean).join(' '),
                  customer.country,
                ].filter(Boolean).join(' · ') || '—'}
              </span>
            </div>
          )}

          {/* Custom fields (alle, ook andere dan kenteken) */}
          {cf.length > 0 && (
            <div>
              <span className="text-text-subtle text-[11px] uppercase tracking-[0.14em] block mb-1.5">
                Holded custom fields
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[12px]">
                {cf.map((f, i) => (
                  <InlineRow
                    key={i}
                    label={f.field || f.name || f.id || `Field ${i + 1}`}
                    value={f.value || '—'}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center text-[10px] font-medium text-accent bg-accent-soft border border-accent/30 rounded-full px-2 py-0.5"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <p className="text-[12px] text-text-muted italic pt-2 border-t border-border whitespace-pre-line">
              {customer.notes}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Button size="sm" variant="secondary" onClick={onOpenDrawer}>
              <Pencil size={12} /> Edit customer
            </Button>
            {customer.holded_contact_id && (
              <a
                href={`/admin/klanten/${customer.id}`}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-text-muted hover:text-text underline-offset-4 hover:underline"
              >
                <ExternalLink size={11} /> Open full profile
              </a>
            )}
            {customer.holded_synced_at && (
              <span className="text-[11px] text-text-subtle ml-auto">
                Synced {new Date(customer.holded_synced_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function InlineRow({ icon: Icon, label, value }: { icon?: typeof Mail; label: string; value: string }) {
  return (
    <span className="flex items-baseline gap-1.5 min-w-0">
      <span className="text-text-subtle text-[11px] shrink-0">{label}:</span>
      {Icon && <Icon size={11} className="text-text-subtle shrink-0" />}
      <span className="text-text truncate">{value}</span>
    </span>
  );
}
