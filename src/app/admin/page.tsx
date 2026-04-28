'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Refrigerator, ArrowUpRight, AlertCircle, CheckCircle2, Truck, Package } from 'lucide-react';
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
      .then(r => r.json())
      .then(setStats)
      .catch(() => setStats({ totalFridges: 0, totalBookings: 0, byStatus: [] }));
  }, []);

  const compleet = parseInt(stats?.byStatus.find(s => s.status === 'compleet')?.count || '0');
  const controleren = parseInt(stats?.byStatus.find(s => s.status === 'controleren')?.count || '0');

  const inUseLarge = stats?.inUse?.large.current ?? 0;
  const inUseTable = stats?.inUse?.table.current ?? 0;
  const inUseTotal = inUseLarge + inUseTable;

  const tiles = [
    { label: 'Klanten', value: stats?.totalFridges, href: '/admin/koelkasten', icon: Refrigerator, accent: 'text-text' },
    { label: 'Nu in omloop', value: inUseTotal, href: '/admin/koelkasten', icon: Truck, accent: 'text-text' },
    { label: 'Aandachtspunten', value: controleren, href: '/admin/koelkasten?status=controleren', icon: AlertCircle, accent: 'text-warning' },
    { label: 'Periodes compleet', value: compleet, href: '/admin/koelkasten?status=compleet', icon: CheckCircle2, accent: 'text-success' },
  ];

  return (
    <div className="max-w-5xl">
      <header className="mb-10">
        <h1 className="text-2xl font-medium text-text tracking-tight">Welkom</h1>
        <p className="text-sm text-text-muted mt-1">Overzicht van het koelkast-systeem.</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tiles.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Link
                href={t.href}
                className="group block p-5 bg-surface border border-border rounded-[var(--radius-xl)] hover:border-border-strong hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <Icon size={18} className={t.accent} />
                  <ArrowUpRight size={16} className="text-text-subtle group-hover:text-text transition-colors" />
                </div>
                {stats === null ? (
                  <Skeleton className="h-7 w-16 mb-2" />
                ) : (
                  <div className="text-3xl font-medium text-text tabular-nums">{t.value}</div>
                )}
                <div className="text-xs text-text-muted mt-1">{t.label}</div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <section className="mt-10">
        <h2 className="text-xs font-medium uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
          <Package size={13} /> Voorraad-bezetting vandaag
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
    </div>
  );
}

function StockBar({ label, current, capacity, loading }: { label: string; current: number; capacity: number; loading: boolean }) {
  const pct = capacity > 0 ? Math.min(100, Math.round((current / capacity) * 100)) : 0;
  const tone = pct >= 90 ? 'bg-danger' : pct >= 70 ? 'bg-warning' : 'bg-success';
  return (
    <div className="p-5 bg-surface border border-border rounded-[var(--radius-xl)]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">{label}</span>
        {loading ? (
          <Skeleton className="h-5 w-14" />
        ) : (
          <span className="text-sm tabular-nums text-text-muted">
            <span className="text-text font-medium">{current}</span> / {capacity}
          </span>
        )}
      </div>
      <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: loading ? 0 : `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full ${tone}`}
        />
      </div>
      {!loading && (
        <p className="text-xs text-text-muted mt-2">
          {capacity - current} beschikbaar · {pct}% bezet
        </p>
      )}
    </div>
  );
}
