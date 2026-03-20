'use client';
import { fmt, fmtDate } from "@/lib/format";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Caravan, MapPin, FileText, Receipt, Truck, ClipboardList, TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight, Activity, MessageSquare, Target, Wrench, ShieldAlert, Calendar, X } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
const DashboardCharts = dynamic(() => import('./_components/DashboardCharts'), {
  ssr: false,
  loading: () => <div className="grid lg:grid-cols-2 gap-6 mb-8"><div className="bg-surface rounded-2xl p-6 border border-sand-dark/20 h-80 animate-pulse" /><div className="bg-surface rounded-2xl p-6 border border-sand-dark/20 h-80 animate-pulse" /></div>,
});

interface Stats {
  totalCustomers: number; totalCaravans: number; storedCaravans: number; onSiteCaravans: number;
  activeContracts: number; totalLocations: number; openInvoices: number; openInvoiceAmount: number;
  overdueInvoices: number; overdueAmount: number; openTasks: number; pendingTransports: number; yearRevenue: number;
  monthlyRevenue: { month: string; revenue: number; count: number }[];
}

interface Alerts {
  expiringContracts: { contract_number: string; customer_name: string; end_date: string }[];
  expiringInsurance: { brand: string; model: string; license_plate: string; insurance_expiry: string; customer_name: string }[];
  expiringApk: { brand: string; model: string; license_plate: string; apk_expiry: string; customer_name: string }[];
  unreadMessages: number;
  newLeads: number;
  pendingServices: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<{ id: number; action: string; actor: string; entity_label: string; details: string; created_at: string }[]>([]);
  const [alerts, setAlerts] = useState<Alerts | null>(null);
  const [trends, setTrends] = useState<{ newCustomers30d: number; newCaravans30d: number; newContracts30d: number; revenueGrowth30d: number } | null>(null);
  const [alertsDismissed, setAlertsDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/admin/dashboard', { credentials: 'include' })
      .then(r => r.json()).then(d => { setStats(d.stats); setActivity(d.activity || []); setAlerts(d.alerts || null); setTrends(d.trends || null); }).catch(() => {});
  }, []);


  if (!stats) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-warning border-t-transparent rounded-full animate-spin" /></div>;

  const cards = [
    { icon: Users, label: 'Klanten', value: stats.totalCustomers, gradient: 'from-ocean/15 to-ocean/5', text: 'text-ocean', href: '/admin/klanten', trend: trends?.newCustomers30d },
    { icon: Caravan, label: 'Caravans', value: stats.totalCaravans, sub: `${stats.storedCaravans} gestald · ${stats.onSiteCaravans} op camping`, gradient: 'from-primary/15 to-primary/5', text: 'text-primary', href: '/admin/caravans', trend: trends?.newCaravans30d },
    { icon: MapPin, label: 'Locaties', value: stats.totalLocations, gradient: 'from-accent/15 to-accent/5', text: 'text-accent', href: '/admin/locaties' },
    { icon: FileText, label: 'Actieve contracten', value: stats.activeContracts, gradient: 'from-ocean-dark/15 to-ocean-dark/5', text: 'text-ocean-dark', href: '/admin/contracten', trend: trends?.newContracts30d },
    { icon: Receipt, label: 'Open facturen', value: stats.openInvoices, sub: fmt(stats.openInvoiceAmount), gradient: 'from-warning/15 to-warning/5', text: 'text-warning', href: '/admin/facturen' },
    { icon: AlertTriangle, label: 'Achterstallig', value: stats.overdueInvoices, sub: fmt(stats.overdueAmount), gradient: 'from-danger/15 to-danger/5', text: 'text-danger', href: '/admin/facturen?status=achterstallig' },
    { icon: ClipboardList, label: 'Open taken', value: stats.openTasks, gradient: 'from-ocean-light/15 to-ocean-light/5', text: 'text-ocean', href: '/admin/taken' },
    { icon: Truck, label: 'Transporten gepland', value: stats.pendingTransports, gradient: 'from-primary-light/15 to-primary-light/5', text: 'text-primary', href: '/admin/transport' },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-surface-dark">Dashboard</h1>
          <p className="text-sm text-warm-gray/70 mt-1">Overzicht van uw stallingbedrijf</p>
        </div>
        <div className="flex items-center gap-2.5 bg-gradient-to-r from-accent/10 to-accent/20 text-accent-dark px-5 py-2.5 rounded-xl text-sm font-bold border border-accent/30 shadow-sm">
          <TrendingUp size={16} /> Omzet {new Date().getFullYear()}: <span className="stat-number">{fmt(stats.yearRevenue)}</span>
          {trends && trends.revenueGrowth30d > 0 && <span className="text-xs text-accent ml-1">+{fmt(trends.revenueGrowth30d)} deze maand</span>}
        </div>
      </motion.div>

      {/* Urgency Alerts */}
      {alerts && !alertsDismissed && (() => {
        const totalAlerts = (alerts.expiringContracts?.length || 0) + (alerts.expiringInsurance?.length || 0) + (alerts.expiringApk?.length || 0) + (alerts.unreadMessages > 0 ? 1 : 0) + (alerts.newLeads > 0 ? 1 : 0) + (alerts.pendingServices > 0 ? 1 : 0) + (stats.overdueInvoices > 0 ? 1 : 0);
        if (totalAlerts === 0) return null;
        return (
          <div className="bg-gradient-to-r from-danger/[0.06] via-warning/[0.06] to-primary/[0.06] rounded-2xl border border-danger/20 p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-danger" />
                <h2 className="font-bold text-surface-dark">Aandachtspunten ({totalAlerts})</h2>
              </div>
              <button onClick={() => setAlertsDismissed(true)} className="text-warm-gray/50 hover:text-warm-gray transition-colors" aria-label="Meldingen sluiten"><X size={16} /></button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.overdueInvoices > 0 && (
                <Link href="/admin/facturen?status=achterstallig" className="flex items-start gap-3 bg-surface rounded-xl p-3.5 border border-danger/20 hover:shadow-md transition-all group">
                  <div className="w-8 h-8 bg-danger/10 rounded-lg flex items-center justify-center shrink-0"><Receipt size={15} className="text-danger" /></div>
                  <div>
                    <p className="text-sm font-bold text-danger">{stats.overdueInvoices} achterstallige facturen</p>
                    <p className="text-xs text-warm-gray/70">{fmt(stats.overdueAmount)} openstaand</p>
                  </div>
                </Link>
              )}
              {alerts.expiringContracts?.length > 0 && (
                <Link href="/admin/contracten" className="flex items-start gap-3 bg-surface rounded-xl p-3.5 border border-warning/20 hover:shadow-md transition-all group">
                  <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center shrink-0"><Calendar size={15} className="text-warning" /></div>
                  <div>
                    <p className="text-sm font-bold text-warning">{alerts.expiringContracts.length} contracten verlopen binnenkort</p>
                    <p className="text-xs text-warm-gray/70">{alerts.expiringContracts[0]?.customer_name} — {fmtDate(alerts.expiringContracts[0]?.end_date)}</p>
                  </div>
                </Link>
              )}
              {alerts.expiringInsurance?.length > 0 && (
                <Link href="/admin/caravans" className="flex items-start gap-3 bg-surface rounded-xl p-3.5 border border-warning/20 hover:shadow-md transition-all group">
                  <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center shrink-0"><AlertTriangle size={15} className="text-warning" /></div>
                  <div>
                    <p className="text-sm font-bold text-warning">{alerts.expiringInsurance.length} verzekeringen verlopen</p>
                    <p className="text-xs text-warm-gray/70">{alerts.expiringInsurance[0]?.brand} — {fmtDate(alerts.expiringInsurance[0]?.insurance_expiry)}</p>
                  </div>
                </Link>
              )}
              {alerts.expiringApk?.length > 0 && (
                <Link href="/admin/caravans" className="flex items-start gap-3 bg-surface rounded-xl p-3.5 border border-warning/20 hover:shadow-md transition-all group">
                  <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center shrink-0"><AlertTriangle size={15} className="text-warning" /></div>
                  <div>
                    <p className="text-sm font-bold text-warning">{alerts.expiringApk.length} APK-keuringen verlopen</p>
                    <p className="text-xs text-warm-gray/70">{alerts.expiringApk[0]?.brand} — {fmtDate(alerts.expiringApk[0]?.apk_expiry)}</p>
                  </div>
                </Link>
              )}
              {alerts.unreadMessages > 0 && (
                <Link href="/admin/berichten" className="flex items-start gap-3 bg-surface rounded-xl p-3.5 border border-ocean/20 hover:shadow-md transition-all group">
                  <div className="w-8 h-8 bg-ocean/10 rounded-lg flex items-center justify-center shrink-0"><MessageSquare size={15} className="text-ocean" /></div>
                  <div>
                    <p className="text-sm font-bold text-ocean">{alerts.unreadMessages} ongelezen berichten</p>
                    <p className="text-xs text-warm-gray/70">Reageer op klantvragen</p>
                  </div>
                </Link>
              )}
              {alerts.newLeads > 0 && (
                <Link href="/admin/leads" className="flex items-start gap-3 bg-surface rounded-xl p-3.5 border border-accent/20 hover:shadow-md transition-all group">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center shrink-0"><Target size={15} className="text-accent" /></div>
                  <div>
                    <p className="text-sm font-bold text-accent">{alerts.newLeads} nieuwe leads deze week</p>
                    <p className="text-xs text-warm-gray/70">Neem contact op</p>
                  </div>
                </Link>
              )}
              {alerts.pendingServices > 0 && (
                <Link href="/admin/diensten" className="flex items-start gap-3 bg-surface rounded-xl p-3.5 border border-primary/20 hover:shadow-md transition-all group">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Wrench size={15} className="text-primary" /></div>
                  <div>
                    <p className="text-sm font-bold text-primary">{alerts.pendingServices} dienstaanvragen wachten</p>
                    <p className="text-xs text-warm-gray/70">Wachten op goedkeuring of uitvoering</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        );
      })()}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
          <Link href={c.href} className="card-premium p-5 block group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${c.gradient} shadow-sm`}>
                <c.icon size={18} className={c.text} />
              </div>
              <div className="flex items-center gap-1">
                {'trend' in c && c.trend != null && c.trend !== 0 && (
                  <span className={`flex items-center gap-0.5 text-xs font-semibold ${c.trend > 0 ? 'text-accent' : 'text-danger'}`}>
                    {c.trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {c.trend > 0 ? '+' : ''}{c.trend}
                  </span>
                )}
                <ArrowUpRight size={14} className="text-warm-gray/40 group-hover:text-warm-gray/70 transition-colors" />
              </div>
            </div>
            <p className="stat-number text-2xl">{typeof c.value === 'number' ? c.value.toLocaleString('nl-NL') : c.value}</p>
            <p className="text-sm text-warm-gray/70 mt-0.5">{c.label}</p>
            {c.sub && <p className="text-xs text-warm-gray/50 mt-1">{c.sub}</p>}
          </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts stats={stats} />

      {/* Quick Actions + Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-premium p-6">
          <h2 className="font-black text-surface-dark text-lg mb-5">Snelle acties</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Nieuwe klant', href: '/admin/klanten?actie=nieuw', icon: Users, color: 'text-ocean', gradient: 'from-ocean/10 to-ocean/5' },
              { label: 'Caravan toevoegen', href: '/admin/caravans?actie=nieuw', icon: Caravan, color: 'text-primary', gradient: 'from-primary/10 to-primary/5' },
              { label: 'Factuur aanmaken', href: '/admin/facturen?actie=nieuw', icon: Receipt, color: 'text-warning', gradient: 'from-warning/10 to-warning/5' },
              { label: 'Transport plannen', href: '/admin/transport?actie=nieuw', icon: Truck, color: 'text-primary', gradient: 'from-primary/10 to-primary/5' },
              { label: 'Taak aanmaken', href: '/admin/taken?actie=nieuw', icon: ClipboardList, color: 'text-ocean', gradient: 'from-ocean/10 to-ocean/5' },
              { label: 'Locatie beheren', href: '/admin/locaties', icon: MapPin, color: 'text-accent', gradient: 'from-accent/10 to-accent/5' },
            ].map(a => (
              <Link key={a.label} href={a.href} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium hover:-translate-y-0.5 transition-all group border border-sand-dark/15 hover:border-sand-dark/30 hover:shadow-md">
                <div className={`w-8 h-8 bg-gradient-to-br ${a.gradient} rounded-lg flex items-center justify-center`}>
                  <a.icon size={14} className={a.color} />
                </div>
                <span className="text-warm-gray group-hover:text-surface-dark font-semibold">{a.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card-premium p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-gradient-to-br from-primary/15 to-primary/5 rounded-lg flex items-center justify-center">
              <Activity size={14} className="text-primary" />
            </div>
            <h2 className="font-black text-surface-dark text-lg">Recente activiteit</h2>
          </div>
          {activity.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-sand/40 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Activity size={20} className="text-warm-gray/50" />
              </div>
              <p className="text-warm-gray/70 text-sm">Nog geen activiteit geregistreerd.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {activity.slice(0, 10).map(a => (
                <div key={a.id} className="flex items-start gap-3 text-sm p-3 rounded-xl hover:bg-sand/30 transition-colors border border-transparent hover:border-sand-dark/15">
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
        </motion.div>
      </div>
    </div>
  );
}
