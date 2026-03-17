'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Plus, X, CheckCircle, Clock, AlertCircle, User } from 'lucide-react';

interface Task { id: number; title: string; description: string; priority: string; status: string; assigned_to: number; assigned_staff_name: string; location_name: string; due_date: string; completed_at: string; created_at: string; }

const PRIORITY_COLORS: Record<string,string> = { laag: 'bg-blue-100 text-blue-700', normaal: 'bg-gray-100 text-gray-700', hoog: 'bg-amber-100 text-amber-700', urgent: 'bg-red-100 text-red-700' };
const STATUS_COLORS: Record<string,string> = { open: 'bg-blue-100 text-blue-700', in_uitvoering: 'bg-amber-100 text-amber-700', afgerond: 'bg-green-100 text-green-700' };
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
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">Taken</h1><p className="text-sm text-muted">{counts.open} open · {counts.in_uitvoering} in uitvoering · {counts.afgerond} afgerond</p></div>
        <button onClick={openForm} className="bg-primary hover:bg-primary-light text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"><Plus size={16} /> Nieuwe taak</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border mb-6 p-4">
        <div className="flex gap-2 flex-wrap">
          {['', 'open', 'in_uitvoering', 'afgerond'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusFilter === s ? 'bg-primary text-white' : 'bg-surface hover:bg-gray-200'}`}>{s === 'in_uitvoering' ? 'In uitvoering' : s || 'Alle'}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? <div className="bg-white rounded-2xl shadow-sm border p-8 text-center text-muted">Laden...</div> :
        tasks.length === 0 ? <div className="bg-white rounded-2xl shadow-sm border p-8 text-center text-muted">Geen taken</div> :
        tasks.map(t => {
          const Icon = STATUS_ICONS[t.status] || Clock;
          const overdue = t.due_date && !t.completed_at && new Date(t.due_date) < new Date();
          return (
            <div key={t.id} className={`bg-white rounded-2xl shadow-sm border p-4 flex items-start gap-4 ${overdue ? 'border-red-200' : ''}`}>
              <div className="mt-0.5"><Icon size={20} className={t.status === 'afgerond' ? 'text-green-500' : t.status === 'in_uitvoering' ? 'text-amber-500' : 'text-blue-500'} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{t.title}</h3>
                    {t.description && <p className="text-sm text-muted mt-1">{t.description}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${PRIORITY_COLORS[t.priority] || ''}`}>{t.priority}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[t.status] || ''}`}>{t.status === 'in_uitvoering' ? 'in uitvoering' : t.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                  {t.assigned_staff_name && <span className="flex items-center gap-1"><User size={12}/> {t.assigned_staff_name}</span>}
                  {t.location_name && <span>{t.location_name}</span>}
                  {t.due_date && <span className={overdue ? 'text-red-500 font-medium' : ''}>Deadline: {fmtDate(t.due_date)}</span>}
                </div>
              </div>
              <div className="flex-shrink-0">
                <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)} className="text-xs border rounded-lg px-2 py-1.5">
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-lg font-bold">Nieuwe taak</h2><button onClick={()=>setShowForm(false)}><X size={20}/></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="text-xs font-medium text-muted block mb-1">Titel *</label><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"/></div>
              <div><label className="text-xs font-medium text-muted block mb-1">Omschrijving</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm" rows={3}/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-muted block mb-1">Prioriteit</label><select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"><option value="laag">Laag</option><option value="normaal">Normaal</option><option value="hoog">Hoog</option><option value="urgent">Urgent</option></select></div>
                <div><label className="text-xs font-medium text-muted block mb-1">Deadline</label><input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"/></div>
              </div>
              <div><label className="text-xs font-medium text-muted block mb-1">Toewijzen aan</label><select value={form.assigned_to} onChange={e=>setForm({...form,assigned_to:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"><option value="">Niet toewijzen</option>{staff.map(s=><option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}</select></div>
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
