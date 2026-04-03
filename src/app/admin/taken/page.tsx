'use client';
import { PRIORITY_COLORS, TASK_STATUS_COLORS } from "@/lib/format";
import { useAdminI18n } from '@/lib/admin-i18n';

import { useState } from 'react';
import { ClipboardList, Plus, X, CheckCircle, Clock, AlertCircle, User } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import Modal from '@/components/ui/Modal';

interface Task { id: number; title: string; description: string; priority: string; status: string; assigned_to: number; assigned_staff_name: string; location_name: string; due_date: string; completed_at: string; created_at: string; }

const STATUS_ICONS: Record<string, typeof Clock> = { open: Clock, in_uitvoering: AlertCircle, afgerond: CheckCircle };

export default function TakenPage() {
  const { t } = useAdminI18n();
  const [statusFilter, setStatusFilter] = useState('');
  const { items: tasks, total, loading, refetch: fetchData } = useAdminData<Task>({ endpoint: '/api/admin/tasks', dataKey: 'tasks', params: { status: statusFilter } });
  const [showForm, setShowForm] = useState(false);
  const [staff, setStaff] = useState<{id:number;first_name:string;last_name:string}[]>([]);
  const [form, setForm] = useState({ title: '', description: '', priority: 'normaal', assigned_to: '', location_id: '', due_date: '' });

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
        <div><h1 className="text-2xl font-bold text-gray-900">{t('Taken')}</h1><p className="text-sm text-gray-500/70 mt-1">{counts.open} {t('open')} · {counts.in_uitvoering} {t('in uitvoering')} · {counts.afgerond} {t('afgerond')}</p></div>
        <button onClick={openForm} className="bg-primary hover:bg-primary-light text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"><Plus size={16} /> {t('Nieuwe taak')}</button>
      </div>

      <div className="bg-surface rounded-2xl border border-gray-200 mb-6 p-4">
        <div className="flex gap-2 flex-wrap">
          {['', 'open', 'in_uitvoering', 'afgerond'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${statusFilter === s ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-gray-50 hover:bg-gray-300/20 text-gray-500'}`}>{s === 'in_uitvoering' ? t('In uitvoering') : s || t('Alle')}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? <div className="bg-surface rounded-2xl border border-gray-200 p-8 text-center text-gray-500/70">{t('Laden...')}</div> :
        tasks.length === 0 ? <div className="bg-surface rounded-2xl border border-gray-200 p-8 text-center text-gray-500/70">{t('Geen taken')}</div> :
        tasks.map(task => {
          const Icon = STATUS_ICONS[task.status] || Clock;
          const overdue = task.due_date && !task.completed_at && new Date(task.due_date) < new Date();
          return (
            <div key={task.id} className={`bg-surface rounded-2xl border p-4 flex items-start gap-4 hover:shadow-lg hover:shadow-gray-200/30 transition-all ${overdue ? 'border-danger/30' : 'border-gray-200'}`}>
              <div className="mt-0.5"><Icon size={20} className={task.status === 'afgerond' ? 'text-accent' : task.status === 'in_uitvoering' ? 'text-warning' : 'text-ocean'} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    {task.description && <p className="text-sm text-gray-500/70 mt-1">{task.description}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${PRIORITY_COLORS[task.priority] || ''}`}>{task.priority}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${TASK_STATUS_COLORS[task.status] || ''}`}>{task.status === 'in_uitvoering' ? t('in uitvoering') : task.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500/70">
                  {task.assigned_staff_name && <span className="flex items-center gap-1"><User size={12}/> {task.assigned_staff_name}</span>}
                  {task.location_name && <span>{task.location_name}</span>}
                  {task.due_date && <span className={overdue ? 'text-danger font-medium' : ''}>{t('Deadline')}: {fmtDate(task.due_date)}</span>}
                </div>
              </div>
              <div className="flex-shrink-0">
                <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none">
                  <option value="open">{t('Open')}</option>
                  <option value="in_uitvoering">{t('In uitvoering')}</option>
                  <option value="afgerond">{t('Afgerond')}</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={t('Nieuwe taak')} size="sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="text-xs font-semibold text-gray-500 block mb-1">{t('Titel')} *</label><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"/></div>
              <div><label className="text-xs font-semibold text-gray-500 block mb-1">{t('Omschrijving')}</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" rows={3}/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-gray-500 block mb-1">{t('Prioriteit')}</label><select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none"><option value="laag">{t('Laag')}</option><option value="normaal">{t('Normaal')}</option><option value="hoog">{t('Hoog')}</option><option value="urgent">{t('Urgent')}</option></select></div>
                <div><label className="text-xs font-semibold text-gray-500 block mb-1">{t('Deadline')}</label><input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none"/></div>
              </div>
              <div><label className="text-xs font-semibold text-gray-500 block mb-1">{t('Toewijzen aan')}</label><select value={form.assigned_to} onChange={e=>setForm({...form,assigned_to:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none"><option value="">{t('Niet toewijzen')}</option>{staff.map(s=><option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}</select></div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2.5 text-sm text-gray-500/70 hover:bg-gray-300/20 rounded-xl transition-colors">{t('Annuleren')}</button>
                <button type="submit" className="bg-primary hover:bg-primary-light text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-primary/20 transition-all">{t('Aanmaken')}</button>
              </div>
            </form>
      </Modal>
    </div>
  );
}
