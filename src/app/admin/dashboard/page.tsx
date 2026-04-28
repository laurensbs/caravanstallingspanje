'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Refrigerator, ArrowUpRight, AlertCircle, CheckCircle2, Truck, Package,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { Skeleton } from '@/components/ui';

type Stats = {
  totalFridges: number;
  totalBookings: number;
  byStatus: { status: string; count: string }[];
  inUse?: {
    large: { current: number; capacity: number };
    table: { current: number; capacity: number };
  };
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/admin/fridges?stats=true', { credentials: 'include' })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats({ totalFridges: 0, totalBookings: 0, byStatus: [] }));
  }, []);

  const compleet = parseInt(
    stats?.byStatus.find((s) => s.status === 'compleet')?.count || '0'
  );
  const controleren = parseInt(
    stats?.byStatus.find((s) => s.status === 'controleren')?.count || '0'
  );

  const inUseLarge = stats?.inUse?.large.current ?? 0;
  const inUseTable = stats?.inUse?.table.current ?? 0;
  const inUseTotal = inUseLarge + inUseTable;

  const tiles = [
    {
      label: 'Klanten',
      value: stats?.totalFridges,
      href: '/admin/koelkasten',
      icon: Refrigerator,
    },
    {
      label: 'Nu in omloop',
      value: inUseTotal,
      href: '/admin/koelkasten',
      icon: Truck,
    },
    {
      label: 'Aandachtspunten',
      value: controleren,
      href: '/admin/koelkasten?status=controleren',
      icon: AlertCircle,
      tone: 'warning' as const,
    },
    {
      label: 'Periodes compleet',
      value: compleet,
      href: '/admin/koelkasten?status=compleet',
      icon: CheckCircle2,
      tone: 'success' as const,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Operatie"
        title="Dashboard"
        description="Live overzicht van koelkasten, voorraad en aandachtspunten."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tiles.map((t, i) => {
          const Icon = t.icon;
          const toneClass =
            t.tone === 'warning'
              ? 'text-warning'
              : t.tone === 'success'
              ? 'text-success'
              : 'text-text';
          return (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={t.href}
                className="card-surface group hover-lift block p-5"
              >
                <div className="flex items-start justify-between mb-6">
                  <Icon size={18} className={toneClass} />
                  <ArrowUpRight
                    size={14}
                    className="text-text-subtle group-hover:text-text transition-colors"
                  />
                </div>
                {stats === null ? (
                  <Skeleton className="h-7 w-16 mb-2" />
                ) : (
                  <div className="text-3xl font-semibold tabular-nums">{t.value}</div>
                )}
                <div className="text-[11px] uppercase tracking-wider text-text-muted mt-1.5">
                  {t.label}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <section className="mt-10">
        <h2 className="text-[10px] font-medium uppercase tracking-[0.22em] text-text-muted mb-3 flex items-center gap-2">
          <Package size={12} /> Voorraad-bezetting vandaag
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StockBar
            label="Grote koelkast"
            current={inUseLarge}
            capacity={stats?.inUse?.large.capacity ?? 110}
            loading={stats === null}
          />
          <StockBar
            label="Tafelmodel koelkast"
            current={inUseTable}
            capacity={stats?.inUse?.table.capacity ?? 20}
            loading={stats === null}
          />
        </div>
      </section>
    </>
  );
}

function StockBar({
  label, current, capacity, loading,
}: {
  label: string;
  current: number;
  capacity: number;
  loading: boolean;
}) {
  const pct = capacity > 0 ? Math.min(100, Math.round((current / capacity) * 100)) : 0;
  const barColor =
    pct >= 90
      ? 'var(--color-danger)'
      : pct >= 70
      ? 'var(--color-warning)'
      : 'var(--color-accent)';
  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-medium">{label}</span>
        {loading ? (
          <Skeleton className="h-4 w-14" />
        ) : (
          <span className="text-[12px] tabular-nums text-text-muted">
            <span className="text-text font-semibold">{current}</span> / {capacity}
          </span>
        )}
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: 'var(--color-surface-2)' }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: loading ? 0 : `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: barColor, height: '100%' }}
        />
      </div>
      {!loading && (
        <p className="text-[11px] text-text-muted mt-2">
          {capacity - current} beschikbaar · {pct}% bezet
        </p>
      )}
    </div>
  );
}
