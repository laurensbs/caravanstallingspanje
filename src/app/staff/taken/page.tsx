'use client';
import { PRIORITY_COLORS } from "@/lib/format";

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Clock, AlertCircle, AlertTriangle, Play, Check } from 'lucide-react';
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
      <h1 className="text-xl md:text-2xl font-black text-surface-dark mb-5">Mijn taken</h1>

      {/* Filter pills - scrollable on mobile */}
      <div className="bg-surface rounded-2xl border border-sand-dark/20 mb-5 p-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { v: 'open', label: 'Open' },
            { v: 'in_uitvoering', label: 'Bezig' },
            { v: 'afgerond', label: 'Klaar' },
            { v: '', label: 'Alle' },
          ].map(s => (
            <button key={s.v} onClick={() => setStatusFilter(s.v)} className={`px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${statusFilter === s.v ? 'bg-accent text-white shadow-md shadow-accent/20' : 'bg-sand/40 hover:bg-sand-dark/20 text-warm-gray'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task count */}
      {!loading && tasks.length > 0 && (
        <p className="text-xs text-warm-gray/70 mb-3 px-1">{tasks.length} {tasks.length === 1 ? 'taak' : 'taken'}</p>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {loading ? (
          <div className="bg-surface rounded-2xl border border-sand-dark/20 p-8 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mx-auto" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-sand-dark/20 p-10 text-center">
            <CheckCircle size={28} className="text-accent/40 mx-auto mb-3" />
            <p className="text-sm text-warm-gray/70 font-medium">
              {statusFilter === 'open' ? 'Geen openstaande taken!' : 'Geen taken gevonden'}
            </p>
          </div>
        ) : tasks.map(t => {
          const overdue = t.due_date && !t.completed_at && new Date(t.due_date) < new Date();
          const isUpdating = updatingId === t.id;
          return (
            <div key={t.id} className={`bg-surface rounded-2xl border overflow-hidden transition-all ${overdue ? 'border-danger/30' : 'border-sand-dark/20'} ${isUpdating ? 'opacity-50' : ''}`}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Priority dot */}
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${PRIORITY_DOT[t.priority] || 'bg-warm-gray'}`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-surface-dark truncate">{t.title}</h3>
                    </div>
                    {t.description && <p className="text-xs text-warm-gray/70 line-clamp-2">{t.description}</p>}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                      {t.location_name && <span className="text-xs text-warm-gray/70">{t.location_name}</span>}
                      {t.due_date && (
                        <span className={`text-xs ${overdue ? 'text-danger font-bold' : 'text-warm-gray/70'}`}>
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
                      <button onClick={() => updateStatus(t.id, 'in_uitvoering')} disabled={isUpdating} className="flex-1 flex items-center justify-center gap-1.5 bg-warning/10 hover:bg-warning/15 text-warning font-semibold py-2.5 rounded-xl text-xs transition-colors active:scale-95">
                        <Play size={12} fill="currentColor" /> Starten
                      </button>
                    )}
                    <button onClick={() => setConfirmAction({ id: t.id, status: 'afgerond', title: t.title })} disabled={isUpdating} className="flex-1 flex items-center justify-center gap-1.5 bg-accent/10 hover:bg-accent/15 text-primary-dark font-semibold py-2.5 rounded-xl text-xs transition-colors active:scale-95">
                      <Check size={12} strokeWidth={3} /> Afronden
                    </button>
                  </div>
                )}
                
                {t.status === 'afgerond' && t.completed_at && (
                  <p className="text-xs text-accent mt-2 ml-5">✓ Afgerond op {fmtDate(t.completed_at)}</p>
                )}
              </div>
            </div>
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
