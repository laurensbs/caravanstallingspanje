'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Plus, X, CheckCircle, Clock, AlertCircle, User } from 'lucide-react';

interface Task { id: number; title: string; description: string; priority: string; status: string; assigned_to: number; assigned_staff_name: string; location_name: string; due_date: string; completed_at: string; created_at: string; }

const PRIORITY_COLORS: Record<string,string> = { laag: 'bg-ocean/15 text-ocean-dark', normaal: 'bg-sand text-surface-dark', hoog: 'bg-warning/15 text-warning', urgent: 'bg-danger/15 text-danger' };
const STATUS_COLORS: Record<string,string> = { open: 'bg-ocean/15 text-ocean-dark', in_uitvoering: 'bg-warning/15 text-warning', afgerond: 'bg-accent/15 text-primary-dark' };
const STATUS_ICONS: Record<string, typeof Clock> = { open: Clock, in_uitvoering: AlertCircle, afgerond: CheckCircle };

export default function TakenPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [staff, setStaff] = useState<{id:number;first_name:string;last_name:string}[]>([]);
  const [form, setForm] = useState({ title: '', description: '', priority: 'normaal', assigned_to: '', location_id: '', due_date: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch(`/api/admin/tasks?${params}`, { credentials: 'include' });
    const data = await res.json();
    setTasks(data.tasks || []); setTotal(data.total || 0); setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openForm = async () => {
    const res = await fetch('/api/admin/staff', { credentials: 'include' });
    const data = await res.json();
    setStaff(data.staff || []);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), credentials: 'include' });
    setShowForm(false); setForm({ title: '', description: '', priority: 'normaal', assigned_to: '', location_id: '', due_date: '' }); fetchData();
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/tasks/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }), credentials: 'include' });
    fetchData();
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('nl-NL') : '-';

  const counts = { open: tasks.filter(t=>t.status==='open').length, in_uitvoering: tasks.filter(t=>t.status==='in_uitvoering').length, afgerond: tasks.filter(t=>t.status==='afgerond').length };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-black text-surface-dark">Taken</h1><p className="text-sm text-warm-gray/70 mt-1">{counts.open} open · {counts.in_uitvoering} in uitvoering · {counts.afgerond} afgerond</p></div>
        <button onClick={openForm} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"><Plus size={16} /> Nieuwe taak</button>
      </div>

      <div className="bg-surface rounded-2xl border border-sand-dark/20 mb-6 p-4">
        <div className="flex gap-2 flex-wrap">
          {['', 'open', 'in_uitvoering', 'afgerond'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${statusFilter === s ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20' : 'bg-sand/40 hover:bg-sand-dark/20 text-warm-gray'}`}>{s === 'in_uitvoering' ? 'In uitvoering' : s || 'Alle'}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? <div className="bg-surface rounded-2xl border border-sand-dark/20 p-8 text-center text-warm-gray/70">Laden...</div> :
        tasks.length === 0 ? <div className="bg-surface rounded-2xl border border-sand-dark/20 p-8 text-center text-warm-gray/70">Geen taken</div> :
        tasks.map(t => {
          const Icon = STATUS_ICONS[t.status] || Clock;
          const overdue = t.due_date && !t.completed_at && new Date(t.due_date) < new Date();
          return (
            <div key={t.id} className={`bg-surface rounded-2xl border p-4 flex items-start gap-4 hover:shadow-lg hover:shadow-sand-dark/20 transition-all ${overdue ? 'border-danger/30' : 'border-sand-dark/20'}`}>
              <div className="mt-0.5"><Icon size={20} className={t.status === 'afgerond' ? 'text-accent' : t.status === 'in_uitvoering' ? 'text-warning' : 'text-ocean'} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{t.title}</h3>
                    {t.description && <p className="text-sm text-warm-gray/70 mt-1">{t.description}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${PRIORITY_COLORS[t.priority] || ''}`}>{t.priority}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[t.status] || ''}`}>{t.status === 'in_uitvoering' ? 'in uitvoering' : t.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-warm-gray/70">
                  {t.assigned_staff_name && <span className="flex items-center gap-1"><User size={12}/> {t.assigned_staff_name}</span>}
                  {t.location_name && <span>{t.location_name}</span>}
                  {t.due_date && <span className={overdue ? 'text-danger font-medium' : ''}>Deadline: {fmtDate(t.due_date)}</span>}
                </div>
              </div>
              <div className="flex-shrink-0">
                <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)} className="text-xs border border-sand-dark/30 rounded-lg px-2 py-1.5 bg-sand/40 focus:ring-2 focus:ring-amber-400/20 outline-none">
                  <option value="open">Open</option>
                  <option value="in_uitvoering">In uitvoering</option>
                  <option value="afgerond">Afgerond</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-sand-dark/20"><h2 className="text-lg font-bold text-surface-dark">Nieuwe taak</h2><button onClick={()=>setShowForm(false)} className="text-warm-gray/70 hover:text-warm-gray"><X size={20}/></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="text-xs font-semibold text-warm-gray block mb-1">Titel *</label><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-amber-400/20 focus:border-warning outline-none transition-all"/></div>
              <div><label className="text-xs font-semibold text-warm-gray block mb-1">Omschrijving</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-amber-400/20 focus:border-warning outline-none transition-all" rows={3}/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-warm-gray block mb-1">Prioriteit</label><select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-amber-400/20 outline-none"><option value="laag">Laag</option><option value="normaal">Normaal</option><option value="hoog">Hoog</option><option value="urgent">Urgent</option></select></div>
                <div><label className="text-xs font-semibold text-warm-gray block mb-1">Deadline</label><input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-amber-400/20 outline-none"/></div>
              </div>
              <div><label className="text-xs font-semibold text-warm-gray block mb-1">Toewijzen aan</label><select value={form.assigned_to} onChange={e=>setForm({...form,assigned_to:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-amber-400/20 outline-none"><option value="">Niet toewijzen</option>{staff.map(s=><option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}</select></div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2.5 text-sm text-warm-gray/70 hover:bg-sand-dark/20 rounded-xl transition-colors">Annuleren</button>
                <button type="submit" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all">Aanmaken</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
