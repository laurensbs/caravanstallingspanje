'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, ChevronLeft, ChevronRight, Edit2, MapPin, Filter } from 'lucide-react';

interface CaravanRow {
  id: number; brand: string; model: string; year: number; license_plate: string;
  length_m: number; weight_kg: number; has_mover: boolean; status: string; customer_name: string; customer_email: string;
  spot_label: string; location_name: string; created_at: string;
}

const STATUSES = ['gestald', 'op_camping', 'in_transit', 'onderhoud', 'verkocht'];
const STATUS_COLORS: Record<string, string> = { gestald: 'bg-green-100 text-green-700', op_camping: 'bg-blue-100 text-blue-700', in_transit: 'bg-amber-100 text-amber-700', onderhoud: 'bg-orange-100 text-orange-700', verkocht: 'bg-gray-100 text-gray-500' };

export default function CaravansPage() {
  const [caravans, setCaravans] = useState<CaravanRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_id: '', brand: '', model: '', year: '', license_plate: '', length_m: '', weight_kg: '', has_mover: false, status: 'gestald', notes: '' });
  const limit = 50;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch(`/api/admin/caravans?${params}`, { credentials: 'include' });
    const data = await res.json();
    setCaravans(data.caravans || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/caravans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), credentials: 'include' });
    setShowForm(false); fetchData();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Caravans</h1>
          <p className="text-sm text-muted">{total.toLocaleString('nl-NL')} caravans totaal</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary-light text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <Plus size={16} /> Caravan toevoegen
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search size={16} className="text-muted" />
            <input placeholder="Zoek op merk, model, kenteken, klant..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="bg-transparent text-sm outline-none flex-1" />
            {search && <button onClick={() => setSearch('')}><X size={14} className="text-muted" /></button>}
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted" />
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="bg-surface rounded-xl px-3 py-2 text-sm">
              <option value="">Alle statussen</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted">Caravan</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Kenteken</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Klant</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Locatie / Plek</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">Laden...</td></tr>
              ) : caravans.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">Geen caravans gevonden</td></tr>
              ) : caravans.map(c => (
                <tr key={c.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.brand} {c.model}</p>
                    <p className="text-xs text-muted">{c.year || '-'} · {c.length_m ? `${c.length_m}m` : ''}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{c.license_plate || '-'}</td>
                  <td className="px-4 py-3 text-sm">{c.customer_name}</td>
                  <td className="px-4 py-3">
                    {c.location_name ? (
                      <span className="flex items-center gap-1 text-xs"><MapPin size={12} className="text-primary" /> {c.location_name} · {c.spot_label}</span>
                    ) : <span className="text-xs text-muted">Geen plek</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[c.status] || 'bg-gray-100'}`}>{c.status.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-1.5 hover:bg-surface rounded-lg"><Edit2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-muted">Pagina {page} van {totalPages} ({total} resultaten)</p>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-surface disabled:opacity-30"><ChevronLeft size={16} /></button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-surface disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold">Caravan toevoegen</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="text-xs font-medium text-muted block mb-1">Klant ID *</label><input required value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" placeholder="Klant ID"/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-muted block mb-1">Merk *</label><input required value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" /></div>
                <div><label className="text-xs font-medium text-muted block mb-1">Model</label><input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-xs font-medium text-muted block mb-1">Bouwjaar</label><input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" /></div>
                <div><label className="text-xs font-medium text-muted block mb-1">Kenteken</label><input value={form.license_plate} onChange={e => setForm({ ...form, license_plate: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" /></div>
                <div><label className="text-xs font-medium text-muted block mb-1">Lengte (m)</label><input type="number" step="0.1" value={form.length_m} onChange={e => setForm({ ...form, length_m: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-muted block mb-1">Gewicht (kg)</label><input type="number" value={form.weight_kg} onChange={e => setForm({ ...form, weight_kg: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" /></div>
                <div className="flex items-end"><label className="flex items-center gap-2 text-sm pb-2.5"><input type="checkbox" checked={form.has_mover} onChange={e => setForm({ ...form, has_mover: e.target.checked })} className="rounded" /> Heeft mover</label></div>
              </div>
              <div><label className="text-xs font-medium text-muted block mb-1">Notities</label><textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none" /></div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm font-medium text-muted hover:bg-surface rounded-xl">Annuleren</button>
                <button type="submit" className="bg-primary hover:bg-primary-light text-white font-semibold px-6 py-2.5 rounded-xl text-sm">Opslaan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
