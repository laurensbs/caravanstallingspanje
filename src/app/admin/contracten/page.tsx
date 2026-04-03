'use client';
import { fmt, fmtDate, CONTRACT_STATUS_COLORS } from "@/lib/format";

import { useState, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight, RefreshCw, Edit2, Download, CheckSquare, Square } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import Modal from '@/components/ui/Modal';
import FilterBar, { type FilterConfig } from '@/components/admin/FilterBar';
import { toast } from 'sonner';
import { useAdminI18n } from '@/lib/admin-i18n';

interface Contract { id: number; contract_number: string; customer_name: string; caravan_name: string; license_plate: string; location_name: string; start_date: string; end_date: string; monthly_rate: number; status: string; auto_renew: boolean; }
interface CustomerOption { id: number; first_name: string; last_name: string; }
interface CaravanOption { id: number; brand: string; model: string; license_plate: string; customer_id: number; }
interface LocationOption { id: number; name: string; }
interface SpotOption { id: number; label: string; zone: string; status: string; }

export default function ContractenPage() {
  const { t } = useAdminI18n();

  const FILTER_CONFIG: FilterConfig = {
    search: { placeholder: t('Zoek op klant, contractnr, kenteken...') },
    statuses: [
      { value: '', label: t('Alle') },
      { value: 'actief', label: t('Actief') },
      { value: 'verlopen', label: t('Verlopen') },
      { value: 'opgezegd', label: t('Opgezegd') },
      { value: 'concept', label: t('Concept') },
    ],
    sort: { options: [
      { value: 'created_at', label: t('Aangemaakt') },
      { value: 'start_date', label: t('Startdatum') },
      { value: 'end_date', label: t('Einddatum') },
      { value: 'monthly_rate', label: t('Tarief') },
      { value: 'customer_name', label: t('Klant') },
      { value: 'status', label: t('Status') },
    ] },
  };

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
    const headers = [t('Contractnr'), t('Klant'), t('Caravan'), t('Kenteken'), t('Locatie'), t('Startdatum'), t('Einddatum'), t('Maandtarief'), t('Status'), t('Auto-verlenging')];
    const csv = [headers.join(';'), ...rows.map(c => [c.contract_number, c.customer_name, c.caravan_name, c.license_plate, c.location_name, c.start_date?.split('T')[0] || '', c.end_date?.split('T')[0] || '', c.monthly_rate, c.status, c.auto_renew ? t('Ja') : t('Nee')].join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `contracten-export-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }, [contracts, selected, t]);

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
    toast.success(editing ? t('Contract bijgewerkt') : t('Contract aangemaakt'));
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
        <div><h1 className="text-2xl font-bold text-gray-900">{t('Contracten')}</h1><p className="text-sm text-gray-500/70 mt-1">{total} {t('contracten')} · {t('Maandomzet actief')}: {fmt(totalMonthly)}</p></div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-300/20 text-gray-500 rounded-xl text-sm font-medium border border-gray-200 transition-all">
            <Download size={14} /> CSV {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
          <button onClick={openForm} className="bg-primary hover:bg-primary-light text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"><Plus size={16} /> {t('Nieuw contract')}</button>
        </div>
      </div>

      <FilterBar config={FILTER_CONFIG} values={filters} onChange={updateFilter} onReset={resetFilters} />

      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-primary/[0.06] rounded-xl px-4 py-3 border border-primary/20">
          <span className="text-sm font-semibold text-primary">{selected.size} {t('geselecteerd')}</span>
          <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500/70 hover:text-gray-500 underline ml-auto">{t('Deselecteren')}</button>
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-gray-200 overflow-hidden">
        <div className="table-responsive">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200"><tr>
            <th className="w-10 px-4 py-3.5">
              <button onClick={toggleAll} className="text-gray-500/50 hover:text-gray-500 transition-colors" aria-label={t('Alles selecteren')}>
                {selected.size === contracts.length && contracts.length > 0 ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
              </button>
            </th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">{t('Contract')}</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">{t('Klant')}</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">{t('Caravan')}</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">{t('Locatie')}</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">{t('Periode')}</th>
            <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">{t('Maandtarief')}</th>
            <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">{t('Status')}</th>
            <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">{t('Acties')}</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500/70">{t('Laden...')}</td></tr> :
            contracts.length === 0 ? <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500/70">{t('Geen contracten gevonden')}</td></tr> :
            contracts.map(c => (
              <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${selected.has(c.id) ? 'bg-primary/[0.03]' : ''}`}>
                <td className="w-10 px-4 py-3">
                  <button onClick={() => toggleSelect(c.id)} className="text-gray-500/50 hover:text-gray-500 transition-colors" aria-label={`${t('Selecteer')} ${c.contract_number}`}>
                    {selected.has(c.id) ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                  </button>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.contract_number}</td>
                <td className="px-4 py-3 text-gray-900">{c.customer_name}</td>
                <td className="px-4 py-3"><p className="text-sm text-gray-900">{c.caravan_name}</p><p className="text-xs text-gray-500/70">{c.license_plate}</p></td>
                <td className="px-4 py-3 text-xs text-gray-500">{c.location_name}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(c.start_date)} – {fmtDate(c.end_date)}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">{fmt(Number(c.monthly_rate))}/{t('mnd')}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${CONTRACT_STATUS_COLORS[c.status] || 'bg-gray-100'}`}>{c.status}</span>
                  {c.auto_renew && <span title={t('Auto-verlenging')}><RefreshCw size={12} className="inline ml-1 text-gray-500/70" /></span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gray-300/20 rounded-lg text-gray-500/70 hover:text-gray-500 transition-colors" title={t('Bewerken')}><Edit2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200"><p className="text-xs text-gray-500/70">{t('Pagina')} {page}/{totalPages}</p><div className="flex gap-1"><button disabled={page<=1} onClick={()=>setPage(page-1)} className="p-1.5 rounded-lg hover:bg-gray-300/20 disabled:opacity-30 transition-colors" aria-label={t('Vorige pagina')}><ChevronLeft size={16} className="text-gray-500/70"/></button><button disabled={page>=totalPages} onClick={()=>setPage(page+1)} className="p-1.5 rounded-lg hover:bg-gray-300/20 disabled:opacity-30 transition-colors" aria-label={t('Volgende pagina')}><ChevronRight size={16} className="text-gray-500/70"/></button></div></div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? t('Contract bewerken') : t('Nieuw contract')}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">{t('Klant')} *</label>
                <select required value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value, caravan_id: ''})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                  <option value="">{t('Selecteer klant...')}</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">{t('Caravan')} *</label>
                <select required value={form.caravan_id} onChange={e => setForm({...form, caravan_id: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                  <option value="">{t('Selecteer caravan...')}</option>
                  {filteredCaravans.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} {c.license_plate ? `(${c.license_plate})` : ''}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">{t('Locatie')} *</label>
                  <select required value={form.location_id} onChange={e => { setForm({...form, location_id: e.target.value, spot_id: ''}); loadSpots(e.target.value); }} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                    <option value="">{t('Selecteer locatie...')}</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">{t('Stallingplek')}</label>
                  <select value={form.spot_id} onChange={e => setForm({...form, spot_id: e.target.value})} disabled={!form.location_id} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50">
                    <option value="">{t('Geen plek')}</option>
                    {spots.map(s => <option key={s.id} value={s.id}>{s.label} (Zone {s.zone})</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-gray-500 block mb-1">{t('Startdatum')} *</label><input type="date" required value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"/></div>
                <div><label className="text-xs font-semibold text-gray-500 block mb-1">{t('Einddatum')} *</label><input type="date" required value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-gray-500 block mb-1">{t('Maandtarief (€)')} *</label><input type="number" step="0.01" required value={form.monthly_rate} onChange={e=>setForm({...form,monthly_rate:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"/></div>
                <div><label className="text-xs font-semibold text-gray-500 block mb-1">{t('Borg (€)')}</label><input type="number" step="0.01" value={form.deposit} onChange={e=>setForm({...form,deposit:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"/></div>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.auto_renew} onChange={e=>setForm({...form,auto_renew:e.target.checked})} className="rounded"/> {t('Automatisch verlengen')}</label>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2.5 text-sm text-gray-500/70 hover:bg-gray-300/20 rounded-xl transition-colors">{t('Annuleren')}</button>
                <button type="submit" className="bg-primary hover:bg-primary-light text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-primary/20 transition-all">{t('Opslaan')}</button>
              </div>
            </form>
      </Modal>
    </div>
  );
}
