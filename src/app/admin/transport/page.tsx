'use client';

import { useState } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, MapPin, ArrowRight } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import Modal from '@/components/ui/Modal';

import { TRANSPORT_STATUS_COLORS } from '@/lib/format';
interface TransportOrder { id: number; customer_name: string; caravan_brand: string; caravan_model: string; caravan_license_plate: string; pickup_address: string; delivery_address: string; scheduled_date: string; completed_date: string; status: string; notes: string; assigned_staff_name: string; created_at: string; }
interface CaravanOption { id: number; brand: string; model: string; license_plate: string; customer_name: string; }
interface StaffOption { id: number; first_name: string; last_name: string; }


export default function TransportPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { items: orders, total, page, setPage, loading, refetch: fetchData } = useAdminData<TransportOrder>({ endpoint: '/api/admin/transport', dataKey: 'orders', params: { status: statusFilter } });
  const [showForm, setShowForm] = useState(false);
  const [caravans, setCaravans] = useState<CaravanOption[]>([]);
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [form, setForm] = useState({ caravan_id: '', pickup_address: '', delivery_address: '', scheduled_date: '', notes: '', assigned_staff_id: '' });

  const openForm = async () => {
    const [caravanRes, staffRes] = await Promise.all([
      fetch('/api/admin/caravans?limit=500', { credentials: 'include' }),
      fetch('/api/admin/staff?limit=500', { credentials: 'include' }),
    ]);
    const caravanData = await caravanRes.json();
    const staffData = await staffRes.json();
    setCaravans(caravanData.caravans || []);
    setStaffList(staffData.staff || []);
    setForm({ caravan_id: '', pickup_address: '', delivery_address: '', scheduled_date: '', notes: '', assigned_staff_id: '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/transport', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), credentials: 'include' });
    setShowForm(false); fetchData();
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/transport/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }), credentials: 'include' });
    fetchData();
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('nl-NL') : '-';
  const totalPages = Math.ceil(total / 50);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-black text-surface-dark">Transport</h1><p className="text-sm text-warm-gray/70 mt-1">{total} transportopdrachten</p></div>
        <button onClick={openForm} className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"><Plus size={16} /> Nieuwe opdracht</button>
      </div>

      <div className="bg-surface rounded-2xl border border-sand-dark/20 mb-6 p-4">
        <div className="flex gap-2 flex-wrap">
          {['', 'aangevraagd', 'gepland', 'onderweg', 'afgeleverd', 'geannuleerd'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${statusFilter === s ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-sand/40 hover:bg-sand-dark/20 text-warm-gray'}`}>{s || 'Alle'}</button>
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-sand-dark/20 overflow-hidden">
        <div className="table-responsive">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-sand/40 border-b border-sand-dark/20"><tr>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Caravan</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Route</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Klant</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Datum</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Chauffeur</th>
            <th className="text-center px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Status</th>
            <th className="text-right px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Acties</th>
          </tr></thead>
          <tbody className="divide-y divide-sand-dark/10">
            {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-warm-gray/70">Laden...</td></tr> :
            orders.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-warm-gray/70">Geen transportopdrachten</td></tr> :
            orders.map(o => (
              <tr key={o.id} className="hover:bg-sand/30 transition-colors">
                <td className="px-4 py-3"><div className="font-medium text-surface-dark">{o.caravan_brand} {o.caravan_model}</div><div className="text-xs text-warm-gray/70">{o.caravan_license_plate}</div></td>
                <td className="px-4 py-3"><div className="flex items-center gap-1 text-xs text-warm-gray"><MapPin size={12} className="text-warm-gray/50 flex-shrink-0"/><span className="truncate max-w-[100px]">{o.pickup_address || 'Stalling'}</span><ArrowRight size={12} className="text-warm-gray/50 flex-shrink-0"/><span className="truncate max-w-[100px]">{o.delivery_address || 'Stalling'}</span></div></td>
                <td className="px-4 py-3 text-xs text-warm-gray">{o.customer_name}</td>
                <td className="px-4 py-3 text-xs text-warm-gray">{fmtDate(o.scheduled_date)}</td>
                <td className="px-4 py-3 text-xs text-warm-gray">{o.assigned_staff_name || 'Niet toegewezen'}</td>
                <td className="px-4 py-3 text-center"><span className={`text-xs font-medium px-2 py-1 rounded-full ${TRANSPORT_STATUS_COLORS[o.status] || 'bg-sand'}`}>{o.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} className="text-xs border border-sand-dark/30 rounded-lg px-2 py-1 bg-sand/40 focus:ring-2 focus:ring-primary/20 outline-none">
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
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-sand-dark/20"><p className="text-xs text-warm-gray/70">Pagina {page}/{totalPages}</p><div className="flex gap-1"><button disabled={page<=1} onClick={()=>setPage(page-1)} className="p-1.5 rounded-lg hover:bg-sand-dark/20 disabled:opacity-30 transition-colors" aria-label="Vorige pagina"><ChevronLeft size={16} className="text-warm-gray/70"/></button><button disabled={page>=totalPages} onClick={()=>setPage(page+1)} className="p-1.5 rounded-lg hover:bg-sand-dark/20 disabled:opacity-30 transition-colors" aria-label="Volgende pagina"><ChevronRight size={16} className="text-warm-gray/70"/></button></div></div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nieuwe transportopdracht">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-warm-gray block mb-1">Caravan *</label>
                <select required value={form.caravan_id} onChange={e=>setForm({...form,caravan_id:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                  <option value="">Selecteer caravan...</option>
                  {caravans.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} — {c.license_plate} ({c.customer_name})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-warm-gray block mb-1">Chauffeur (optioneel)</label>
                <select value={form.assigned_staff_id} onChange={e=>setForm({...form,assigned_staff_id:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                  <option value="">Niet toegewezen</option>
                  {staffList.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-semibold text-warm-gray block mb-1">Ophaaladres</label><input value={form.pickup_address} onChange={e=>setForm({...form,pickup_address:e.target.value})} placeholder="Bijv. Stalling Costa del Sol" className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"/></div>
              <div><label className="text-xs font-semibold text-warm-gray block mb-1">Afleveradres</label><input value={form.delivery_address} onChange={e=>setForm({...form,delivery_address:e.target.value})} placeholder="Bijv. Camping La Marina, Alicante" className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"/></div>
              <div><label className="text-xs font-semibold text-warm-gray block mb-1">Geplande datum *</label><input type="date" required value={form.scheduled_date} onChange={e=>setForm({...form,scheduled_date:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"/></div>
              <div><label className="text-xs font-semibold text-warm-gray block mb-1">Opmerkingen</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Bijzonderheden voor transport..." className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" rows={3}/></div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2.5 text-sm text-warm-gray/70 hover:bg-sand-dark/20 rounded-xl transition-colors">Annuleren</button>
                <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-primary/20 transition-all">Aanmaken</button>
              </div>
            </form>
      </Modal>
    </div>
  );
}
