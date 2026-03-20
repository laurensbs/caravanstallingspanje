'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';
import { fmt } from '@/lib/format';

interface Props {
  stats: {
    storedCaravans: number; onSiteCaravans: number; totalCaravans: number;
    activeContracts: number; yearRevenue: number; openInvoiceAmount: number;
    monthlyRevenue: { month: string; revenue: number; count: number }[];
  };
}

export default function DashboardCharts({ stats }: Props) {
  const stored = stats.storedCaravans || 0;
  const onSite = stats.onSiteCaravans || 0;
  const inTransit = Math.max(0, (stats.totalCaravans || 0) - stored - onSite);
  const total = stats.totalCaravans || 1;
  const pct = Math.round((stored / total) * 100);
  const pieData = [
    { name: 'Gestald', value: stored, color: '#1a6b8a' },
    { name: 'Op camping', value: onSite, color: '#C4653A' },
    { name: 'In transit', value: inTransit, color: '#d4c5b0' },
  ].filter(d => d.value > 0);

  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-8">
      {/* Occupancy — Pie Chart */}
      <div className="bg-surface rounded-2xl p-6 border border-gray-200">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-5"><BarChart3 size={16} className="text-ocean" /> Bezettingsgraad</h2>
        <div className="flex items-center justify-between mb-4">
          <div><p className="text-3xl font-bold text-gray-900">{pct}%</p><p className="text-xs text-gray-500/70">{stored} van {total} plekken bezet</p></div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={2} stroke="#FAF9F7">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(value) => [String(value), '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          {pieData.map(d => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-500/70">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              {d.name} ({d.value})
            </div>
          ))}
        </div>
      </div>

      {/* Revenue — Bar Chart */}
      <div className="bg-surface rounded-2xl p-6 border border-gray-200">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-5"><TrendingUp size={16} className="text-accent" /> Maandomzet</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-accent/[0.06] rounded-xl p-4 border border-accent/20">
            <p className="text-xs text-gray-500/70 mb-1">Jaaromzet {new Date().getFullYear()}</p>
            <p className="text-xl font-bold text-gray-900">{fmt(stats.yearRevenue)}</p>
          </div>
          <div className="bg-warning/[0.06] rounded-xl p-4 border border-warning/20">
            <p className="text-xs text-gray-500/70 mb-1">Openstaand</p>
            <p className="text-xl font-bold text-gray-900">{fmt(stats.openInvoiceAmount)}</p>
          </div>
        </div>
        {(stats.monthlyRevenue?.length || 0) > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyRevenue.map(m => ({ ...m, label: m.month.slice(5) }))}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8a7f77' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8a7f77' }} axisLine={false} tickLine={false} tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [fmt(Number(value)), 'Omzet']} labelFormatter={(l) => `Maand ${l}`} />
                <Bar dataKey="revenue" fill="#3D5A3E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-500/50 text-sm">Nog geen omzetdata</div>
        )}
        {stats.activeContracts > 0 && (
          <div className="bg-gray-50 rounded-xl p-3 text-center mt-2">
            <p className="text-xs text-gray-500/70">Gemiddelde maandelijkse omzet per contract</p>
            <p className="text-lg font-bold text-gray-900">{fmt(stats.yearRevenue / 12 / stats.activeContracts)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
