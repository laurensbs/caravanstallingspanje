'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Truck, Search, AlertTriangle, Clock, ArrowRight, Activity } from 'lucide-react';

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

  const PRIORITY_COLORS: Record<string,string> = { laag: 'border-l-ocean/50', normaal: 'border-l-warm-gray/50', hoog: 'border-l-warning', urgent: 'border-l-danger' };
  const PRIORITY_BADGES: Record<string,string> = { urgent: 'bg-danger/10 text-danger border-danger/30', hoog: 'bg-warning/10 text-warning border-warning/30', normaal: 'bg-sand/40 text-warm-gray border-sand-dark/30', laag: 'bg-ocean/10 text-ocean border-ocean/30' };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" /></div>;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Goedemorgen' : hour < 18 ? 'Goedemiddag' : 'Goedenavond';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-surface-dark">{greeting}!</h1>
        <p className="text-sm text-warm-gray/70 mt-1">Hier is uw dagelijkse overzicht</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Open taken', value: stats.tasks_open, icon: ClipboardList, bg: 'bg-ocean/10', text: 'text-ocean' },
          { label: 'Taken vandaag', value: stats.tasks_today, icon: Clock, bg: 'bg-warning/10', text: 'text-warning' },
          { label: 'Inspecties gepland', value: stats.inspections_due, icon: Search, bg: 'bg-primary/10', text: 'text-primary' },
          { label: 'Transport vandaag', value: stats.transports_today, icon: Truck, bg: 'bg-accent/10', text: 'text-accent' },
        ].map((s) => (
          <div key={s.label} className="bg-surface rounded-2xl border border-sand-dark/20 p-5 hover:shadow-lg hover:shadow-sand-dark/20 transition-all">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
              <s.icon size={18} className={s.text} />
            </div>
            <div className="text-2xl font-black text-surface-dark">{s.value}</div>
            <div className="text-xs font-medium text-warm-gray/70 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-2xl border border-sand-dark/20">
        <div className="p-5 border-b border-sand-dark/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity size={16} className="text-warm-gray/50" />
            <h2 className="font-bold text-surface-dark">Mijn openstaande taken</h2>
          </div>
          <a href="/staff/taken" className="text-accent text-sm font-semibold hover:underline flex items-center gap-1">
            Alle taken <ArrowRight size={14}/>
          </a>
        </div>
        <div className="divide-y divide-sand-dark/10">
          {tasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-sand/40 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ClipboardList size={20} className="text-warm-gray/50" />
              </div>
              <p className="text-sm text-warm-gray/70 font-medium">Geen openstaande taken</p>
            </div>
          ) : tasks.map(t => (
            <div key={t.id} className={`p-4 flex items-center gap-4 border-l-4 ${PRIORITY_COLORS[t.priority] || 'border-l-slate-200'} hover:bg-sand/40/50 transition-colors`}>
              {t.priority === 'urgent' ? <AlertTriangle size={16} className="text-danger shrink-0" /> : <Clock size={16} className="text-warm-gray/50 shrink-0" />}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-surface-dark">{t.title}</h3>
                <p className="text-[11px] text-warm-gray/70 mt-0.5">{t.location_name || 'Alle locaties'} {t.due_date ? `· Deadline: ${new Date(t.due_date).toLocaleDateString('nl-NL')}` : ''}</p>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${PRIORITY_BADGES[t.priority] || 'bg-sand/40 text-warm-gray border-sand-dark/30'}`}>{t.priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
