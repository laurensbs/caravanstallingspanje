'use client';
import { fmtDate } from '@/lib/format';
import { ClipboardCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Inspection { id: number; caravan_name: string; inspection_date: string; type: string; status: string; notes: string; }
interface Props { inspections: Inspection[]; }

const STATUS_STYLES: Record<string, { bg: string; icon: typeof CheckCircle2 }> = {
  goedgekeurd: { bg: 'bg-accent/10 text-primary-dark border-accent/30', icon: CheckCircle2 },
  afgekeurd: { bg: 'bg-danger/10 text-danger border-danger/30', icon: XCircle },
};

export default function InspectiesTab({ inspections }: Props) {
  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-black text-surface-dark text-lg">Inspectierapporten</h2>
        <p className="text-sm text-warm-gray/70 mt-1">Bekijk de inspectierapporten van uw gestalde caravans.</p>
      </motion.div>

      {inspections.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-ocean/15 to-ocean/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck size={24} className="text-ocean" />
          </div>
          <h3 className="font-bold text-surface-dark text-lg mb-1">Geen rapporten</h3>
          <p className="text-sm text-warm-gray/70">Nog geen inspectierapporten beschikbaar</p>
        </motion.div>
      ) : inspections.map((ins, i) => {
        const style = STATUS_STYLES[ins.status] || { bg: 'bg-ocean/10 text-ocean-dark border-ocean/30', icon: Clock };
        const StatusIcon = style.icon;
        return (
          <motion.div key={ins.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.06 }}
            className="card-premium p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="icon-premium w-11 h-11">
                  <ClipboardCheck size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-surface-dark">{ins.caravan_name}</h3>
                  <p className="text-xs text-warm-gray/70">{fmtDate(ins.inspection_date)}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${style.bg}`}>
                <StatusIcon size={12} />{ins.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-sand/40 rounded-xl p-3">
                <span className="text-xs font-bold text-warm-gray/60 uppercase tracking-wider block mb-1">Type</span>
                <span className="font-medium text-surface-dark text-sm">{ins.type}</span>
              </div>
              <div className="bg-sand/40 rounded-xl p-3">
                <span className="text-xs font-bold text-warm-gray/60 uppercase tracking-wider block mb-1">Opmerkingen</span>
                <span className="font-medium text-surface-dark text-sm">{ins.notes || '—'}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
