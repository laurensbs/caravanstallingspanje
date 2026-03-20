'use client';
import { useState, useMemo } from 'react';
import { fmt, fmtDate, CUSTOMER_STATUS_COLORS } from '@/lib/format';
import { CreditCard, Filter, Download, Receipt } from 'lucide-react';
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

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-surface border border-sand-dark/20 rounded-xl px-3 py-2">
          <Filter size={14} className="text-warm-gray/50" />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setSelected(new Set()); }} className="text-sm bg-transparent border-none outline-none text-warm-gray cursor-pointer">
            {statuses.map(s => <option key={s} value={s}>{s === 'alle' ? 'Alle statussen' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        {selected.size > 0 && (
          <button onClick={downloadSelectedPdfs} className="bg-primary hover:bg-primary-light text-white font-bold px-4 py-2 rounded-xl text-sm transition-all inline-flex items-center gap-2">
            <Download size={14} /> {selected.size} PDF{selected.size > 1 ? "'s" : ''} downloaden
          </button>
        )}
        <span className="text-sm text-warm-gray/50 ml-auto">{filtered.length} facturen</span>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-sand-dark/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead className="bg-sand/40 border-b border-sand-dark/20">
              <tr>
                <th className="text-left px-3 py-3.5 w-10"><input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleAll} className="w-4 h-4 rounded border-sand-dark/30 accent-primary cursor-pointer" /></th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Factuur</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Omschrijving</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Bedrag</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Vervaldatum</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-dark/10">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-warm-gray/50">
                  <Receipt size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Geen facturen gevonden</p>
                </td></tr>
              ) : filtered.map(i => (
                <tr key={i.id} className={`hover:bg-sand/30 transition-colors ${selected.has(i.id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-3 py-4"><input type="checkbox" checked={selected.has(i.id)} onChange={() => toggleSelect(i.id)} className="w-4 h-4 rounded border-sand-dark/30 accent-primary cursor-pointer" /></td>
                  <td className="px-4 py-4 font-mono text-xs text-warm-gray">{i.invoice_number}</td>
                  <td className="px-4 py-4 text-sm text-warm-gray">{i.description || '-'}</td>
                  <td className="px-4 py-4 text-right font-bold text-surface-dark">{fmt(i.total)}</td>
                  <td className="px-4 py-4 text-sm text-warm-gray">{fmtDate(i.due_date)}</td>
                  <td className="px-4 py-4 text-center"><span className={`text-xs font-semibold px-3 py-1 rounded-full border ${CUSTOMER_STATUS_COLORS[i.status] || 'bg-sand/40 text-warm-gray border-sand-dark/30'}`}>{i.status}</span></td>
                  <td className="px-4 py-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => downloadPdf(i.id)} className="text-warm-gray/50 hover:text-primary transition-colors p-1" title="Download PDF"><Download size={14} /></button>
                      {i.status !== 'betaald' && (
                        <button onClick={() => window.open(`/api/customer/invoices?pay=${i.id}`, '_blank')} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors">
                          <CreditCard size={12} /> Betalen
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
