'use client';
import { fmt, fmtDate, SERVICE_STATUS_COLORS } from "@/lib/format";

import { useState } from 'react';
import { Wrench, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';

interface ServiceRequest { id: number; customer_name: string; caravan_brand: string; caravan_model: string; caravan_license_plate: string; service_type: string; description: string; status: string; estimated_cost: number; actual_cost: number; scheduled_date: string; completed_date: string; created_at: string; }

const SERVICE_LABELS: Record<string,string> = { reparatie: 'Reparatie', onderhoud: 'Onderhoud', keuring: 'Technische keuring', schoonmaak: 'Schoonmaak', transport: 'Transport', overig: 'Overig' };

export default function DienstenPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { items: requests, total, page, setPage, loading, refetch: fetchData } = useAdminData<ServiceRequest>({ endpoint: '/api/admin/services', dataKey: 'requests', params: { status: statusFilter } });

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/services/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }), credentials: 'include' });
    fetchData();
  };

  const totalPages = Math.ceil(total / 50);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-gray-900">Diensten & Serviceverzoeken</h1><p className="text-sm text-gray-500/70 mt-1">{total} verzoeken</p></div>
      </div>

      <div className="bg-surface rounded-2xl border border-gray-200 mb-6 p-4">
        <div className="flex gap-2 flex-wrap">
          {['', 'aangevraagd', 'goedgekeurd', 'in_uitvoering', 'afgerond', 'geannuleerd'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${statusFilter === s ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-gray-50 hover:bg-gray-300/20 text-gray-500'}`}>{s === 'in_uitvoering' ? 'In uitvoering' : s || 'Alle'}</button>
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-gray-200 overflow-hidden">
        <div className="table-responsive">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200"><tr>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Dienst</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Caravan</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Klant</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Omschrijving</th>
            <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Kosten</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Datum</th>
            <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Status</th>
            <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Acties</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500/70">Laden...</td></tr> :
            requests.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500/70">Geen verzoeken</td></tr> :
            requests.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3"><span className="flex items-center gap-2"><Wrench size={14} className="text-gray-500/70"/><span className="font-medium text-gray-900">{SERVICE_LABELS[r.service_type] || r.service_type}</span></span></td>
                <td className="px-4 py-3"><div className="font-medium text-xs text-gray-900">{r.caravan_brand} {r.caravan_model}</div><div className="text-xs text-gray-500/70">{r.caravan_license_plate}</div></td>
                <td className="px-4 py-3 text-xs text-gray-500">{r.customer_name}</td>
                <td className="px-4 py-3 text-xs text-gray-500/70 max-w-[200px] truncate">{r.description || '-'}</td>
                <td className="px-4 py-3 text-right text-xs text-gray-500">{r.actual_cost ? fmt(r.actual_cost) : r.estimated_cost ? <span className="text-gray-500/70">~{fmt(r.estimated_cost)}</span> : '-'}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(r.scheduled_date || r.created_at)}</td>
                <td className="px-4 py-3 text-center"><span className={`text-xs font-medium px-2 py-1 rounded-full ${SERVICE_STATUS_COLORS[r.status] || 'bg-gray-100'}`}>{r.status === 'in_uitvoering' ? 'in uitvoering' : r.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none">
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
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200"><p className="text-xs text-gray-500/70">Pagina {page}/{totalPages}</p><div className="flex gap-1"><button disabled={page<=1} onClick={()=>setPage(page-1)} className="p-1.5 rounded-lg hover:bg-gray-300/20 disabled:opacity-30 transition-colors" aria-label="Vorige pagina"><ChevronLeft size={16} className="text-gray-500/70"/></button><button disabled={page>=totalPages} onClick={()=>setPage(page+1)} className="p-1.5 rounded-lg hover:bg-gray-300/20 disabled:opacity-30 transition-colors" aria-label="Volgende pagina"><ChevronRight size={16} className="text-gray-500/70"/></button></div></div>
        )}
      </div>
    </div>
  );
}
