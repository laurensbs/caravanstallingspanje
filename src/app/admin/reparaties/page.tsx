'use client';

import { useState, useCallback, useEffect } from 'react';
import { Wrench, Plus, X, Search, ChevronDown, ChevronUp, Edit2, Trash2, Package, Calendar, FileText, AlertCircle, CheckCircle, Clock, Ban, Receipt, Eye } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import Modal from '@/components/ui/Modal';
import { useAdminI18n } from '@/lib/admin-i18n';

interface Repair {
  id: number;
  year: number;
  location_code: string;
  area: string;
  customer_name: string;
  client_number: string;
  repairs_description: string;
  observations: string;
  cost_type: string;
  status: string;
  parts_needed: string;
  date_of_completion: string;
  invoice_reference: string;
  notes: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  geen_schade: { label: 'Geen schade', color: 'text-gray-400', bg: 'bg-gray-100 text-gray-600', icon: CheckCircle },
  inspectie: { label: 'Inspectie', color: 'text-blue-500', bg: 'bg-blue-50 text-blue-700', icon: Eye },
  werkbon: { label: 'Werkbon', color: 'text-amber-500', bg: 'bg-amber-50 text-amber-700', icon: FileText },
  goedgekeurd: { label: 'Goedgekeurd', color: 'text-amber-500', bg: 'bg-amber-50 text-amber-700', icon: CheckCircle },
  afgekeurd: { label: 'Afgekeurd', color: 'text-red-500', bg: 'bg-red-50 text-red-700', icon: Ban },
  in_behandeling: { label: 'In behandeling', color: 'text-amber-500', bg: 'bg-amber-50 text-amber-700', icon: Clock },
  afgerond: { label: 'Afgerond', color: 'text-amber-500', bg: 'bg-amber-50 text-amber-700', icon: CheckCircle },
  gefactureerd: { label: 'Gefactureerd', color: 'text-emerald-500', bg: 'bg-emerald-50 text-emerald-700', icon: Receipt },
};

const COST_LABELS: Record<string, { label: string; color: string }> = {
  client: { label: 'Klantkosten', color: 'bg-blue-50 text-blue-700' },
  company: { label: 'Onze kosten', color: 'bg-orange-50 text-orange-700' },
  none: { label: '-', color: 'bg-gray-50 text-gray-400' },
};

const AREAS = [
  { value: '', label: 'Alle locaties' },
  { value: 'cruillas', label: 'Cruillas' },
  { value: 'peratallada', label: 'Peratallada' },
];

const STATUSES = [
  { value: '', label: 'Alle statussen' },
  { value: 'geen_schade', label: 'Geen schade' },
  { value: 'inspectie', label: 'Inspectie' },
  { value: 'werkbon', label: 'Werkbon aangemaakt' },
  { value: 'goedgekeurd', label: 'Goedgekeurd' },
  { value: 'afgekeurd', label: 'Afgekeurd' },
  { value: 'in_behandeling', label: 'In behandeling' },
  { value: 'afgerond', label: 'Afgerond' },
  { value: 'gefactureerd', label: 'Gefactureerd' },
];

const emptyForm: {
  year: number;
  location_code: string;
  area: 'cruillas' | 'peratallada';
  customer_name: string;
  client_number: string;
  repairs_description: string;
  observations: string;
  cost_type: 'client' | 'company' | 'none';
  status: string;
  parts_needed: string;
  date_of_completion: string;
  invoice_reference: string;
  notes: string;
  assigned_to: string;
} = {
  year: new Date().getFullYear(),
  location_code: '',
  area: 'cruillas' as const,
  customer_name: '',
  client_number: '',
  repairs_description: '',
  observations: '',
  cost_type: 'client' as const,
  status: 'geen_schade' as const,
  parts_needed: '',
  date_of_completion: '',
  invoice_reference: '',
  notes: '',
  assigned_to: '',
};

// Row color based on status
function rowColor(status: string) {
  if (status === 'gefactureerd') return 'bg-emerald-50/60 border-emerald-200';
  if (['werkbon', 'goedgekeurd', 'in_behandeling', 'afgerond'].includes(status)) return 'bg-amber-50/60 border-amber-200';
  if (status === 'afgekeurd') return 'bg-red-50/40 border-red-200';
  return 'bg-white border-gray-200';
}

export default function ReparatiesPage() {
  const { t } = useAdminI18n();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { items: repairs, total, loading, refetch } = useAdminData<Repair>({
    endpoint: '/api/admin/repairs',
    dataKey: 'inspections',
    limit: 200,
    params: { year: year > 0 ? String(year) : '', status: statusFilter, area: areaFilter, search: searchQuery },
  });

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/repairs?stats=true${year > 0 ? `&year=${year}` : ''}`, { credentials: 'include' });
      const data = await res.json();
      const map: Record<string, number> = {};
      (data.byStatus || []).forEach((r: { status: string; count: string }) => { map[r.status] = parseInt(r.count); });
      setStats(map);
    } catch { /* ignore */ }
  }, [year]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/admin/repairs/${editingId}` : '/api/admin/repairs';
    const method = editingId ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), credentials: 'include' });
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    refetch();
    loadStats();
  };

  const openEdit = (r: Repair) => {
    setForm({
      year: r.year,
      location_code: r.location_code,
      area: r.area as 'cruillas' | 'peratallada',
      customer_name: r.customer_name,
      client_number: r.client_number || '',
      repairs_description: r.repairs_description || '',
      observations: r.observations || '',
      cost_type: r.cost_type as 'client' | 'company' | 'none',
      status: r.status as typeof emptyForm.status,
      parts_needed: r.parts_needed || '',
      date_of_completion: r.date_of_completion ? r.date_of_completion.split('T')[0] : '',
      invoice_reference: r.invoice_reference || '',
      notes: r.notes || '',
      assigned_to: r.assigned_to || '',
    });
    setEditingId(r.id);
    setShowForm(true);
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/repairs/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }), credentials: 'include' });
    refetch();
    loadStats();
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/repairs/${id}`, { method: 'DELETE', credentials: 'include' });
    setDeleteConfirm(null);
    refetch();
    loadStats();
  };

  const totalAll = Object.values(stats).reduce((a, b) => a + b, 0);
  const needsWork = (stats['werkbon'] || 0) + (stats['goedgekeurd'] || 0) + (stats['in_behandeling'] || 0);
  const done = (stats['afgerond'] || 0) + (stats['gefactureerd'] || 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Wrench className="text-primary" size={24} /> {t('Reparatie & Inspectie')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalAll} {t('inspecties')} · {needsWork} {t('in behandeling')} · {done} {t('afgerond')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none">
            <option value={0}>{t('Alle jaren')}</option>
            {[currentYear, currentYear - 1, currentYear - 2].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }} className="bg-primary hover:bg-primary-light text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
            <Plus size={16} /> {t('Nieuwe inspectie')}
          </button>
        </div>
      </div>

      {/* Compact stats bar */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUSES.filter(s => s.value).map(s => {
          const cfg = STATUS_CONFIG[s.value];
          const count = stats[s.value] || 0;
          const isActive = statusFilter === s.value;
          return (
            <button key={s.value} onClick={() => setStatusFilter(statusFilter === s.value ? '' : s.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${isActive ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
              <cfg.icon size={12} className={isActive ? 'text-primary' : cfg.color} />
              {t(cfg.label)} <span className="font-bold">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 mb-4 p-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-1 min-w-[200px] border border-gray-200">
            <Search size={15} className="text-gray-400" />
            <input placeholder={t('Zoek op naam, locatie, klantnr...')} className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder:text-gray-400"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none">
            {AREAS.map(a => <option key={a.value} value={a.value}>{t(a.label)}</option>)}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mb-3 text-[11px] text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-300" /> {t('Geel = wordt gedaan / gedaan')}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-300" /> {t('Groen = gefactureerd / geregeld')}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-300" /> {t('Rood = afgekeurd')}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-300" /> {t('Oranje = onze kosten')}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-24">{t('Locatie')}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">{t('Klant')}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">{t('Nr')}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">{t('Reparaties')}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-32">{t('Status')}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-28 hidden md:table-cell">{t('Kosten')}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-20">{t('Acties')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">{t('Laden...')}</td></tr>
              ) : repairs.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">{t('Geen inspecties gevonden')}</td></tr>
              ) : repairs.map(r => {
                const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.geen_schade;
                const cost = COST_LABELS[r.cost_type] || COST_LABELS.none;
                const isExpanded = expandedId === r.id;
                const hasRepairs = r.repairs_description && r.repairs_description.toLowerCase() !== 'no damage' && r.repairs_description.toLowerCase() !== 'no repairable damage';
                return (
                  <tr key={r.id} className={`border-b transition-colors cursor-pointer hover:bg-gray-50/50 ${rowColor(r.status)}`} onClick={() => setExpandedId(isExpanded ? null : r.id)}>
                    <td className="px-4 py-3 font-mono font-semibold text-gray-700 whitespace-nowrap">{r.location_code}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{r.customer_name}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{r.client_number || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      <span className={`truncate block ${!hasRepairs ? 'text-gray-400 italic' : ''}`}>
                        {r.repairs_description || t('Geen schade')}
                      </span>
                      {isExpanded && (
                        <div className="mt-3 space-y-2 text-xs" onClick={e => e.stopPropagation()}>
                          {r.observations && (
                            <div className="bg-gray-50 rounded-lg p-2.5">
                              <span className="font-semibold text-gray-500 block mb-1">{t('Observaties:')}</span>
                              <span className="text-gray-600">{r.observations}</span>
                            </div>
                          )}
                          {r.parts_needed && (
                            <div className="bg-blue-50 rounded-lg p-2.5 flex items-start gap-2">
                              <Package size={13} className="text-blue-500 mt-0.5 shrink-0" />
                              <div>
                                <span className="font-semibold text-blue-700 block mb-0.5">{t('Onderdelen:')}</span>
                                <span className="text-blue-600">{r.parts_needed}</span>
                              </div>
                            </div>
                          )}
                          {r.date_of_completion && (
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <Calendar size={13} /> {t('Afgerond:')} {new Date(r.date_of_completion).toLocaleDateString('nl-NL')}
                            </div>
                          )}
                          {r.invoice_reference && (
                            <div className="flex items-center gap-1.5 text-emerald-600">
                              <Receipt size={13} /> {r.invoice_reference}
                            </div>
                          )}
                          {r.notes && (
                            <div className="bg-yellow-50 rounded-lg p-2.5 text-yellow-700">
                              <span className="font-semibold block mb-0.5">{t('Notities:')}</span>
                              {r.notes}
                            </div>
                          )}
                          {r.assigned_to && (
                            <div className="text-gray-500">{t('Toegewezen:')} <span className="font-medium">{r.assigned_to}</span></div>
                          )}
                          <div className="flex gap-2 pt-1">
                            <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-primary/20 outline-none">
                              {STATUSES.filter(s => s.value).map(s => <option key={s.value} value={s.value}>{t(s.label)}</option>)}
                            </select>
                            <button onClick={() => openEdit(r)} className="text-xs px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex items-center gap-1 transition-colors"><Edit2 size={12} /> {t('Bewerken')}</button>
                            <button onClick={() => setDeleteConfirm(r.id)} className="text-xs px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center gap-1 transition-colors"><Trash2 size={12} /> {t('Verwijderen')}</button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg}`}>
                        <cfg.icon size={12} /> {t(cfg.label)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${cost.color}`}>{t(cost.label)}</span>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => setExpandedId(isExpanded ? null : r.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {total > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
            <span>{total} {t('inspecties')}</span>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-2">{t('Inspectie verwijderen?')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('Dit kan niet ongedaan worden gemaakt.')}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl">{t('Annuleren')}</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold">{t('Verwijderen')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditingId(null); }} title={editingId ? t('Inspectie bewerken') : t('Nieuwe inspectie')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">{t('Locatiecode')} *</label>
              <input required value={form.location_code} onChange={e => setForm({ ...form, location_code: e.target.value.toUpperCase() })}
                placeholder={t('bijv. CR A1')} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">{t('Gebied')}</label>
              <select value={form.area} onChange={e => setForm({ ...form, area: e.target.value as 'cruillas' | 'peratallada' })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="cruillas">Cruillas</option>
                <option value="peratallada">Peratallada</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">{t('Klantnaam')} *</label>
              <input required value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">{t('Klantnummer')}</label>
              <input value={form.client_number} onChange={e => setForm({ ...form, client_number: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">{t('Reparatiebeschrijving')}</label>
            <textarea value={form.repairs_description} onChange={e => setForm({ ...form, repairs_description: e.target.value })}
              rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">{t('Observaties (schade die we niet kunnen repareren)')}</label>
            <textarea value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })}
              rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">{t('Status')}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as typeof form.status })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none">
                {STATUSES.filter(s => s.value).map(s => <option key={s.value} value={s.value}>{t(s.label)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">{t('Kosten')}</label>
              <select value={form.cost_type} onChange={e => setForm({ ...form, cost_type: e.target.value as 'client' | 'company' | 'none' })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="client">{t('Klantkosten')}</option>
                <option value="company">{t('Onze kosten')}</option>
                <option value="none">Geen</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">{t('Toegewezen aan')}</label>
              <input value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })}
                placeholder={t('bijv. Mark')} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">{t('Benodigde onderdelen')}</label>
            <textarea value={form.parts_needed} onChange={e => setForm({ ...form, parts_needed: e.target.value })}
              rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">{t('Datum afronding')}</label>
              <input type="date" value={form.date_of_completion} onChange={e => setForm({ ...form, date_of_completion: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">{t('Factuurreferentie')}</label>
              <input value={form.invoice_reference} onChange={e => setForm({ ...form, invoice_reference: e.target.value })}
                placeholder={t('bijv. invoiced 22/1/26')} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">{t('Notities')}</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">{t('Annuleren')}</button>
            <button type="submit" className="bg-primary hover:bg-primary-light text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-primary/20 transition-all">{editingId ? t('Opslaan') : t('Aanmaken')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
