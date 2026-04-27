'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Refrigerator, ArrowUpRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui';

type Stats = {
  totalFridges: number;
  totalBookings: number;
  byStatus: { status: string; count: string }[];
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

  const tiles = [
    { label: 'Klanten', value: stats?.totalFridges, href: '/admin/koelkasten', icon: Refrigerator, accent: 'text-text' },
    { label: 'Periodes compleet', value: compleet, href: '/admin/koelkasten?status=compleet', icon: CheckCircle2, accent: 'text-success' },
    { label: 'Aandachtspunten', value: controleren, href: '/admin/koelkasten?status=controleren', icon: AlertCircle, accent: 'text-warning' },
  ];

  return (
    <div className="max-w-5xl">
      <header className="mb-10">
        <h1 className="text-2xl font-medium text-text tracking-tight">Welkom</h1>
        <p className="text-sm text-text-muted mt-1">Overzicht van het koelkast-systeem.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
    </div>
  );
}
