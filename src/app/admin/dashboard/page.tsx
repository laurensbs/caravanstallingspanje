'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Refrigerator, ArrowUpRight, AlertCircle, CheckCircle2, Truck, Package,
  Activity, Receipt, RefreshCw, Loader2,
} from 'lucide-react';
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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<ActivityEvent[] | null>(null);
  const [holded, setHolded] = useState<HoldedRow[] | null>(null);
  const [syncing, setSyncing] = useState(false);

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
  }, []);

  const triggerSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/cron/holded-sync', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'sync failed');
      toast.success(`Synchroniseerd: ${data.bookings + data.stalling + data.transport} facturen`);
      loadHolded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sync mislukt');
    } finally {
      setSyncing(false);
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
    { label: 'Klanten', value: stats?.totalFridges, href: '/admin/koelkasten', icon: Refrigerator },
    { label: 'Nu in omloop', value: inUseTotal, href: '/admin/koelkasten', icon: Truck },
    { label: 'Aandachtspunten', value: controleren, href: '/admin/koelkasten?status=controleren', icon: AlertCircle, tone: 'warning' as const },
    { label: 'Periodes compleet', value: compleet, href: '/admin/koelkasten?status=compleet', icon: CheckCircle2, tone: 'success' as const },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Operatie"
        title="Dashboard"
        description="Live overzicht van koelkasten, airco, voorraad en aandachtspunten."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          <Package size={13} /> Voorraad-bezetting vandaag
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StockBar label="Grote koelkast" current={inUseLarge}
            capacity={stats?.inUse?.large.capacity ?? 110} loading={stats === null} />
          <StockBar label="Tafelmodel koelkast" current={inUseTable}
            capacity={stats?.inUse?.table.capacity ?? 20} loading={stats === null} />
          <StockBar label="Airco" current={inUseAirco}
            capacity={stats?.inUse?.airco.capacity ?? 10} loading={stats === null} />
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted flex items-center gap-2">
            <Receipt size={13} /> Facturen in Holded
          </h2>
          <Button size="sm" variant="secondary" onClick={triggerSync} disabled={syncing}>
            {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Sync nu
          </Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <InvoiceTile label="Betaald" status="paid" rows={holded} tone="success" />
          <InvoiceTile label="Open" status="unpaid" rows={holded} tone="warning" />
          <InvoiceTile label="Deels" status="partial" rows={holded} tone="warning" />
          <InvoiceTile label="Onbekend" status="unknown" rows={holded} tone="neutral" />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted mb-4 flex items-center gap-2">
          <Activity size={13} /> Recente activiteit
        </h2>
        <div className="card-surface divide-y divide-border">
          {events === null ? (
            <div className="p-6 space-y-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          ) : events.length === 0 ? (
            <p className="p-6 text-[13px] text-text-muted">Nog geen activiteit.</p>
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
                  {new Date(e.created_at).toLocaleString('nl-NL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
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
            <div className="text-[11px] text-text-muted mt-2">geen</div>
          )}
        </>
      )}
    </div>
  );
}

function StockBar({ label, current, capacity, loading }: {
  label: string; current: number; capacity: number; loading: boolean;
}) {
  const pct = capacity > 0 ? Math.min(100, Math.round((current / capacity) * 100)) : 0;
  const barColor =
    pct >= 90 ? 'var(--color-danger)' :
    pct >= 70 ? 'var(--color-warning)' :
    'var(--color-accent)';
  return (
    <div className="card-surface p-6">
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
        <p className="text-[12px] text-text-muted mt-2.5">
          {capacity - current} beschikbaar · {pct}% bezet
        </p>
      )}
    </div>
  );
}
