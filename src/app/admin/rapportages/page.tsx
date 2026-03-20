"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, MapPin, FileText, Receipt, Euro, Percent, ArrowUp, ArrowDown, Calendar, Download } from "lucide-react";
import { motion } from "framer-motion";

interface Stats {
  totalCustomers: number;
  activeContracts: number;
  totalCaravans: number;
  occupancyRate: number;
  monthlyRevenue: number;
  outstandingInvoices: number;
  revenueGrowth: number;
  newCustomersThisMonth: number;
  contractsByType: { type: string; count: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  occupancyByLocation: { location: string; occupied: number; total: number }[];
}

function StatCard({ icon: Icon, label, value, sub, trend, color }: { icon: React.ElementType; label: string; value: string; sub?: string; trend?: number; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-surface rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:shadow-gray-200/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}><Icon size={20} /></div>
        {trend !== undefined && (
          <span className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-full ${trend >= 0 ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'}`}>
            {trend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500/70 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-500/50 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

function BarChartSimple({ data, height = 200 }: { data: { label: string; value: number }[]; height?: number }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs font-bold text-gray-500">€{(d.value / 1000).toFixed(1)}k</span>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.value / max) * 100}%` }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-lg min-h-[4px]"
          />
          <span className="text-xs text-gray-500/70">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function OccupancyBar({ location, occupied, total }: { location: string; occupied: number; total: number }) {
  const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
  return (
    <div className="flex items-center gap-4">
      <div className="w-32 text-sm font-medium text-gray-900 truncate">{location}</div>
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6 }}
          className={`h-full rounded-full ${pct > 90 ? 'bg-danger/100' : pct > 70 ? 'bg-warning/100' : 'bg-accent/100'}`}
        />
      </div>
      <div className="w-16 text-right text-sm font-bold text-gray-500">{pct}%</div>
      <div className="w-20 text-right text-xs text-gray-500/70">{occupied}/{total}</div>
    </div>
  );
}

export default function RapportagesPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("jaar");
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    fetch("/api/admin/dashboard", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        setStats({
          totalCustomers: data.totalCustomers || 0,
          activeContracts: data.activeContracts || 0,
          totalCaravans: data.totalCaravans || 0,
          occupancyRate: data.occupancyRate || 0,
          monthlyRevenue: data.monthlyRevenue || 0,
          outstandingInvoices: data.outstandingInvoices || 0,
          revenueGrowth: data.revenueGrowth || 0,
          newCustomersThisMonth: data.newCustomersThisMonth || 0,
          contractsByType: data.contractsByType || [],
          revenueByMonth: data.revenueByMonth || Array.from({ length: 12 }, (_, i) => ({ month: ['Jan','Feb','Mrt','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Dec'][i], revenue: 0 })),
          occupancyByLocation: data.occupancyByLocation || [],
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(n);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
    </div>
  );

  if (!stats) return (
    <div className="text-center py-32">
      <BarChart3 size={48} className="text-gray-500/40 mx-auto mb-4" />
      <p className="text-gray-500/70">Kon rapportages niet laden</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapportages & Analytics</h1>
          <p className="text-sm text-gray-500/70 mt-1">Overzicht van bezetting, omzet en klantstatistieken</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {["maand", "kwartaal", "jaar"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${period === p ? 'bg-surface text-gray-900 shadow-sm' : 'text-gray-500/70 hover:text-gray-500'}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative">
            <button onClick={() => setShowExport(!showExport)} className="flex items-center gap-2 text-sm font-semibold text-gray-500 bg-surface border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all">
              <Download size={14} /> Exporteren
            </button>
            {showExport && (
              <div className="absolute right-0 top-full mt-2 bg-surface rounded-xl border border-gray-200 shadow-xl py-2 w-56 z-50">
                {[
                  { label: 'Klanten (CSV)', type: 'customers' },
                  { label: 'Contracten (CSV)', type: 'contracts' },
                  { label: 'Facturen (CSV)', type: 'invoices' },
                  { label: 'Caravans (CSV)', type: 'caravans' },
                  { label: 'Transport (CSV)', type: 'transport' },
                  { label: 'Omzet rapport (CSV)', type: 'revenue' },
                ].map(item => (
                  <a key={item.type} href={`/api/admin/export?type=${item.type}`} className="block px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors" onClick={() => setShowExport(false)}>
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Totaal klanten" value={String(stats.totalCustomers)} trend={stats.newCustomersThisMonth > 0 ? stats.newCustomersThisMonth : undefined} color="bg-sky-50 text-sky-600" sub={`${stats.newCustomersThisMonth} nieuw deze maand`} />
        <StatCard icon={FileText} label="Actieve contracten" value={String(stats.activeContracts)} color="bg-accent/10 text-accent" />
        <StatCard icon={Euro} label="Maandomzet" value={fmt(stats.monthlyRevenue)} trend={stats.revenueGrowth} color="bg-warning/10 text-warning" />
        <StatCard icon={Percent} label="Bezettingsgraad" value={`${stats.occupancyRate}%`} color={`${stats.occupancyRate > 85 ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent'}`} sub={`${stats.totalCaravans} caravans gestald`} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Omzet overzicht</h3>
              <p className="text-xs text-gray-500/70 mt-0.5">Maandelijkse omzet in €</p>
            </div>
            <TrendingUp size={18} className="text-gray-500/50" />
          </div>
          <BarChartSimple
            data={stats.revenueByMonth.map(r => ({ label: r.month, value: r.revenue }))}
            height={220}
          />
        </div>

        {/* Occupancy by Location */}
        <div className="bg-surface rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Bezetting per locatie</h3>
              <p className="text-xs text-gray-500/70 mt-0.5">Plekken bezet / totaal</p>
            </div>
            <MapPin size={18} className="text-gray-500/50" />
          </div>
          <div className="space-y-4">
            {stats.occupancyByLocation.length > 0 ? (
              stats.occupancyByLocation.map(loc => (
                <OccupancyBar key={loc.location} {...loc} />
              ))
            ) : (
              <div className="text-center py-8">
                <MapPin size={32} className="text-gray-500/40 mx-auto mb-2" />
                <p className="text-xs text-gray-500/70">Geen locatiedata beschikbaar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contracts by Type */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-6">Contracten per type</h3>
          <div className="space-y-3">
            {(stats.contractsByType.length > 0 ? stats.contractsByType : [
              { type: 'Buitenstalling', count: 0 },
              { type: 'Binnenstalling', count: 0 },
              { type: 'Seizoensstalling', count: 0 },
            ]).map(ct => {
              const total = stats.activeContracts || 1;
              const pct = Math.round((ct.count / total) * 100);
              return (
                <div key={ct.type} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-gray-900">{ct.type}</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-8 text-right text-sm font-bold text-gray-500">{ct.count}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Openstaande facturen</h3>
            <Receipt size={18} className="text-gray-500/50" />
          </div>
          <div className="text-center py-6">
            <p className="text-4xl font-bold text-warning">{stats.outstandingInvoices}</p>
            <p className="text-sm text-gray-500/70 mt-2">openstaande facturen</p>
          </div>
          <a href="/admin/facturen" className="block text-center text-sm font-semibold text-accent hover:text-primary-light transition-colors mt-4">
            Bekijk facturen →
          </a>
        </div>
      </div>
    </div>
  );
}
