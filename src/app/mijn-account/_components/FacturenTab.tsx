'use client';
import { useState, useMemo } from 'react';
import { fmt, fmtDate, CUSTOMER_STATUS_COLORS } from '@/lib/format';
import { CreditCard, Filter, Download, Receipt, Calendar, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Invoice } from './types';

interface Props { invoices: Invoice[]; }

export default function FacturenTab({ invoices }: Props) {
  const [statusFilter, setStatusFilter] = useState('alle');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const statuses = useMemo(() => {
    const s = new Set(invoices.map(i => i.status));
    return ['alle', ...Array.from(s)];
  }, [invoices]);

  const filtered = useMemo(() =>
    statusFilter === 'alle' ? invoices : invoices.filter(i => i.status === statusFilter),
    [invoices, statusFilter]
  );

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(i => i.id)));
  };

  const downloadPdf = (invoiceId: number) => {
    window.open(`/api/customer/invoices?pdf=${invoiceId}`, '_blank');
  };

  const downloadSelectedPdfs = () => {
    selected.forEach(id => downloadPdf(id));
  };

  if (invoices.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-12 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-warning/15 to-warning/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Receipt size={24} className="text-warning" />
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-1">Geen facturen</h3>
        <p className="text-sm text-gray-500/70">U heeft nog geen facturen ontvangen.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <Filter size={14} className="text-gray-500/50" />
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setSelected(new Set()); }} className="text-sm bg-transparent border-none outline-none text-gray-500 cursor-pointer">
              {statuses.map(s => <option key={s} value={s}>{s === 'alle' ? 'Alle statussen' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          {selected.size > 0 && (
            <button onClick={downloadSelectedPdfs} className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold px-4 py-2 rounded-xl text-sm transition-all inline-flex items-center gap-2 shadow-lg shadow-primary/20 hover:-translate-y-0.5">
              <Download size={14} /> {selected.size} PDF{selected.size > 1 ? "'s" : ''} downloaden
            </button>
          )}
          <span className="text-sm text-gray-500/50 ml-auto font-medium">{filtered.length} facturen</span>
        </div>
      </motion.div>

      {/* Invoice cards */}
      {filtered.map((inv, i) => {
        const isOverdue = inv.status === 'achterstallig' || (inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== 'betaald');
        return (
          <motion.div key={inv.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.04 }}
            className={`card-premium p-5 ${isOverdue ? 'ring-1 ring-danger/30' : ''} ${selected.has(inv.id) ? 'ring-1 ring-primary/30 bg-primary/[0.02]' : ''}`}>
            <div className="flex items-center gap-4">
              <input type="checkbox" checked={selected.has(inv.id)} onChange={() => toggleSelect(inv.id)}
                className="w-5 h-5 rounded-lg border-gray-200 accent-primary cursor-pointer shrink-0" />
              <div className="icon-premium w-11 h-11 shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-gray-900 text-sm">{inv.invoice_number}</h3>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${CUSTOMER_STATUS_COLORS[inv.status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>{inv.status}</span>
                </div>
                <p className="text-xs text-gray-500/70 truncate">{inv.description || 'Stallingkosten'}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="stat-number text-lg">{fmt(inv.total)}</p>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  <Calendar size={10} className="text-gray-500/50" />
                  <span className={`text-xs ${isOverdue ? 'text-danger font-bold' : 'text-gray-500/70'}`}>{fmtDate(inv.due_date)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 ml-[4.25rem]">
              <button onClick={() => downloadPdf(inv.id)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500/70 hover:text-primary bg-gray-50 hover:bg-primary/[0.06] px-3 py-1.5 rounded-lg transition-all">
                <Download size={12} /> PDF
              </button>
              {inv.status !== 'betaald' && (
                <button onClick={() => window.open(`/api/customer/invoices?pay=${inv.id}`, '_blank')} className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-primary to-primary-light px-3.5 py-1.5 rounded-lg shadow-sm shadow-primary/20 hover:-translate-y-0.5 transition-all">
                  <CreditCard size={12} /> Betalen
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
