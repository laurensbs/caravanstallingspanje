'use client';
import { fmtDate } from '@/lib/format';
import { ClipboardCheck } from 'lucide-react';

interface Inspection { id: number; caravan_name: string; inspection_date: string; type: string; status: string; notes: string; }
interface Props { inspections: Inspection[]; }

export default function InspectiesTab({ inspections }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="font-bold text-surface-dark text-lg">Inspectierapporten</h2>
      <p className="text-sm text-warm-gray/70">Bekijk de inspectierapporten van uw gestalde caravans.</p>
      {inspections.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-sand-dark/20 p-12 text-center">
          <ClipboardCheck size={32} className="text-warm-gray/40 mx-auto mb-3" />
          <p className="text-sm text-warm-gray/70">Nog geen inspectierapporten beschikbaar</p>
        </div>
      ) : inspections.map(ins => (
        <div key={ins.id} className="bg-surface rounded-2xl border border-sand-dark/20 p-6 hover:shadow-lg hover:shadow-sand-dark/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-ocean/10 rounded-xl flex items-center justify-center"><ClipboardCheck size={18} className="text-ocean" /></div>
              <div><h3 className="font-bold text-surface-dark text-sm">{ins.caravan_name}</h3><p className="text-xs text-warm-gray/70">{fmtDate(ins.inspection_date)}</p></div>
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${ins.status === 'goedgekeurd' ? 'bg-accent/10 text-primary-dark border-accent/30' : ins.status === 'afgekeurd' ? 'bg-danger/10 text-danger border-danger/30' : 'bg-ocean/10 text-ocean-dark border-ocean/30'}`}>{ins.status}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-sand/60 rounded-xl p-3"><span className="text-warm-gray/70 text-xs font-medium block mb-0.5">Type</span><span className="font-medium text-surface-dark">{ins.type}</span></div>
            <div className="bg-sand/60 rounded-xl p-3"><span className="text-warm-gray/70 text-xs font-medium block mb-0.5">Opmerkingen</span><span className="font-medium text-surface-dark">{ins.notes || '-'}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}
