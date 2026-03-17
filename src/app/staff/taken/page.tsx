'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Clock, AlertCircle, AlertTriangle } from 'lucide-react';

interface Task { id: number; title: string; description: string; priority: string; status: string; location_name: string; due_date: string; completed_at: string; created_at: string; }

const PRIORITY_COLORS: Record<string,string> = { laag: 'bg-blue-100 text-blue-700', normaal: 'bg-gray-100 text-gray-700', hoog: 'bg-amber-100 text-amber-700', urgent: 'bg-red-100 text-red-700' };

export default function StaffTakenPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState('open');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch(`/api/staff/tasks?${params}`, { credentials: 'include' });
    const data = await res.json();
    setTasks(data.tasks || []); setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/staff/tasks/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }), credentials: 'include' });
    fetchData();
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('nl-NL') : '-';

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mijn taken</h1>

      <div className="bg-white rounded-2xl shadow-sm border mb-6 p-4">
        <div className="flex gap-2">
          {['open', 'in_uitvoering', 'afgerond', ''].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusFilter === s ? 'bg-primary text-white' : 'bg-surface hover:bg-gray-200'}`}>{s === 'in_uitvoering' ? 'In uitvoering' : s === '' ? 'Alle' : s === 'afgerond' ? 'Afgerond' : 'Open'}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? <div className="bg-white rounded-2xl shadow-sm border p-8 text-center text-muted">Laden...</div> :
        tasks.length === 0 ? <div className="bg-white rounded-2xl shadow-sm border p-8 text-center text-muted">Geen taken gevonden</div> :
        tasks.map(t => {
          const overdue = t.due_date && !t.completed_at && new Date(t.due_date) < new Date();
          return (
            <div key={t.id} className={`bg-white rounded-2xl shadow-sm border p-5 ${overdue ? 'border-red-200' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {t.status === 'afgerond' ? <CheckCircle size={16} className="text-green-500" /> : t.status === 'in_uitvoering' ? <AlertCircle size={16} className="text-amber-500" /> : <Clock size={16} className="text-blue-500" />}
                    <h3 className="font-semibold">{t.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                  </div>
                  {t.description && <p className="text-sm text-muted ml-6">{t.description}</p>}
                  <div className="flex gap-4 mt-2 ml-6 text-xs text-muted">
                    {t.location_name && <span>{t.location_name}</span>}
                    {t.due_date && <span className={overdue ? 'text-red-500 font-medium' : ''}>Deadline: {fmtDate(t.due_date)} {overdue && <AlertTriangle size={10} className="inline ml-0.5" />}</span>}
                  </div>
                </div>
                {t.status !== 'afgerond' && (
                  <div className="flex gap-2">
                    {t.status === 'open' && <button onClick={() => updateStatus(t.id, 'in_uitvoering')} className="bg-amber-100 text-amber-700 font-medium px-3 py-1.5 rounded-lg text-xs">Starten</button>}
                    <button onClick={() => updateStatus(t.id, 'afgerond')} className="bg-green-100 text-green-700 font-medium px-3 py-1.5 rounded-lg text-xs">Afronden</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
