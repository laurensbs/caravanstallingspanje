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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-slate-900">Inspecties</h1>
        <button onClick={startInspection} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"><Plus size={16} /> Nieuwe inspectie</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 mb-6 p-4">
        <div className="flex gap-2">
          {['', 'gepland', 'afgerond'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${filter === s ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'}`}>{s || 'Alle'}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">Laden...</div> :
        inspections.length === 0 ? <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">Geen inspecties</div> :
        inspections.map(insp => {
          const cl = insp.checklist || {};
          const passed = passedCount(cl);
          const total = CHECKLIST_ITEMS.length;
          const pct = Math.round((passed / total) * 100);
          return (
            <div key={insp.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {pct === 100 ? <CheckCircle size={16} className="text-green-500" /> : pct >= 70 ? <AlertTriangle size={16} className="text-amber-500" /> : <AlertTriangle size={16} className="text-red-500" />}
                    <h3 className="font-semibold">{insp.caravan_brand} {insp.caravan_model}</h3>
                    <span className="text-xs text-slate-400">{insp.caravan_license_plate}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                    <span>{insp.location_name} · {insp.spot_label}</span>
                    <span>{fmtDate(insp.inspected_at || insp.created_at)}</span>
                    <span className="capitalize">{insp.inspection_type}</span>
                  </div>
                  {insp.notes && <p className="text-sm text-slate-400 mt-2">{insp.notes}</p>}
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${pct === 100 ? 'text-green-600' : pct >= 70 ? 'text-amber-600' : 'text-red-600'}`}>{pct}%</div>
                  <div className="text-xs text-slate-400">{passed}/{total} ok</div>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100"><h2 className="text-lg font-bold text-slate-900">Nieuwe inspectie</h2><button onClick={()=>setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div><label className="text-xs font-semibold text-slate-500 block mb-1">Caravan *</label><select required value={form.caravan_id} onChange={e=>setForm({...form,caravan_id:e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-emerald-400/20 outline-none"><option value="">Selecteer caravan</option>{caravans.map(c=><option key={c.id} value={c.id}>{c.brand} {c.model} - {c.license_plate}</option>)}</select></div>
              <div><label className="text-xs font-semibold text-slate-500 block mb-1">Type</label><select value={form.inspection_type} onChange={e=>setForm({...form,inspection_type:e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-emerald-400/20 outline-none"><option value="tweewekelijks">Tweewekelijks</option><option value="jaarlijks">Jaarlijks</option><option value="ad_hoc">Ad hoc</option></select></div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 block">Checklist</label>
                {CHECKLIST_ITEMS.map(item => (
                  <label key={item.key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <input type="checkbox" checked={checklist[item.key]} onChange={e => setChecklist({...checklist, [item.key]: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-emerald-600" />
                    <span className="text-sm text-slate-600">{item.label}</span>
                  </label>
                ))}
              </div>

              <div><label className="text-xs font-semibold text-slate-500 block mb-1">Opmerkingen</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-emerald-400/20 outline-none" rows={3} placeholder="Eventuele bijzonderheden..."/></div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">Annuleren</button>
                <button type="submit" className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition-all">Inspectie afronden</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
