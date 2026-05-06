'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Refrigerator, ArrowUpRight, AlertCircle, CheckCircle2, Truck, Package,
  Activity, Receipt, RefreshCw, Loader2, Sparkles, FileCheck2,
  Warehouse, MessageSquare, Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/admin/PageHeader';
import { Skeleton, Button } from '@/components/ui';

type Stats = {
  totalFridges: number;
  totalBookings: number;
  byStatus: { status: string; count: string }[];
  inUse?: {
    large: { current: number; capacity: number };
    table: { current: number; capacity: number };
    airco: { current: number; capacity: number };
  };
  needsSalesInvoice?: number;
};

type ActivityEvent = {
  id: number;
  actor: string | null;
  action: string;
  entity_label: string | null;
  details: string | null;
  created_at: string;
};

type HoldedRow = { kind: string; status: string | null; count: string | number };

type RecentOrder = {
  id: number;
  created_at: string;
  status: string;
  customer_name: string;
  device_type?: string;
  camping?: string | null;
  type?: string;
  start_date?: string | null;
  subject?: string | null;
  title?: string | null;
  category?: string | null;
};
type RecentOrders = {
  fridge: RecentOrder[];
  stalling: RecentOrder[];
  transport: RecentOrder[];
  contact: RecentOrder[];
  ideas: RecentOrder[];
  waitlist: RecentOrder[];
  total: number;
};

const EMPTY_RECENT: RecentOrders = { fridge: [], stalling: [], transport: [], contact: [], ideas: [], waitlist: [], total: 0 };

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<ActivityEvent[] | null>(null);
  const [holded, setHolded] = useState<HoldedRow[] | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [recent, setRecent] = useState<RecentOrders | null>(null);
  const [pending, setPending] = useState<Record<string, number> | null>(null);

  const loadHolded = () => {
    fetch('/api/admin/holded-status', { credentials: 'include' })
      .then((r) => r.json().catch(() => ({ rows: [] })))
      .then((d) => setHolded(Array.isArray(d?.rows) ? d.rows : []))
      .catch(() => setHolded([]));
  };

  useEffect(() => {
    fetch('/api/admin/fridges?stats=true', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d || !Array.isArray(d.byStatus)) {
          setStats({ totalFridges: 0, totalBookings: 0, byStatus: [] });
          return;
        }
        setStats(d);
      })
      .catch(() => setStats({ totalFridges: 0, totalBookings: 0, byStatus: [] }));
    fetch('/api/admin/activity', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : { events: [] })
      .then((d) => setEvents(d.events || []))
      .catch(() => setEvents([]));
    loadHolded();

    // Recent-orders bannerdata — initieel + elke 30s pollen zodat admin
    // niet hoeft te refreshen om nieuwe orders te zien. Werkt ook bij
    // fout: setRecent valt op EMPTY_RECENT terug.
    const loadRecent = () => {
      fetch('/api/admin/recent-orders', { credentials: 'include' })
        .then((r) => r.ok ? r.json() : null)
        .then((d) => setRecent(d || EMPTY_RECENT))
        .catch(() => setRecent(EMPTY_RECENT));
    };
    loadRecent();
    const pollId = setInterval(loadRecent, 30_000);

    // Pending-counts uit /api/admin/badge-counts. Dashboard toont 'm in een
    // eigen "Action queue"-rij zodat ik in 1 oogopslag zie waar ik moet
    // kijken zonder door de sidebar te scrollen.
    const loadPending = () => {
      fetch('/api/admin/badge-counts', { credentials: 'include' })
        .then((r) => r.ok ? r.json() : null)
        .then((d) => setPending(d || {}))
        .catch(() => setPending({}));
    };
    loadPending();
    const pendingPoll = setInterval(loadPending, 30_000);

    return () => {
      clearInterval(pollId);
      clearInterval(pendingPoll);
    };
  }, []);

  const triggerSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/cron/holded-sync', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'sync failed');
      toast.success(`Synced: ${data.bookings + data.stalling + data.transport} invoices`);
      loadHolded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const [syncingCustomers, setSyncingCustomers] = useState(false);
  const triggerCustomerSync = async () => {
    setSyncingCustomers(true);
    try {
      const res = await fetch('/api/cron/holded-customers-sync', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'sync failed');
      toast.success(`Klanten gesynced — verwerkt ${data.processed}: gekoppeld ${data.linked}, aangemaakt ${data.created}, gepusht ${data.pushed}, snapshot ${data.pulled}${data.errors ? `, errors ${data.errors}` : ''}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Klant-sync mislukt');
    } finally {
      setSyncingCustomers(false);
    }
  };

  const byStatus = stats?.byStatus ?? [];
  const compleet = parseInt(byStatus.find((s) => s.status === 'compleet')?.count || '0');
  const controleren = parseInt(byStatus.find((s) => s.status === 'controleren')?.count || '0');

  const inUseLarge = stats?.inUse?.large.current ?? 0;
  const inUseTable = stats?.inUse?.table.current ?? 0;
  const inUseAirco = stats?.inUse?.airco.current ?? 0;
  const inUseTotal = inUseLarge + inUseTable + inUseAirco;

  const tiles = [
    { label: 'Customers', value: stats?.totalFridges, href: '/admin/koelkasten', icon: Refrigerator },
    { label: 'Currently out', value: inUseTotal, href: '/admin/koelkasten', icon: Truck },
    { label: 'Needs review', value: controleren, href: '/admin/koelkasten?status=controleren', icon: AlertCircle, tone: 'warning' as const },
    { label: 'Periods complete', value: compleet, href: '/admin/koelkasten?status=compleet', icon: CheckCircle2, tone: 'success' as const },
    { label: 'Needs sales invoice', value: stats?.needsSalesInvoice ?? 0, href: '/admin/koelkasten', icon: FileCheck2, tone: ((stats?.needsSalesInvoice ?? 0) > 0 ? 'warning' : 'success') as 'warning' | 'success' },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Dashboard"
        description="Live overview of fridges, AC units, stock and items needing attention."
      />

      {recent && recent.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 rounded-[var(--radius-lg)] border p-4 flex items-start gap-3"
          style={{ background: 'var(--color-warning-soft)', borderColor: 'rgba(244,185,66,0.3)' }}
        >
          <span
            aria-hidden
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'rgba(244,185,66,0.25)', color: 'var(--color-warning)' }}
          >
            <Sparkles size={16} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-text">
              {recent.total} new {recent.total === 1 ? 'order' : 'orders'} in the last 24 hours
            </p>
            <div className="text-[12px] text-text-muted mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
              {recent.fridge.length > 0 && <span>{recent.fridge.length} fridge/AC</span>}
              {recent.stalling.length > 0 && <span>{recent.stalling.length} storage</span>}
              {recent.transport.length > 0 && <span>{recent.transport.length} transport</span>}
              {recent.contact.length > 0 && <span>{recent.contact.length} message{recent.contact.length === 1 ? '' : 's'}</span>}
              {recent.ideas.length > 0 && <span>{recent.ideas.length} idea{recent.ideas.length === 1 ? '' : 's'}</span>}
              {recent.waitlist.length > 0 && <span>{recent.waitlist.length} waitlist</span>}
            </div>
            {recent.fridge.slice(0, 3).map((o) => (
              <div key={`f-${o.id}`} className="text-[12px] text-text mt-1.5">
                <span className="font-medium">{o.customer_name}</span>
                {o.device_type && <span className="text-text-muted"> · {o.device_type}</span>}
                {o.camping && <span className="text-text-muted"> · {o.camping}</span>}
                <span className="text-text-subtle ml-2">{new Date(o.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
          <Link
            href="/admin/koelkasten?status=controleren"
            className="text-[12px] font-medium text-warning hover:underline underline-offset-4 shrink-0 mt-0.5"
          >
            Review →
          </Link>
        </motion.div>
      )}

      <PendingQueue counts={pending} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {tiles.map((t, i) => {
          const Icon = t.icon;
          const toneClass =
            t.tone === 'warning' ? 'text-warning' :
            t.tone === 'success' ? 'text-success' : 'text-text';
          return (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={t.href} className="card-surface group hover-lift block p-6">
                <div className="flex items-start justify-between mb-7">
                  <Icon size={20} className={toneClass} />
                  <ArrowUpRight size={15} className="text-text-subtle group-hover:text-text transition-colors" />
                </div>
                {stats === null ? (
                  <Skeleton className="h-9 w-20 mb-2" />
                ) : (
                  <div className="text-4xl font-semibold tabular-nums tracking-tight">{t.value}</div>
                )}
                <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted mt-2 font-medium">
                  {t.label}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <section className="mt-12">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted mb-4 flex items-center gap-2">
          <Package size={13} /> Stock occupancy today
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StockBar label="Large fridge" current={inUseLarge}
            capacity={stats?.inUse?.large.capacity ?? 110} loading={stats === null}
            href="/admin/koelkasten?device=Grote%20koelkast" />
          <StockBar label="Table fridge" current={inUseTable}
            capacity={stats?.inUse?.table.capacity ?? 20} loading={stats === null}
            href="/admin/koelkasten?device=Tafelmodel" />
          <StockBar label="AC" current={inUseAirco}
            capacity={stats?.inUse?.airco.capacity ?? 10} loading={stats === null}
            href="/admin/koelkasten?device=Airco" />
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted flex items-center gap-2">
            <Receipt size={13} /> Pro formas in Holded
          </h2>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={triggerCustomerSync} disabled={syncingCustomers}>
              {syncingCustomers ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              Sync klanten
            </Button>
            <Button size="sm" variant="secondary" onClick={triggerSync} disabled={syncing}>
              {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              Sync facturen
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <InvoiceTile label="Paid" status="paid" rows={holded} tone="success" />
          <InvoiceTile label="Open" status="unpaid" rows={holded} tone="warning" />
          <InvoiceTile label="Partial" status="partial" rows={holded} tone="warning" />
          <InvoiceTile label="Unknown" status="unknown" rows={holded} tone="neutral" />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted mb-4 flex items-center gap-2">
          <Activity size={13} /> Recent activity
        </h2>
        <div className="card-surface divide-y divide-border">
          {events === null ? (
            <div className="p-6 space-y-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          ) : events.length === 0 ? (
            <p className="p-6 text-[13px] text-text-muted">No activity yet.</p>
          ) : (
            events.map((e) => (
              <div key={e.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium text-text truncate">{e.action}</div>
                  {e.entity_label && (
                    <div className="text-[12px] text-text-muted truncate">{e.entity_label}</div>
                  )}
                </div>
                <span className="text-[11px] text-text-subtle tabular-nums shrink-0">
                  {new Date(e.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}

function InvoiceTile({ label, status, rows, tone }: {
  label: string;
  status: string;
  rows: HoldedRow[] | null;
  tone: 'success' | 'warning' | 'neutral';
}) {
  const total = (rows ?? []).filter((r) => (r.status ?? 'unknown') === status)
    .reduce((sum, r) => sum + Number(r.count || 0), 0);
  const breakdown = (rows ?? []).filter((r) => (r.status ?? 'unknown') === status);
  const colorClass =
    tone === 'success' ? 'text-success' :
    tone === 'warning' ? 'text-warning' : 'text-text';
  return (
    <div className="card-surface p-5">
      <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-medium">{label}</div>
      {rows === null ? (
        <Skeleton className="h-9 w-16 mt-2" />
      ) : (
        <>
          <div className={`text-3xl font-semibold tabular-nums tracking-tight mt-2 ${colorClass}`}>{total}</div>
          {breakdown.length > 0 ? (
            <div className="text-[11px] text-text-muted mt-2 space-x-2">
              {breakdown.map((r, i) => (
                <span key={i}>{r.count} {r.kind}{i < breakdown.length - 1 ? ' ·' : ''}</span>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-text-muted mt-2">none</div>
          )}
        </>
      )}
    </div>
  );
}

function StockBar({ label, current, capacity, loading, href }: {
  label: string; current: number; capacity: number; loading: boolean; href?: string;
}) {
  const pct = capacity > 0 ? Math.min(100, Math.round((current / capacity) * 100)) : 0;
  const barColor =
    pct >= 90 ? 'var(--color-danger)' :
    pct >= 70 ? 'var(--color-warning)' :
    'var(--color-accent)';
  // Wrap in Link als 'r een href is — anders gewoon een div zodat we niet
  // een lege link renderen.
  const Wrapper: React.ElementType = href ? Link : 'div';
  const wrapperProps = href
    ? { href, className: 'card-surface p-6 block hover:border-accent/40 transition-all group cursor-pointer' }
    : { className: 'card-surface p-6' };
  return (
    <Wrapper {...wrapperProps}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[14px] font-semibold">{label}</span>
        {loading ? (
          <Skeleton className="h-4 w-14" />
        ) : (
          <span className="text-[13px] tabular-nums text-text-muted">
            <span className="text-text font-semibold">{current}</span> / {capacity}
          </span>
        )}
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: loading ? 0 : `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: barColor, height: '100%' }}
        />
      </div>
      {!loading && (
        <p className="text-[12px] text-text-muted mt-2.5 flex items-center gap-1">
          <span>{capacity - current} available · {pct}% occupied</span>
          {href && <ArrowUpRight size={11} className="text-text-subtle group-hover:text-accent ml-auto transition-colors" />}
        </p>
      )}
    </Wrapper>
  );
}

// Action queue: in 1 oogopslag waar ik (Laurens) actie moet ondernemen.
// Toont alleen kanalen met >0 pending — geen 0-tegels die ruis maken.
const PENDING_DEFS: Array<{ key: string; label: string; href: string; Icon: LucideIcon }> = [
  { key: 'service_requests', label: 'Service-aanvragen', href: '/admin/service-requests', Icon: Wrench },
  { key: 'transport', label: 'Transport', href: '/admin/transport', Icon: Truck },
  { key: 'stalling', label: 'Stalling', href: '/admin/stalling', Icon: Warehouse },
  { key: 'fridge', label: 'Koelkast/airco', href: '/admin/koelkasten?status=controleren', Icon: Refrigerator },
  { key: 'contact', label: 'Contact-berichten', href: '/admin/contact', Icon: MessageSquare },
];

function PendingQueue({ counts }: { counts: Record<string, number> | null }) {
  if (!counts) return null;
  const items = PENDING_DEFS
    .map((d) => ({ ...d, n: counts[d.key] || 0 }))
    .filter((d) => d.n > 0);
  if (items.length === 0) {
    return (
      <div className="mb-6 rounded-[var(--radius-lg)] border border-border p-4 flex items-center gap-3" style={{ background: 'var(--color-success-soft)' }}>
        <CheckCircle2 size={16} className="text-success" />
        <span className="text-[13px] text-text">Niets in de wachtrij — alles is afgehandeld.</span>
      </div>
    );
  }
  return (
    <div className="mb-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted mb-2 flex items-center gap-2">
        <AlertCircle size={12} /> Action queue
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((it) => {
          const Icon = it.Icon;
          return (
            <Link
              key={it.key}
              href={it.href}
              className="card-surface hover-lift p-3 flex items-center gap-3"
            >
              <span className="w-9 h-9 rounded-md grid place-items-center flex-shrink-0" style={{ background: 'var(--color-warning-soft)', color: 'var(--color-warning)' }}>
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-2xl font-semibold tabular-nums leading-none">{it.n}</div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-text-muted mt-1 truncate">{it.label}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
