'use client';

import { useState, useEffect, useCallback } from 'react';
import { Truck, Plus, X, ChevronLeft, ChevronRight, MapPin, ArrowRight } from 'lucide-react';

interface TransportOrder { id: number; customer_name: string; caravan_brand: string; caravan_model: string; caravan_license_plate: string; pickup_address: string; delivery_address: string; scheduled_date: string; completed_date: string; status: string; notes: string; assigned_staff_name: string; created_at: string; }

const STATUS_COLORS: Record<string,string> = { aangevraagd: 'bg-blue-100 text-blue-700', gepland: 'bg-amber-100 text-amber-700', onderweg: 'bg-purple-100 text-purple-700', afgeleverd: 'bg-green-100 text-green-700', geannuleerd: 'bg-gray-100 text-gray-500' };

export default function TransportPage() {
  const [orders, setOrders] = useState<TransportOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ caravan_id: '', pickup_address: '', delivery_address: '', scheduled_date: '', notes: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch(`/api/admin/transport?${params}`, { credentials: 'include' });
    const data = await res.json();
    setOrders(data.orders || []); setTotal(data.total || 0); setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/transport', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), credentials: 'include' });
    setShowForm(false); setForm({ caravan_id: '', pickup_address: '', delivery_address: '', scheduled_date: '', notes: '' }); fetchData();
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/transport/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }), credentials: 'include' });
    fetchData();
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('nl-NL') : '-';
  const totalPages = Math.ceil(total / 50);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">Transport</h1><p className="text-sm text-muted">{total} transportopdrachten</p></div>
        <button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary-light text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"><Plus size={16} /> Nieuwe opdracht</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border mb-6 p-4">
        <div className="flex gap-2 flex-wrap">
          {['', 'aangevraagd', 'gepland', 'onderweg', 'afgeleverd', 'geannuleerd'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusFilter === s ? 'bg-primary text-white' : 'bg-surface hover:bg-gray-200'}`}>{s || 'Alle'}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b"><tr>
            <th className="text-left px-4 py-3 text-muted font-medium">Caravan</th>
            <th className="text-left px-4 py-3 text-muted font-medium">Route</th>
            <th className="text-left px-4 py-3 text-muted font-medium">Klant</th>
            <th className="text-left px-4 py-3 text-muted font-medium">Datum</th>
            <th className="text-left px-4 py-3 text-muted font-medium">Chauffeur</th>
            <th className="text-center px-4 py-3 text-muted font-medium">Status</th>
            <th className="text-right px-4 py-3 text-muted font-medium">Acties</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">Laden...</td></tr> :
            orders.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">Geen transportopdrachten</td></tr> :
            orders.map(o => (
              <tr key={o.id} className="hover:bg-surface/50">
                <td className="px-4 py-3"><div className="font-medium">{o.caravan_brand} {o.caravan_model}</div><div className="text-xs text-muted">{o.caravan_license_plate}</div></td>
                <td className="px-4 py-3"><div className="flex items-center gap-1 text-xs"><MapPin size={12} className="text-muted flex-shrink-0"/><span className="truncate max-w-[100px]">{o.pickup_address || 'Stalling'}</span><ArrowRight size={12} className="text-muted flex-shrink-0"/><span className="truncate max-w-[100px]">{o.delivery_address || 'Stalling'}</span></div></td>
                <td className="px-4 py-3 text-xs">{o.customer_name}</td>
                <td className="px-4 py-3 text-xs">{fmtDate(o.scheduled_date)}</td>
                <td className="px-4 py-3 text-xs">{o.assigned_staff_name || 'Niet toegewezen'}</td>
                <td className="px-4 py-3 text-center"><span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[o.status] || 'bg-gray-100'}`}>{o.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} className="text-xs border rounded-lg px-2 py-1">
                    <option value="aangevraagd">Aangevraagd</option>
                    <option value="gepland">Gepland</option>
                    <option value="onderweg">Onderweg</option>
                    <option value="afgeleverd">Afgeleverd</option>
                    <option value="geannuleerd">Geannuleerd</option>
                  </select>
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
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-lg font-bold">Nieuwe transportopdracht</h2><button onClick={()=>setShowForm(false)}><X size={20}/></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="text-xs font-medium text-muted block mb-1">Caravan ID *</label><input required value={form.caravan_id} onChange={e=>setForm({...form,caravan_id:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"/></div>
              <div><label className="text-xs font-medium text-muted block mb-1">Ophaaladres</label><input value={form.pickup_address} onChange={e=>setForm({...form,pickup_address:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"/></div>
              <div><label className="text-xs font-medium text-muted block mb-1">Afleveradres</label><input value={form.delivery_address} onChange={e=>setForm({...form,delivery_address:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"/></div>
              <div><label className="text-xs font-medium text-muted block mb-1">Geplande datum *</label><input type="date" required value={form.scheduled_date} onChange={e=>setForm({...form,scheduled_date:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"/></div>
              <div><label className="text-xs font-medium text-muted block mb-1">Opmerkingen</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm" rows={3}/></div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2.5 text-sm text-muted">Annuleren</button>
                <button type="submit" className="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl text-sm">Aanmaken</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
