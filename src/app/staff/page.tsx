'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Truck, Search, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface DashStats { tasks_open: number; tasks_today: number; inspections_due: number; transports_today: number; }

export default function StaffDashboard() {
  const [stats, setStats] = useState<DashStats>({ tasks_open: 0, tasks_today: 0, inspections_due: 0, transports_today: 0 });
  const [tasks, setTasks] = useState<{id:number;title:string;priority:string;status:string;due_date:string;location_name:string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/staff/dashboard', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/staff/tasks?status=open&limit=5', { credentials: 'include' }).then(r => r.json()),
    ]).then(([d, t]) => {
      setStats(d.stats || stats); setTasks(t.tasks || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const PRIORITY_COLORS: Record<string,string> = { laag: 'border-blue-300', normaal: 'border-gray-300', hoog: 'border-amber-400', urgent: 'border-red-400' };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Goedemorgen!</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Open taken', value: stats.tasks_open, icon: ClipboardList, color: 'text-blue-500' },
          { label: 'Taken vandaag', value: stats.tasks_today, icon: Clock, color: 'text-amber-500' },
          { label: 'Inspecties gepland', value: stats.inspections_due, icon: Search, color: 'text-purple-500' },
          { label: 'Transport vandaag', value: stats.transports_today, icon: Truck, color: 'text-green-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-2"><s.icon size={20} className={s.color} /></div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold">Mijn openstaande taken</h2>
          <a href="/staff/taken" className="text-primary text-sm font-medium hover:underline">Alle taken →</a>
        </div>
        <div className="divide-y">
          {tasks.length === 0 ? <div className="p-6 text-center text-sm text-muted">Geen openstaande taken</div> :
          tasks.map(t => (
            <div key={t.id} className={`p-4 flex items-center gap-3 border-l-4 ${PRIORITY_COLORS[t.priority] || 'border-gray-200'}`}>
              {t.priority === 'urgent' ? <AlertTriangle size={16} className="text-red-500" /> : <Clock size={16} className="text-muted" />}
              <div className="flex-1"><h3 className="text-sm font-medium">{t.title}</h3><p className="text-xs text-muted">{t.location_name || 'Alle locaties'} {t.due_date ? `· Deadline: ${new Date(t.due_date).toLocaleDateString('nl-NL')}` : ''}</p></div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${t.priority === 'urgent' ? 'bg-red-100 text-red-700' : t.priority === 'hoog' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{t.priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
