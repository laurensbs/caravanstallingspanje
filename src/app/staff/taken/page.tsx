'use client';
import { PRIORITY_COLORS } from "@/lib/format";

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Clock, AlertCircle, AlertTriangle, Play, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';

interface Task { id: number; title: string; description: string; priority: string; status: string; location_name: string; due_date: string; completed_at: string; created_at: string; }

const PRIORITY_DOT: Record<string,string> = { laag: 'bg-ocean', normaal: 'bg-warm-gray', hoog: 'bg-warning', urgent: 'bg-danger/100' };

export default function StaffTakenPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState('open');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: number; status: string; title: string } | null>(null);

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
    setUpdatingId(id);
    await fetch(`/api/staff/tasks/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }), credentials: 'include' });
    toast.success(status === 'afgerond' ? 'Taak afgerond!' : 'Taak gestart');
    fetchData();
    setUpdatingId(null);
    setConfirmAction(null);
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) : '';

  return (
    <div>
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-xl md:text-2xl font-bold text-gray-900 mb-5">Mijn taken</motion.h1>

      {/* Filter pills - scrollable on mobile */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-premium mb-5 p-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { v: 'open', label: 'Open' },
            { v: 'in_uitvoering', label: 'Bezig' },
            { v: 'afgerond', label: 'Klaar' },
            { v: '', label: 'Alle' },
          ].map(s => (
            <button key={s.v} onClick={() => setStatusFilter(s.v)} className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${statusFilter === s.v ? 'bg-gradient-to-r from-accent to-accent-dark text-white shadow-lg shadow-accent/20' : 'bg-gray-50 hover:bg-gray-300/20 text-gray-500'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Task count */}
      {!loading && tasks.length > 0 && (
        <p className="text-xs text-gray-500/70 mb-3 px-1">{tasks.length} {tasks.length === 1 ? 'taak' : 'taken'}</p>
      )}

      {/* Task list */}
      <div className="space-y-3">
        {loading ? (
          <div className="card-premium p-8 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mx-auto" />
          </div>
        ) : tasks.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-10 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-accent/15 to-accent/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={22} className="text-accent" />
            </div>
            <p className="text-sm text-gray-500/70 font-bold">
              {statusFilter === 'open' ? 'Geen openstaande taken!' : 'Geen taken gevonden'}
            </p>
          </motion.div>
        ) : tasks.map(t => {
          const overdue = t.due_date && !t.completed_at && new Date(t.due_date) < new Date();
          const isUpdating = updatingId === t.id;
          return (
            <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + tasks.indexOf(t) * 0.03 }}
              className={`card-premium overflow-hidden transition-all ${overdue ? 'ring-1 ring-danger/30' : ''} ${isUpdating ? 'opacity-50' : ''}`}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Priority dot */}
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${PRIORITY_DOT[t.priority] || 'bg-warm-gray'}`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{t.title}</h3>
                    </div>
                    {t.description && <p className="text-xs text-gray-500/70 line-clamp-2">{t.description}</p>}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                      {t.location_name && <span className="text-xs text-gray-500/70">{t.location_name}</span>}
                      {t.due_date && (
                        <span className={`text-xs ${overdue ? 'text-danger font-bold' : 'text-gray-500/70'}`}>
                          {overdue && '⚠ '}{fmtDate(t.due_date)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons - large touch targets */}
                {t.status !== 'afgerond' && (
                  <div className="flex gap-2 mt-3 ml-5">
                    {t.status === 'open' && (
                      <button onClick={() => updateStatus(t.id, 'in_uitvoering')} disabled={isUpdating} className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-warning/15 to-warning/10 hover:from-warning/20 hover:to-warning/15 text-warning font-bold py-3 rounded-xl text-xs transition-all active:scale-95 min-h-[44px]">
                        <Play size={13} fill="currentColor" /> Starten
                      </button>
                    )}
                    <button onClick={() => setConfirmAction({ id: t.id, status: 'afgerond', title: t.title })} disabled={isUpdating} className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-accent/15 to-accent/10 hover:from-accent/20 hover:to-accent/15 text-primary-dark font-bold py-3 rounded-xl text-xs transition-all active:scale-95 min-h-[44px]">
                      <Check size={13} strokeWidth={3} /> Afronden
                    </button>
                  </div>
                )}
                
                {t.status === 'afgerond' && t.completed_at && (
                  <p className="text-xs text-accent mt-2 ml-5">✓ Afgerond op {fmtDate(t.completed_at)}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => confirmAction && updateStatus(confirmAction.id, confirmAction.status)}
        title="Taak afronden?"
        description={confirmAction ? `Weet u zeker dat u "${confirmAction.title}" als afgerond wilt markeren?` : ''}
        confirmLabel="Ja, afronden"
        loading={!!updatingId}
      />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
