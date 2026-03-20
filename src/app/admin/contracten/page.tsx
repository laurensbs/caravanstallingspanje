'use client';
import { fmt, fmtDate, CONTRACT_STATUS_COLORS } from "@/lib/format";

import { useState, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight, RefreshCw, Edit2, Download, CheckSquare, Square } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import Modal from '@/components/ui/Modal';
import FilterBar, { type FilterConfig } from '@/components/admin/FilterBar';
import { toast } from 'sonner';

interface Contract { id: number; contract_number: string; customer_name: string; caravan_name: string; license_plate: string; location_name: string; start_date: string; end_date: string; monthly_rate: number; status: string; auto_renew: boolean; }
interface CustomerOption { id: number; first_name: string; last_name: string; }
interface CaravanOption { id: number; brand: string; model: string; license_plate: string; customer_id: number; }
interface LocationOption { id: number; name: string; }
interface SpotOption { id: number; label: string; zone: string; status: string; }

const FILTER_CONFIG: FilterConfig = {
  search: { placeholder: 'Zoek op klant, contractnr, kenteken...' },
  statuses: [
    { value: '', label: 'Alle' },
    { value: 'actief', label: 'Actief' },
    { value: 'verlopen', label: 'Verlopen' },
    { value: 'opgezegd', label: 'Opgezegd' },
    { value: 'concept', label: 'Concept' },
  ],
  sort: { options: [
    { value: 'created_at', label: 'Aangemaakt' },
    { value: 'start_date', label: 'Startdatum' },
    { value: 'end_date', label: 'Einddatum' },
    { value: 'monthly_rate', label: 'Tarief' },
    { value: 'customer_name', label: 'Klant' },
    { value: 'status', label: 'Status' },
  ] },
};

export default function ContractenPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const { items: contracts, total, page, setPage, loading, refetch: fetchData } = useAdminData<Contract>({ endpoint: '/api/admin/contracts', dataKey: 'contracts', params: filters });
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [caravans, setCaravans] = useState<CaravanOption[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [spots, setSpots] = useState<SpotOption[]>([]);
  const [form, setForm] = useState({ customer_id: '', caravan_id: '', location_id: '', spot_id: '', start_date: '', end_date: '', monthly_rate: '', deposit: '0', auto_renew: true });
  const [editing, setEditing] = useState<Contract | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };
  const resetFilters = () => { setFilters({}); setPage(1); };

  const toggleSelect = (id: number) => {
    setSelected(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };
  const toggleAll = () => {
    if (selected.size === contracts.length) setSelected(new Set());
    else setSelected(new Set(contracts.map(c => c.id)));
  };

  const exportCSV = useCallback(() => {
    const rows = contracts.filter(c => selected.size === 0 || selected.has(c.id));
    const headers = ['Contractnr', 'Klant', 'Caravan', 'Kenteken', 'Locatie', 'Startdatum', 'Einddatum', 'Maandtarief', 'Status', 'Auto-verlenging'];
    const csv = [headers.join(';'), ...rows.map(c => [c.contract_number, c.customer_name, c.caravan_name, c.license_plate, c.location_name, c.start_date?.split('T')[0] || '', c.end_date?.split('T')[0] || '', c.monthly_rate, c.status, c.auto_renew ? 'Ja' : 'Nee'].join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `contracten-export-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }, [contracts, selected]);

  const openForm = async () => {
    const [custRes, caravRes, locRes] = await Promise.all([
      fetch('/api/admin/customers?limit=500', { credentials: 'include' }),
      fetch('/api/admin/caravans?limit=500', { credentials: 'include' }),
      fetch('/api/admin/locations', { credentials: 'include' }),
    ]);
    setCustomers((await custRes.json()).customers || []);
    setCaravans((await caravRes.json()).caravans || []);
    setLocations((await locRes.json()).locations || []);
    setForm({ customer_id: '', caravan_id: '', location_id: '', spot_id: '', start_date: '', end_date: '', monthly_rate: '', deposit: '0', auto_renew: true });
    setShowForm(true);
  };

  const loadSpots = async (locationId: string) => {
    if (!locationId) { setSpots([]); return; }
    const res = await fetch(`/api/admin/locations/${locationId}/spots`, { credentials: 'include' });
    const data = await res.json();
    setSpots((data.spots || []).filter((s: SpotOption) => s.status === 'vrij'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await fetch(`/api/admin/contracts/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), credentials: 'include' });
    } else {
      await fetch('/api/admin/contracts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), credentials: 'include' });
    }
    setShowForm(false); setEditing(null); fetchData();
    toast.success(editing ? 'Contract bijgewerkt' : 'Contract aangemaakt');
  };

  const openEdit = async (c: Contract) => {
    setEditing(c);
    const [custRes, caravRes, locRes] = await Promise.all([
      fetch('/api/admin/customers?limit=500', { credentials: 'include' }),
      fetch('/api/admin/caravans?limit=500', { credentials: 'include' }),
      fetch('/api/admin/locations', { credentials: 'include' }),
    ]);
    setCustomers((await custRes.json()).customers || []);
    setCaravans((await caravRes.json()).caravans || []);
    setLocations((await locRes.json()).locations || []);
    setForm({ customer_id: '', caravan_id: '', location_id: '', spot_id: '', start_date: c.start_date?.split('T')[0] || '', end_date: c.end_date?.split('T')[0] || '', monthly_rate: String(c.monthly_rate), deposit: '0', auto_renew: c.auto_renew });
    setShowForm(true);
  };

  const filteredCaravans = form.customer_id ? caravans.filter(c => String(c.customer_id) === form.customer_id) : caravans;
  const totalPages = Math.ceil(total / 50);
  const totalMonthly = contracts.filter(c => c.status === 'actief').reduce((s, c) => s + Number(c.monthly_rate), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-black text-surface-dark">Contracten</h1><p className="text-sm text-warm-gray/70 mt-1">{total} contracten · Maandomzet actief: {fmt(totalMonthly)}</p></div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-sand/40 hover:bg-sand-dark/20 text-warm-gray rounded-xl text-sm font-medium border border-sand-dark/20 transition-all">
            <Download size={14} /> CSV {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
          <button onClick={openForm} className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"><Plus size={16} /> Nieuw contract</button>
        </div>
      </div>

      <FilterBar config={FILTER_CONFIG} values={filters} onChange={updateFilter} onReset={resetFilters} />

      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-primary/[0.06] rounded-xl px-4 py-3 border border-primary/20">
          <span className="text-sm font-semibold text-primary">{selected.size} geselecteerd</span>
          <button onClick={() => setSelected(new Set())} className="text-xs text-warm-gray/70 hover:text-warm-gray underline ml-auto">Deselecteren</button>
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-sand-dark/20 overflow-hidden">
        <div className="table-responsive">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-sand/40 border-b border-sand-dark/20"><tr>
            <th className="w-10 px-4 py-3.5">
              <button onClick={toggleAll} className="text-warm-gray/50 hover:text-warm-gray transition-colors" aria-label="Alles selecteren">
                {selected.size === contracts.length && contracts.length > 0 ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
              </button>
            </th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Contract</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Klant</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Caravan</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Locatie</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Periode</th>
            <th className="text-right px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Maandtarief</th>
            <th className="text-center px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Status</th>
            <th className="text-right px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Acties</th>
          </tr></thead>
          <tbody className="divide-y divide-sand-dark/10">
            {loading ? <tr><td colSpan={9} className="px-4 py-8 text-center text-warm-gray/70">Laden...</td></tr> :
            contracts.length === 0 ? <tr><td colSpan={9} className="px-4 py-8 text-center text-warm-gray/70">Geen contracten gevonden</td></tr> :
            contracts.map(c => (
              <tr key={c.id} className={`hover:bg-sand/30 transition-colors ${selected.has(c.id) ? 'bg-primary/[0.03]' : ''}`}>
                <td className="w-10 px-4 py-3">
                  <button onClick={() => toggleSelect(c.id)} className="text-warm-gray/50 hover:text-warm-gray transition-colors" aria-label={`Selecteer ${c.contract_number}`}>
                    {selected.has(c.id) ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                  </button>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-warm-gray">{c.contract_number}</td>
                <td className="px-4 py-3 text-surface-dark">{c.customer_name}</td>
                <td className="px-4 py-3"><p className="text-sm text-surface-dark">{c.caravan_name}</p><p className="text-xs text-warm-gray/70">{c.license_plate}</p></td>
                <td className="px-4 py-3 text-xs text-warm-gray">{c.location_name}</td>
                <td className="px-4 py-3 text-xs text-warm-gray">{fmtDate(c.start_date)} – {fmtDate(c.end_date)}</td>
                <td className="px-4 py-3 text-right font-medium text-surface-dark">{fmt(Number(c.monthly_rate))}/mnd</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${CONTRACT_STATUS_COLORS[c.status] || 'bg-sand'}`}>{c.status}</span>
                  {c.auto_renew && <span title="Auto-verlenging"><RefreshCw size={12} className="inline ml-1 text-warm-gray/70" /></span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-sand-dark/20 rounded-lg text-warm-gray/70 hover:text-warm-gray transition-colors" title="Bewerken"><Edit2 size={14} /></button>
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

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Contract bewerken' : 'Nieuw contract'}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-warm-gray block mb-1">Klant *</label>
                <select required value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value, caravan_id: ''})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                  <option value="">Selecteer klant...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-warm-gray block mb-1">Caravan *</label>
                <select required value={form.caravan_id} onChange={e => setForm({...form, caravan_id: e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                  <option value="">Selecteer caravan...</option>
                  {filteredCaravans.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} {c.license_plate ? `(${c.license_plate})` : ''}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-warm-gray block mb-1">Locatie *</label>
                  <select required value={form.location_id} onChange={e => { setForm({...form, location_id: e.target.value, spot_id: ''}); loadSpots(e.target.value); }} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                    <option value="">Selecteer locatie...</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-warm-gray block mb-1">Stallingplek</label>
                  <select value={form.spot_id} onChange={e => setForm({...form, spot_id: e.target.value})} disabled={!form.location_id} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50">
                    <option value="">Geen plek</option>
                    {spots.map(s => <option key={s.id} value={s.id}>{s.label} (Zone {s.zone})</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-warm-gray block mb-1">Startdatum *</label><input type="date" required value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"/></div>
                <div><label className="text-xs font-semibold text-warm-gray block mb-1">Einddatum *</label><input type="date" required value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-warm-gray block mb-1">Maandtarief (€) *</label><input type="number" step="0.01" required value={form.monthly_rate} onChange={e=>setForm({...form,monthly_rate:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"/></div>
                <div><label className="text-xs font-semibold text-warm-gray block mb-1">Borg (€)</label><input type="number" step="0.01" value={form.deposit} onChange={e=>setForm({...form,deposit:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 outline-none transition-all"/></div>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.auto_renew} onChange={e=>setForm({...form,auto_renew:e.target.checked})} className="rounded"/> Automatisch verlengen</label>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2.5 text-sm text-warm-gray/70 hover:bg-sand-dark/20 rounded-xl transition-colors">Annuleren</button>
                <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-primary/20 transition-all">Opslaan</button>
              </div>
            </form>
      </Modal>
    </div>
  );
}
