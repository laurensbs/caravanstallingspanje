'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface Contract { id: number; contract_number: string; customer_name: string; caravan_name: string; license_plate: string; location_name: string; start_date: string; end_date: string; monthly_rate: number; status: string; auto_renew: boolean; }

const STATUS_COLORS: Record<string, string> = { actief: 'bg-green-100 text-green-700', verlopen: 'bg-red-100 text-red-700', opgezegd: 'bg-gray-100 text-gray-500', concept: 'bg-amber-100 text-amber-700' };

export default function ContractenPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_id: '', caravan_id: '', location_id: '', spot_id: '', start_date: '', end_date: '', monthly_rate: '', auto_renew: true });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch(`/api/admin/contracts?${params}`, { credentials: 'include' });
    const data = await res.json();
    setContracts(data.contracts || []); setTotal(data.total || 0); setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/contracts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), credentials: 'include' });
    setShowForm(false); fetchData();
  };

  const fmt = (n: number) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('nl-NL');
  const totalPages = Math.ceil(total / 50);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">Contracten</h1><p className="text-sm text-muted">{total} contracten</p></div>
        <button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary-light text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"><Plus size={16} /> Nieuw contract</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 p-4">
        <div className="flex gap-2">
          {['', 'actief', 'verlopen', 'opgezegd', 'concept'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'bg-surface hover:bg-gray-200'}`}>{s || 'Alle'}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b"><tr>
            <th className="text-left px-4 py-3 text-muted font-medium">Contract</th>
            <th className="text-left px-4 py-3 text-muted font-medium">Klant</th>
            <th className="text-left px-4 py-3 text-muted font-medium">Caravan</th>
            <th className="text-left px-4 py-3 text-muted font-medium">Locatie</th>
            <th className="text-left px-4 py-3 text-muted font-medium">Periode</th>
            <th className="text-right px-4 py-3 text-muted font-medium">Maandtarief</th>
            <th className="text-center px-4 py-3 text-muted font-medium">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">Laden...</td></tr> :
            contracts.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">Geen contracten</td></tr> :
            contracts.map(c => (
              <tr key={c.id} className="hover:bg-surface/50">
                <td className="px-4 py-3 font-mono text-xs">{c.contract_number}</td>
                <td className="px-4 py-3">{c.customer_name}</td>
                <td className="px-4 py-3"><p className="text-sm">{c.caravan_name}</p><p className="text-xs text-muted">{c.license_plate}</p></td>
                <td className="px-4 py-3 text-xs">{c.location_name}</td>
                <td className="px-4 py-3 text-xs">{fmtDate(c.start_date)} – {fmtDate(c.end_date)}</td>
                <td className="px-4 py-3 text-right font-medium">{fmt(Number(c.monthly_rate))}/mnd</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[c.status] || 'bg-gray-100'}`}>{c.status}</span>
                  {c.auto_renew && <span title="Auto-verlenging"><RefreshCw size={12} className="inline ml-1 text-muted" /></span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t"><p className="text-xs text-muted">Pagina {page}/{totalPages}</p><div className="flex gap-1"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="p-1.5 rounded-lg hover:bg-surface disabled:opacity-30"><ChevronLeft size={16}/></button><button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="p-1.5 rounded-lg hover:bg-surface disabled:opacity-30"><ChevronRight size={16}/></button></div></div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-lg font-bold">Nieuw contract</h2><button onClick={() => setShowForm(false)}><X size={20}/></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-muted block mb-1">Klant ID *</label><input required value={form.customer_id} onChange={e=>setForm({...form,customer_id:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"/></div>
                <div><label className="text-xs font-medium text-muted block mb-1">Caravan ID *</label><input required value={form.caravan_id} onChange={e=>setForm({...form,caravan_id:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-muted block mb-1">Locatie ID *</label><input required value={form.location_id} onChange={e=>setForm({...form,location_id:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"/></div>
                <div><label className="text-xs font-medium text-muted block mb-1">Plek ID</label><input value={form.spot_id} onChange={e=>setForm({...form,spot_id:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-muted block mb-1">Startdatum *</label><input type="date" required value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"/></div>
                <div><label className="text-xs font-medium text-muted block mb-1">Einddatum *</label><input type="date" required value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"/></div>
              </div>
              <div><label className="text-xs font-medium text-muted block mb-1">Maandtarief *</label><input type="number" step="0.01" required value={form.monthly_rate} onChange={e=>setForm({...form,monthly_rate:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"/></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.auto_renew} onChange={e=>setForm({...form,auto_renew:e.target.checked})} className="rounded"/> Automatisch verlengen</label>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2.5 text-sm text-muted">Annuleren</button>
                <button type="submit" className="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl text-sm">Opslaan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
