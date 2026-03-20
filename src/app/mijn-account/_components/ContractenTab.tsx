'use client';
import { fmt, fmtDate, CUSTOMER_STATUS_COLORS } from '@/lib/format';
import { CheckCircle2, Clock, FileText, Calendar, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Contract } from './types';

interface Props { contracts: Contract[]; }

export default function ContractenTab({ contracts }: Props) {
  if (contracts.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-12 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-ocean/15 to-ocean/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText size={24} className="text-ocean" />
        </div>
        <h3 className="font-bold text-surface-dark text-lg mb-1">Geen contracten</h3>
        <p className="text-sm text-warm-gray/70">U heeft nog geen actieve contracten.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {contracts.map((c, i) => {
        const isExpiringSoon = c.end_date && new Date(c.end_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return (
          <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`card-premium p-5 ${isExpiringSoon && c.status === 'actief' ? 'ring-1 ring-warning/30' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="icon-premium w-11 h-11">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-surface-dark">{c.contract_number}</h3>
                  <p className="text-xs text-warm-gray/70">{fmt(c.monthly_rate)}/maand</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full border ${CUSTOMER_STATUS_COLORS[c.status] || 'bg-sand/40 text-warm-gray border-sand-dark/30'}`}>{c.status}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-sand/40 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar size={12} className="text-ocean/70" />
                  <span className="text-xs font-bold text-warm-gray/60 uppercase tracking-wider">Periode</span>
                </div>
                <p className="text-sm font-medium text-surface-dark">{fmtDate(c.start_date)} — {fmtDate(c.end_date)}</p>
              </div>
              <div className="bg-sand/40 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <RefreshCw size={12} className="text-ocean/70" />
                  <span className="text-xs font-bold text-warm-gray/60 uppercase tracking-wider">Auto-verlenging</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {c.auto_renew ? <CheckCircle2 size={14} className="text-accent" /> : <Clock size={14} className="text-warm-gray/50" />}
                  <span className="text-sm font-medium text-surface-dark">{c.auto_renew ? 'Actief' : 'Uit'}</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/[0.06] to-transparent rounded-xl p-3">
                <span className="text-xs font-bold text-warm-gray/60 uppercase tracking-wider block mb-1">Maandbedrag</span>
                <p className="stat-number text-lg">{fmt(c.monthly_rate)}</p>
              </div>
            </div>
            {isExpiringSoon && c.status === 'actief' && (
              <div className="mt-3 flex items-center gap-2 text-xs text-warning font-semibold bg-warning/[0.06] rounded-lg px-3 py-2 border border-warning/20">
                <Clock size={12} />
                Contract verloopt binnenkort
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
