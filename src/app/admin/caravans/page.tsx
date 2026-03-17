'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, ChevronLeft, ChevronRight, Edit2, MapPin, Filter, Trash2 } from 'lucide-react';

interface CaravanRow {
  id: number; brand: string; model: string; year: number; license_plate: string;
  length_m: number; weight_kg: number; has_mover: boolean; status: string; customer_id: number; customer_name: string; customer_email: string;
  spot_id: number; spot_label: string; location_id: number; location_name: string; insurance_expiry: string; apk_expiry: string; notes: string; created_at: string;
}

interface CustomerOption { id: number; first_name: string; last_name: string; email: string; }
interface LocationOption { id: number; name: string; }
interface SpotOption { id: number; label: string; zone: string; status: string; }

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
  const [editing, setEditing] = useState<CaravanRow | null>(null);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [spots, setSpots] = useState<SpotOption[]>([]);
  const [form, setForm] = useState({ customer_id: '', brand: '', model: '', year: '', license_plate: '', length_m: '', weight_kg: '', has_mover: false, status: 'gestald', location_id: '', spot_id: '', insurance_expiry: '', apk_expiry: '', notes: '' });
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

  const loadFormOptions = async () => {
    const [custRes, locRes] = await Promise.all([
      fetch('/api/admin/customers?limit=500', { credentials: 'include' }),
      fetch('/api/admin/locations', { credentials: 'include' }),
    ]);
    const custData = await custRes.json();
    const locData = await locRes.json();
    setCustomers(custData.customers || []);
    setLocations(locData.locations || []);
  };

  const loadSpots = async (locationId: string) => {
    if (!locationId) { setSpots([]); return; }
    const res = await fetch(`/api/admin/locations/${locationId}/spots`, { credentials: 'include' });
    const data = await res.json();
    setSpots((data.spots || []).filter((s: SpotOption) => s.status === 'vrij'));
  };

  const openNew = async () => {
    setEditing(null);
    setForm({ customer_id: '', brand: '', model: '', year: '', license_plate: '', length_m: '', weight_kg: '', has_mover: false, status: 'gestald', location_id: '', spot_id: '', insurance_expiry: '', apk_expiry: '', notes: '' });
    await loadFormOptions();
    setShowForm(true);
  };

  const openEdit = async (c: CaravanRow) => {
    setEditing(c);
    setForm({
      customer_id: String(c.customer_id || ''), brand: c.brand, model: c.model || '', year: c.year ? String(c.year) : '',
      license_plate: c.license_plate || '', length_m: c.length_m ? String(c.length_m) : '', weight_kg: c.weight_kg ? String(c.weight_kg) : '',
      has_mover: c.has_mover, status: c.status, location_id: c.location_id ? String(c.location_id) : '',
      spot_id: c.spot_id ? String(c.spot_id) : '', insurance_expiry: c.insurance_expiry ? c.insurance_expiry.split('T')[0] : '',
      apk_expiry: c.apk_expiry ? c.apk_expiry.split('T')[0] : '', notes: c.notes || '',
    });
    await loadFormOptions();
    if (c.location_id) await loadSpots(String(c.location_id));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await fetch(`/api/admin/caravans/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), credentials: 'include' });
    } else {
      await fetch('/api/admin/caravans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), credentials: 'include' });
    }
    setShowForm(false); setEditing(null); fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze caravan wilt verwijderen?')) return;
    await fetch(`/api/admin/caravans/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchData();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Caravans</h1>
          <p className="text-sm text-slate-400 mt-1">{total.toLocaleString('nl-NL')} caravans totaal</p>
        </div>
        <button onClick={openNew} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all">
          <Plus size={16} /> Caravan toevoegen
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 mb-6 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3.5 py-2.5 flex-1 min-w-[200px] border border-slate-100">
            <Search size={15} className="text-slate-300" />
            <input placeholder="Zoek op merk, model, kenteken, klant..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="bg-transparent text-sm outline-none flex-1 text-slate-600 placeholder:text-slate-300" />
            {search && <button onClick={() => setSearch('')}><X size={14} className="text-slate-400" /></button>}
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-300" />
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-sm text-slate-600">
              <option value="">Alle statussen</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Caravan</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kenteken</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Klant</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Locatie / Plek</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Laden...</td></tr>
              ) : caravans.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Geen caravans gevonden</td></tr>
              ) : caravans.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{c.brand} {c.model}</p>
                    <p className="text-xs text-slate-400">{c.year || '-'} · {c.length_m ? `${c.length_m}m` : ''} {c.weight_kg ? `· ${c.weight_kg}kg` : ''}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{c.license_plate || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{c.customer_name || '-'}</td>
                  <td className="px-4 py-3">
                    {c.location_name ? (
                      <span className="flex items-center gap-1 text-xs text-slate-600"><MapPin size={12} className="text-amber-500" /> {c.location_name} {c.spot_label ? `· ${c.spot_label}` : ''}</span>
                    ) : <span className="text-xs text-slate-400">Geen plek</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[c.status] || 'bg-gray-100'}`}>{c.status.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="Bewerken"><Edit2 size={14} className="text-slate-400" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Verwijderen"><Trash2 size={14} className="text-slate-300 hover:text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">Pagina {page} van {totalPages} ({total} resultaten)</p>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronLeft size={16} className="text-slate-400" /></button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronRight size={16} className="text-slate-400" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{editing ? 'Caravan bewerken' : 'Caravan toevoegen'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Klant *</label>
                <select required value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all">
                  <option value="">Selecteer klant...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({c.email})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-slate-500 block mb-1">Merk *</label><input required value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all" /></div>
                <div><label className="text-xs font-semibold text-slate-500 block mb-1">Model</label><input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-xs font-semibold text-slate-500 block mb-1">Bouwjaar</label><input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all" /></div>
                <div><label className="text-xs font-semibold text-slate-500 block mb-1">Kenteken</label><input value={form.license_plate} onChange={e => setForm({ ...form, license_plate: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all" /></div>
                <div><label className="text-xs font-semibold text-slate-500 block mb-1">Lengte (m)</label><input type="number" step="0.1" value={form.length_m} onChange={e => setForm({ ...form, length_m: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-slate-500 block mb-1">Gewicht (kg)</label><input type="number" value={form.weight_kg} onChange={e => setForm({ ...form, weight_kg: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all" /></div>
                <div><label className="text-xs font-semibold text-slate-500 block mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all">
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Locatie</label>
                  <select value={form.location_id} onChange={e => { setForm({ ...form, location_id: e.target.value, spot_id: '' }); loadSpots(e.target.value); }} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all">
                    <option value="">Geen locatie</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Stallingplek</label>
                  <select value={form.spot_id} onChange={e => setForm({ ...form, spot_id: e.target.value })} disabled={!form.location_id} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all disabled:opacity-50">
                    <option value="">Geen plek</option>
                    {spots.map(s => <option key={s.id} value={s.id}>{s.label} (Zone {s.zone})</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-slate-500 block mb-1">Verzekering verloopt</label><input type="date" value={form.insurance_expiry} onChange={e => setForm({ ...form, insurance_expiry: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all" /></div>
                <div><label className="text-xs font-semibold text-slate-500 block mb-1">APK verloopt</label><input type="date" value={form.apk_expiry} onChange={e => setForm({ ...form, apk_expiry: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all" /></div>
              </div>
              <div className="flex items-center gap-2 py-1"><input type="checkbox" id="mover" checked={form.has_mover} onChange={e => setForm({ ...form, has_mover: e.target.checked })} className="rounded" /><label htmlFor="mover" className="text-sm text-slate-600">Heeft mover</label></div>
              <div><label className="text-xs font-semibold text-slate-500 block mb-1">Notities</label><textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all resize-none" /></div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">Annuleren</button>
                <button type="submit" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all">{editing ? 'Bijwerken' : 'Opslaan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
