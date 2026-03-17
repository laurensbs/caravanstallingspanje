'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wrench, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

interface ServiceRequest { id: number; customer_name: string; caravan_brand: string; caravan_model: string; caravan_license_plate: string; service_type: string; description: string; status: string; estimated_cost: number; actual_cost: number; scheduled_date: string; completed_date: string; created_at: string; }

const STATUS_COLORS: Record<string,string> = { aangevraagd: 'bg-blue-100 text-blue-700', goedgekeurd: 'bg-amber-100 text-amber-700', in_uitvoering: 'bg-purple-100 text-purple-700', afgerond: 'bg-green-100 text-green-700', geannuleerd: 'bg-gray-100 text-gray-500' };
const SERVICE_LABELS: Record<string,string> = { reparatie: 'Reparatie', onderhoud: 'Onderhoud', keuring: 'Technische keuring', schoonmaak: 'Schoonmaak', transport: 'Transport', overig: 'Overig' };

export default function DienstenPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch(`/api/admin/services?${params}`, { credentials: 'include' });
    const data = await res.json();
    setRequests(data.requests || []); setTotal(data.total || 0); setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/services/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }), credentials: 'include' });
    fetchData();
  };

  const fmt = (n: number) => n ? new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n) : '-';
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('nl-NL') : '-';
  const totalPages = Math.ceil(total / 50);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-black text-slate-900">Diensten & Serviceverzoeken</h1><p className="text-sm text-slate-400 mt-1">{total} verzoeken</p></div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 mb-6 p-4">
        <div className="flex gap-2 flex-wrap">
          {['', 'aangevraagd', 'goedgekeurd', 'in_uitvoering', 'afgerond', 'geannuleerd'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${statusFilter === s ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'}`}>{s === 'in_uitvoering' ? 'In uitvoering' : s || 'Alle'}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100"><tr>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dienst</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Caravan</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Klant</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Omschrijving</th>
            <th className="text-right px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kosten</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Datum</th>
            <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
            <th className="text-right px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Acties</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Laden...</td></tr> :
            requests.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Geen verzoeken</td></tr> :
            requests.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3"><span className="flex items-center gap-2"><Wrench size={14} className="text-slate-400"/><span className="font-medium text-slate-700">{SERVICE_LABELS[r.service_type] || r.service_type}</span></span></td>
                <td className="px-4 py-3"><div className="font-medium text-xs text-slate-700">{r.caravan_brand} {r.caravan_model}</div><div className="text-xs text-slate-400">{r.caravan_license_plate}</div></td>
                <td className="px-4 py-3 text-xs text-slate-600">{r.customer_name}</td>
                <td className="px-4 py-3 text-xs text-slate-400 max-w-[200px] truncate">{r.description || '-'}</td>
                <td className="px-4 py-3 text-right text-xs text-slate-600">{r.actual_cost ? fmt(r.actual_cost) : r.estimated_cost ? <span className="text-slate-400">~{fmt(r.estimated_cost)}</span> : '-'}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(r.scheduled_date || r.created_at)}</td>
                <td className="px-4 py-3 text-center"><span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[r.status] || 'bg-gray-100'}`}>{r.status === 'in_uitvoering' ? 'in uitvoering' : r.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 outline-none">
                    <option value="aangevraagd">Aangevraagd</option>
                    <option value="goedgekeurd">Goedgekeurd</option>
                    <option value="in_uitvoering">In uitvoering</option>
                    <option value="afgerond">Afgerond</option>
                    <option value="geannuleerd">Geannuleerd</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100"><p className="text-xs text-slate-400">Pagina {page}/{totalPages}</p><div className="flex gap-1"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronLeft size={16} className="text-slate-400"/></button><button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronRight size={16} className="text-slate-400"/></button></div></div>
        )}
      </div>
    </div>
  );
}
