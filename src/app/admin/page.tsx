'use client';

import { useState, useEffect } from 'react';
import { Users, Caravan, MapPin, FileText, Receipt, Truck, ClipboardList, TrendingUp, AlertTriangle, Euro, ArrowUpRight } from 'lucide-react';

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

  if (!stats) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const cards = [
    { icon: Users, label: 'Klanten', value: stats.totalCustomers, color: 'text-blue-600 bg-blue-50' },
    { icon: Caravan, label: 'Caravans', value: stats.totalCaravans, sub: `${stats.storedCaravans} gestald, ${stats.onSiteCaravans} op camping`, color: 'text-purple-600 bg-purple-50' },
    { icon: MapPin, label: 'Locaties', value: stats.totalLocations, color: 'text-green-600 bg-green-50' },
    { icon: FileText, label: 'Actieve contracten', value: stats.activeContracts, color: 'text-indigo-600 bg-indigo-50' },
    { icon: Receipt, label: 'Open facturen', value: stats.openInvoices, sub: fmt(stats.openInvoiceAmount), color: 'text-amber-600 bg-amber-50' },
    { icon: AlertTriangle, label: 'Achterstallig', value: stats.overdueInvoices, sub: fmt(stats.overdueAmount), color: 'text-red-600 bg-red-50' },
    { icon: ClipboardList, label: 'Open taken', value: stats.openTasks, color: 'text-cyan-600 bg-cyan-50' },
    { icon: Truck, label: 'Transporten gepland', value: stats.pendingTransports, color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-muted">Overzicht van uw stallingbedrijf</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-medium">
          <TrendingUp size={16} /> Omzet {new Date().getFullYear()}: <strong>{fmt(stats.yearRevenue)}</strong>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color}`}>
                <c.icon size={20} />
              </div>
              <ArrowUpRight size={16} className="text-muted" />
            </div>
            <p className="text-2xl font-bold">{typeof c.value === 'number' ? c.value.toLocaleString('nl-NL') : c.value}</p>
            <p className="text-sm text-muted">{c.label}</p>
            {c.sub && <p className="text-xs text-muted mt-1">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Revenue card + Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-lg mb-4">Snelle acties</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Nieuwe klant', href: '/admin/klanten?actie=nieuw', icon: Users },
              { label: 'Caravan toevoegen', href: '/admin/caravans?actie=nieuw', icon: Caravan },
              { label: 'Factuur aanmaken', href: '/admin/facturen?actie=nieuw', icon: Receipt },
              { label: 'Transport plannen', href: '/admin/transport?actie=nieuw', icon: Truck },
              { label: 'Taak aanmaken', href: '/admin/taken?actie=nieuw', icon: ClipboardList },
              { label: 'Locatie beheren', href: '/admin/locaties', icon: MapPin },
            ].map(a => (
              <a key={a.label} href={a.href} className="flex items-center gap-2 px-4 py-3 bg-surface rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                <a.icon size={16} className="text-primary" /> {a.label}
              </a>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-lg mb-4">Recente activiteit</h2>
          {activity.length === 0 ? (
            <p className="text-muted text-sm">Nog geen activiteit geregistreerd.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activity.slice(0, 10).map(a => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p><span className="font-medium">{a.actor || 'Systeem'}</span> — {a.action} {a.entity_label && <span className="text-muted">({a.entity_label})</span>}</p>
                    {a.details && <p className="text-xs text-muted">{a.details}</p>}
                    <p className="text-xs text-muted">{fmtDate(a.created_at)}</p>
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
