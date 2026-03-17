'use client';

import { useState, useEffect, useCallback } from 'react';
import { Receipt, Plus, X, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, Euro } from 'lucide-react';

interface Invoice { id: number; invoice_number: string; customer_name: string; customer_email: string; description: string; subtotal: number; tax_amount: number; total: number; status: string; due_date: string; paid_date: string; payment_method: string; created_at: string; }

const STATUS_COLORS: Record<string,string> = { open: 'bg-blue-100 text-blue-700', verzonden: 'bg-amber-100 text-amber-700', betaald: 'bg-green-100 text-green-700', achterstallig: 'bg-red-100 text-red-700', geannuleerd: 'bg-gray-100 text-gray-500' };

export default function FacturenPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_id: '', description: '', subtotal: '', tax_rate: '21', due_date: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch(`/api/admin/invoices?${params}`, { credentials: 'include' });
    const data = await res.json();
    setInvoices(data.invoices || []); setTotal(data.total || 0); setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = parseFloat(form.subtotal);
    const taxRate = parseFloat(form.tax_rate);
    const taxAmount = subtotal * (taxRate / 100);
    await fetch('/api/admin/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, subtotal, tax_rate: taxRate, tax_amount: taxAmount, total: subtotal + taxAmount }), credentials: 'include' });
    setShowForm(false); fetchData();
  };

  const markPaid = async (id: number) => {
    await fetch(`/api/admin/invoices/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'betaald', payment_method: 'handmatig' }), credentials: 'include' });
    fetchData();
  };

  const fmt = (n: number) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('nl-NL') : '-';
  const totalPages = Math.ceil(total / 50);

  const totalOpen = invoices.filter(i => i.status === 'open' || i.status === 'verzonden').reduce((s, i) => s + Number(i.total), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-black text-slate-900">Facturen</h1><p className="text-sm text-slate-400 mt-1">{total} facturen · Openstaand: {fmt(totalOpen)}</p></div>
        <button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"><Plus size={16} /> Nieuwe factuur</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 mb-6 p-4">
        <div className="flex gap-2 flex-wrap">
          {['', 'open', 'verzonden', 'betaald', 'achterstallig', 'geannuleerd'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${statusFilter === s ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'}`}>{s || 'Alle'}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100"><tr>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Factuur</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Klant</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Omschrijving</th>
            <th className="text-right px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Bedrag</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vervaldatum</th>
            <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
            <th className="text-right px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Acties</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Laden...</td></tr> :
            invoices.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Geen facturen</td></tr> :
            invoices.map(i => {
              const overdue = !i.paid_date && new Date(i.due_date) < new Date();
              return (
                <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{i.invoice_number}</td>
                  <td className="px-4 py-3 text-slate-700">{i.customer_name}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs max-w-[200px] truncate">{i.description || '-'}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">{fmt(Number(i.total))}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(i.due_date)} {overdue && <AlertTriangle size={12} className="inline text-red-500 ml-1" />}</td>
                  <td className="px-4 py-3 text-center"><span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[overdue && i.status !== 'betaald' ? 'achterstallig' : i.status] || 'bg-gray-100'}`}>{overdue && i.status !== 'betaald' ? 'achterstallig' : i.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    {i.status !== 'betaald' && i.status !== 'geannuleerd' && (
                      <button onClick={() => markPaid(i.id)} className="text-xs text-green-600 font-medium flex items-center gap-1 ml-auto"><CheckCircle size={12} /> Betaald</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100"><p className="text-xs text-slate-400">Pagina {page}/{totalPages}</p><div className="flex gap-1"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronLeft size={16} className="text-slate-400"/></button><button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronRight size={16} className="text-slate-400"/></button></div></div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100"><h2 className="text-lg font-bold text-slate-900">Nieuwe factuur</h2><button onClick={()=>setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="text-xs font-semibold text-slate-500 block mb-1">Klant ID *</label><input required value={form.customer_id} onChange={e=>setForm({...form,customer_id:e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all"/></div>
              <div><label className="text-xs font-semibold text-slate-500 block mb-1">Omschrijving</label><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all"/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-slate-500 block mb-1">Subtotaal (€) *</label><input type="number" step="0.01" required value={form.subtotal} onChange={e=>setForm({...form,subtotal:e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all"/></div>
                <div><label className="text-xs font-semibold text-slate-500 block mb-1">BTW % *</label><input type="number" step="0.01" required value={form.tax_rate} onChange={e=>setForm({...form,tax_rate:e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all"/></div>
              </div>
              <div><label className="text-xs font-semibold text-slate-500 block mb-1">Vervaldatum *</label><input type="date" required value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all"/></div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">Annuleren</button>
                <button type="submit" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all">Aanmaken</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
