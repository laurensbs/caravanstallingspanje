'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Caravan, MapPin, FileText, Receipt, Truck, ClipboardList, TrendingUp, AlertTriangle, ArrowUpRight, Activity } from 'lucide-react';

interface Stats {
  totalCustomers: number; totalCaravans: number; storedCaravans: number; onSiteCaravans: number;
  activeContracts: number; totalLocations: number; openInvoices: number; openInvoiceAmount: number;
  overdueInvoices: number; overdueAmount: number; openTasks: number; pendingTransports: number; yearRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<{ id: number; action: string; actor: string; entity_label: string; details: string; created_at: string }[]>([]);

  useEffect(() => {
    fetch('/api/admin/dashboard', { credentials: 'include' })
      .then(r => r.json()).then(d => { setStats(d.stats); setActivity(d.activity || []); }).catch(() => {});
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  if (!stats) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-warning border-t-transparent rounded-full animate-spin" /></div>;

  const cards = [
    { icon: Users, label: 'Klanten', value: stats.totalCustomers, bg: 'bg-ocean/10', text: 'text-ocean', href: '/admin/klanten' },
    { icon: Caravan, label: 'Caravans', value: stats.totalCaravans, sub: `${stats.storedCaravans} gestald · ${stats.onSiteCaravans} op camping`, bg: 'bg-primary/10', text: 'text-primary', href: '/admin/caravans' },
    { icon: MapPin, label: 'Locaties', value: stats.totalLocations, bg: 'bg-accent/10', text: 'text-accent', href: '/admin/locaties' },
    { icon: FileText, label: 'Actieve contracten', value: stats.activeContracts, bg: 'bg-ocean-dark/10', text: 'text-ocean-dark', href: '/admin/contracten' },
    { icon: Receipt, label: 'Open facturen', value: stats.openInvoices, sub: fmt(stats.openInvoiceAmount), bg: 'bg-warning/10', text: 'text-warning', href: '/admin/facturen' },
    { icon: AlertTriangle, label: 'Achterstallig', value: stats.overdueInvoices, sub: fmt(stats.overdueAmount), bg: 'bg-danger/10', text: 'text-danger', href: '/admin/facturen?status=achterstallig' },
    { icon: ClipboardList, label: 'Open taken', value: stats.openTasks, bg: 'bg-ocean-light/10', text: 'text-ocean', href: '/admin/taken' },
    { icon: Truck, label: 'Transporten gepland', value: stats.pendingTransports, bg: 'bg-primary-light/10', text: 'text-primary', href: '/admin/transport' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-surface-dark">Dashboard</h1>
          <p className="text-sm text-warm-gray/70 mt-1">Overzicht van uw stallingbedrijf</p>
        </div>
        <div className="flex items-center gap-2.5 bg-gradient-to-r from-accent/10 to-accent/20 text-accent-dark px-5 py-2.5 rounded-xl text-sm font-semibold border border-accent/30">
          <TrendingUp size={16} /> Omzet {new Date().getFullYear()}: <strong>{fmt(stats.yearRevenue)}</strong>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <Link key={c.label} href={c.href} className="bg-surface rounded-2xl p-5 border border-sand-dark/20 hover:shadow-lg hover:shadow-sand-dark/20 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg}`}>
                <c.icon size={18} className={c.text} />
              </div>
              <ArrowUpRight size={14} className="text-warm-gray/40 group-hover:text-warm-gray/70 transition-colors" />
            </div>
            <p className="text-2xl font-black text-surface-dark">{typeof c.value === 'number' ? c.value.toLocaleString('nl-NL') : c.value}</p>
            <p className="text-sm text-warm-gray/70 mt-0.5">{c.label}</p>
            {c.sub && <p className="text-xs text-warm-gray/50 mt-1">{c.sub}</p>}
          </Link>
        ))}
      </div>

      {/* Quick Actions + Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-2xl p-6 border border-sand-dark/20">
          <h2 className="font-bold text-surface-dark text-lg mb-5">Snelle acties</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Nieuwe klant', href: '/admin/klanten?actie=nieuw', icon: Users, color: 'text-ocean' },
              { label: 'Caravan toevoegen', href: '/admin/caravans?actie=nieuw', icon: Caravan, color: 'text-primary' },
              { label: 'Factuur aanmaken', href: '/admin/facturen?actie=nieuw', icon: Receipt, color: 'text-warning' },
              { label: 'Transport plannen', href: '/admin/transport?actie=nieuw', icon: Truck, color: 'text-primary' },
              { label: 'Taak aanmaken', href: '/admin/taken?actie=nieuw', icon: ClipboardList, color: 'text-ocean' },
              { label: 'Locatie beheren', href: '/admin/locaties', icon: MapPin, color: 'text-accent' },
            ].map(a => (
              <Link key={a.label} href={a.href} className="flex items-center gap-2.5 px-4 py-3.5 bg-sand/40 rounded-xl text-sm font-medium hover:bg-sand-dark/20 transition-all group border border-transparent hover:border-sand-dark/30">
                <a.icon size={16} className={a.color} /> <span className="text-warm-gray group-hover:text-surface-dark">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-6 border border-sand-dark/20">
          <div className="flex items-center gap-3 mb-5">
            <Activity size={16} className="text-warm-gray/50" />
            <h2 className="font-bold text-surface-dark text-lg">Recente activiteit</h2>
          </div>
          {activity.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-sand/40 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Activity size={20} className="text-warm-gray/50" />
              </div>
              <p className="text-warm-gray/70 text-sm">Nog geen activiteit geregistreerd.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {activity.slice(0, 10).map(a => (
                <div key={a.id} className="flex items-start gap-3 text-sm p-2.5 rounded-lg hover:bg-sand/40 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-warning mt-1.5 shrink-0" />
                  <div>
                    <p className="text-warm-gray"><span className="font-semibold text-surface-dark">{a.actor || 'Systeem'}</span> — {a.action} {a.entity_label && <span className="text-warm-gray/70">({a.entity_label})</span>}</p>
                    {a.details && <p className="text-xs text-warm-gray/70 mt-0.5">{a.details}</p>}
                    <p className="text-xs text-warm-gray/50 mt-0.5">{fmtDate(a.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
