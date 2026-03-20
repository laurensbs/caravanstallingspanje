'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Truck, Search, AlertTriangle, Clock, ArrowRight, Activity, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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
      {/* Welcome banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden bg-gradient-to-br from-surface-dark to-hero rounded-2xl p-6 mb-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/[0.06] rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-black text-white">{greeting}!</h1>
            <Sparkles size={18} className="text-primary-light" />
          </div>
          <p className="text-sm text-white/60">Hier is uw dagelijkse overzicht</p>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Open taken', value: stats.tasks_open, icon: ClipboardList, gradient: 'from-ocean/15 to-ocean/5', text: 'text-ocean' },
          { label: 'Taken vandaag', value: stats.tasks_today, icon: Clock, gradient: 'from-warning/15 to-warning/5', text: 'text-warning' },
          { label: 'Inspecties gepland', value: stats.inspections_due, icon: Search, gradient: 'from-primary/15 to-primary/5', text: 'text-primary' },
          { label: 'Transport vandaag', value: stats.transports_today, icon: Truck, gradient: 'from-accent/15 to-accent/5', text: 'text-accent' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.06 }}
            className="card-premium p-5">
            <div className={`w-11 h-11 bg-gradient-to-br ${s.gradient} rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
              <s.icon size={18} className={s.text} />
            </div>
            <div className="stat-number text-2xl">{s.value}</div>
            <div className="text-xs font-bold text-warm-gray/60 uppercase tracking-wider mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Task list */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-premium overflow-hidden">
        <div className="p-5 border-b border-sand-dark/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary/15 to-primary/5 rounded-lg flex items-center justify-center">
              <Activity size={14} className="text-primary" />
            </div>
            <h2 className="font-bold text-surface-dark">Mijn openstaande taken</h2>
          </div>
          <a href="/staff/taken" className="bg-gradient-to-r from-accent/10 to-accent/5 text-accent-dark text-sm font-bold px-3.5 py-1.5 rounded-lg hover:-translate-y-0.5 transition-all flex items-center gap-1 border border-accent/20">
            Alle taken <ArrowRight size={13}/>
          </a>
        </div>
        <div className="divide-y divide-sand-dark/10">
          {tasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-accent/15 to-accent/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ClipboardList size={22} className="text-accent" />
              </div>
              <p className="text-sm text-warm-gray/70 font-bold">Geen openstaande taken</p>
              <p className="text-xs text-warm-gray/50 mt-1">Goed bezig!</p>
            </div>
          ) : tasks.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.04 }}
              className={`p-4 flex items-center gap-4 border-l-4 ${PRIORITY_COLORS[t.priority] || 'border-l-slate-200'} hover:bg-sand/30 transition-colors`}>
              {t.priority === 'urgent' ? <AlertTriangle size={16} className="text-danger shrink-0" /> : <Clock size={16} className="text-warm-gray/50 shrink-0" />}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-surface-dark">{t.title}</h3>
                <p className="text-xs text-warm-gray/70 mt-0.5">{t.location_name || 'Alle locaties'} {t.due_date ? `· Deadline: ${new Date(t.due_date).toLocaleDateString('nl-NL')}` : ''}</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${PRIORITY_BADGES[t.priority] || 'bg-sand/40 text-warm-gray border-sand-dark/30'}`}>{t.priority}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
