'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, CheckCircle, Camera, AlertTriangle } from 'lucide-react';

interface Inspection { id: number; caravan_brand: string; caravan_model: string; caravan_license_plate: string; spot_label: string; location_name: string; inspection_type: string; status: string; checklist: Record<string, boolean>; notes: string; photos: string[]; inspected_at: string; created_at: string; }

const CHECKLIST_ITEMS = [
  { key: 'exterior_condition', label: 'Exterieur conditie' },
  { key: 'tires_condition', label: 'Banden conditie' },
  { key: 'roof_seals', label: 'Dakranden/afdichting' },
  { key: 'windows_doors', label: 'Ramen en deuren' },
  { key: 'mover_system', label: 'Moversysteem' },
  { key: 'battery_check', label: 'Accu controle' },
  { key: 'gas_system', label: 'Gassysteem' },
  { key: 'water_system', label: 'Watersysteem' },
  { key: 'general_cleanliness', label: 'Algemene netheid' },
  { key: 'security_check', label: 'Beveiliging' },
];

export default function StaffInspectiesPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [caravans, setCaravans] = useState<{id:number;brand:string;model:string;license_plate:string}[]>([]);
  const [checklist, setChecklist] = useState<Record<string,boolean>>(Object.fromEntries(CHECKLIST_ITEMS.map(i => [i.key, false])));
  const [form, setForm] = useState({ caravan_id: '', inspection_type: 'tweewekelijks', notes: '' });
  const [filter, setFilter] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set('status', filter);
    const res = await fetch(`/api/staff/inspections?${params}`, { credentials: 'include' });
    const data = await res.json();
    setInspections(data.inspections || []); setLoading(false);
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const startInspection = async () => {
    const res = await fetch('/api/staff/caravans', { credentials: 'include' });
    const data = await res.json();
    setCaravans(data.caravans || []);
    setChecklist(Object.fromEntries(CHECKLIST_ITEMS.map(i => [i.key, false])));
    setForm({ caravan_id: '', inspection_type: 'tweewekelijks', notes: '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/staff/inspections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, checklist, status: 'afgerond' }), credentials: 'include' });
    setShowForm(false); fetchData();
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
  const passedCount = (c: Record<string,boolean>) => Object.values(c).filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inspecties</h1>
        <button onClick={startInspection} className="bg-primary hover:bg-primary-light text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"><Plus size={16} /> Nieuwe inspectie</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border mb-6 p-4">
        <div className="flex gap-2">
          {['', 'gepland', 'afgerond'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === s ? 'bg-primary text-white' : 'bg-surface hover:bg-gray-200'}`}>{s || 'Alle'}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? <div className="bg-white rounded-2xl shadow-sm border p-8 text-center text-muted">Laden...</div> :
        inspections.length === 0 ? <div className="bg-white rounded-2xl shadow-sm border p-8 text-center text-muted">Geen inspecties</div> :
        inspections.map(insp => {
          const cl = insp.checklist || {};
          const passed = passedCount(cl);
          const total = CHECKLIST_ITEMS.length;
          const pct = Math.round((passed / total) * 100);
          return (
            <div key={insp.id} className="bg-white rounded-2xl shadow-sm border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {pct === 100 ? <CheckCircle size={16} className="text-green-500" /> : pct >= 70 ? <AlertTriangle size={16} className="text-amber-500" /> : <AlertTriangle size={16} className="text-red-500" />}
                    <h3 className="font-semibold">{insp.caravan_brand} {insp.caravan_model}</h3>
                    <span className="text-xs text-muted">{insp.caravan_license_plate}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted mt-1">
                    <span>{insp.location_name} · {insp.spot_label}</span>
                    <span>{fmtDate(insp.inspected_at || insp.created_at)}</span>
                    <span className="capitalize">{insp.inspection_type}</span>
                  </div>
                  {insp.notes && <p className="text-sm text-muted mt-2">{insp.notes}</p>}
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${pct === 100 ? 'text-green-600' : pct >= 70 ? 'text-amber-600' : 'text-red-600'}`}>{pct}%</div>
                  <div className="text-xs text-muted">{passed}/{total} ok</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {CHECKLIST_ITEMS.map(item => (
                  <span key={item.key} className={`text-xs px-2 py-0.5 rounded-full ${cl[item.key] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.label}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-4">
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-lg font-bold">Nieuwe inspectie</h2><button onClick={()=>setShowForm(false)}><X size={20}/></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div><label className="text-xs font-medium text-muted block mb-1">Caravan *</label><select required value={form.caravan_id} onChange={e=>setForm({...form,caravan_id:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"><option value="">Selecteer caravan</option>{caravans.map(c=><option key={c.id} value={c.id}>{c.brand} {c.model} - {c.license_plate}</option>)}</select></div>
              <div><label className="text-xs font-medium text-muted block mb-1">Type</label><select value={form.inspection_type} onChange={e=>setForm({...form,inspection_type:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"><option value="tweewekelijks">Tweewekelijks</option><option value="jaarlijks">Jaarlijks</option><option value="ad_hoc">Ad hoc</option></select></div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted block">Checklist</label>
                {CHECKLIST_ITEMS.map(item => (
                  <label key={item.key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface cursor-pointer">
                    <input type="checkbox" checked={checklist[item.key]} onChange={e => setChecklist({...checklist, [item.key]: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-primary" />
                    <span className="text-sm">{item.label}</span>
                  </label>
                ))}
              </div>

              <div><label className="text-xs font-medium text-muted block mb-1">Opmerkingen</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm" rows={3} placeholder="Eventuele bijzonderheden..."/></div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2.5 text-sm text-muted">Annuleren</button>
                <button type="submit" className="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl text-sm">Inspectie afronden</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
