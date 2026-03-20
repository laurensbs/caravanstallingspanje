'use client';
import { fmt, fmtDate, CUSTOMER_STATUS_COLORS } from '@/lib/format';
import { CheckCircle2, Clock } from 'lucide-react';
import type { Contract } from './types';

interface Props { contracts: Contract[]; }

export default function ContractenTab({ contracts }: Props) {
  return (
    <div className="bg-surface rounded-2xl border border-sand-dark/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-sand/40 border-b border-sand-dark/20">
            <tr>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Contract</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Periode</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Maandbedrag</th>
              <th className="text-center px-5 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Auto-verlenging</th>
              <th className="text-center px-5 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-dark/10">{contracts.map(c => (
            <tr key={c.id} className="hover:bg-sand/30 transition-colors">
              <td className="px-5 py-4 font-mono text-xs text-warm-gray">{c.contract_number}</td>
              <td className="px-5 py-4 text-xs text-warm-gray">{fmtDate(c.start_date)} — {fmtDate(c.end_date)}</td>
              <td className="px-5 py-4 text-right font-bold text-surface-dark">{fmt(c.monthly_rate)}</td>
              <td className="px-5 py-4 text-center">{c.auto_renew ? <CheckCircle2 size={16} className="text-accent mx-auto" /> : <Clock size={16} className="text-warm-gray/50 mx-auto" />}</td>
              <td className="px-5 py-4 text-center"><span className={`text-xs font-semibold px-3 py-1 rounded-full border ${CUSTOMER_STATUS_COLORS[c.status] || 'bg-sand/40 text-warm-gray border-sand-dark/30'}`}>{c.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
