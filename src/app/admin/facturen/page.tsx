'use client';
import { fmt, fmtDate, INVOICE_STATUS_COLORS } from "@/lib/format";

import { useState, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, Download, CheckSquare, Square } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import Modal from '@/components/ui/Modal';
import FilterBar, { type FilterConfig } from '@/components/admin/FilterBar';
import { toast } from 'sonner';

interface Invoice { id: number; invoice_number: string; customer_name: string; customer_email: string; description: string; subtotal: number; tax_amount: number; total: number; status: string; due_date: string; paid_date: string; payment_method: string; created_at: string; }
interface CustomerOption { id: number; first_name: string; last_name: string; email: string; }
interface ContractOption { id: number; contract_number: string; customer_id: number; monthly_rate: number; }

const FILTER_CONFIG: FilterConfig = {
  search: { placeholder: 'Zoek op klant, factuurnr, omschrijving...' },
  statuses: [
    { value: '', label: 'Alle' },
    { value: 'open', label: 'Open' },
    { value: 'verzonden', label: 'Verzonden' },
    { value: 'betaald', label: 'Betaald' },
    { value: 'achterstallig', label: 'Achterstallig' },
    { value: 'geannuleerd', label: 'Geannuleerd' },
  ],
  dateRange: { label: 'Vervaldatum' },
  sort: { options: [
    { value: 'created_at', label: 'Aangemaakt' },
    { value: 'due_date', label: 'Vervaldatum' },
    { value: 'total', label: 'Bedrag' },
    { value: 'customer_name', label: 'Klant' },
    { value: 'status', label: 'Status' },
  ] },
};

export default function FacturenPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const { items: invoices, total, page, setPage, loading, refetch: fetchData } = useAdminData<Invoice>({ endpoint: '/api/admin/invoices', dataKey: 'invoices', params: filters });
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [form, setForm] = useState({ customer_id: '', contract_id: '', description: '', subtotal: '', tax_rate: '21', due_date: '' });
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => { setFilters({}); setPage(1); };

  const toggleSelect = (id: number) => {
    setSelected(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };
  const toggleAll = () => {
    if (selected.size === invoices.length) setSelected(new Set());
    else setSelected(new Set(invoices.map(i => i.id)));
  };

  const bulkMarkPaid = async () => {
    const ids = Array.from(selected);
    await Promise.all(ids.map(id =>
      fetch(`/api/admin/invoices/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'betaald', payment_method: 'handmatig' }), credentials: 'include' })
    ));
    setSelected(new Set());
    fetchData();
    toast.success(`${ids.length} facturen als betaald gemarkeerd`);
  };

  const exportCSV = useCallback(() => {
    const rows = invoices.filter(i => selected.size === 0 || selected.has(i.id));
    const headers = ['Factuurnr', 'Klant', 'Email', 'Omschrijving', 'Subtotaal', 'BTW', 'Totaal', 'Status', 'Vervaldatum', 'Betaaldatum'];
    const csv = [headers.join(';'), ...rows.map(i => [i.invoice_number, i.customer_name, i.customer_email, i.description || '', i.subtotal, i.tax_amount, i.total, i.status, i.due_date?.split('T')[0] || '', i.paid_date?.split('T')[0] || ''].join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `facturen-export-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }, [invoices, selected]);

  const openForm = async () => {
    const [custRes, contRes] = await Promise.all([
      fetch('/api/admin/customers?limit=500', { credentials: 'include' }),
      fetch('/api/admin/contracts?status=actief', { credentials: 'include' }),
    ]);
    setCustomers((await custRes.json()).customers || []);
    setContracts((await contRes.json()).contracts || []);
    setForm({ customer_id: '', contract_id: '', description: '', subtotal: '', tax_rate: '21', due_date: '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = parseFloat(form.subtotal);
    const taxRate = parseFloat(form.tax_rate);
    const taxAmount = subtotal * (taxRate / 100);
    await fetch('/api/admin/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, subtotal, tax_rate: taxRate, tax_amount: taxAmount, total: subtotal + taxAmount }), credentials: 'include' });
    setShowForm(false); fetchData(); toast.success('Factuur aangemaakt');
  };

  const markPaid = async (id: number) => {
    await fetch(`/api/admin/invoices/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'betaald', payment_method: 'handmatig' }), credentials: 'include' });
    fetchData(); toast.success('Factuur als betaald gemarkeerd');
  };

  const filteredContracts = form.customer_id ? contracts.filter(c => String(c.customer_id) === form.customer_id) : contracts;
  const totalPages = Math.ceil(total / 50);
  const totalOpen = invoices.filter(i => i.status === 'open' || i.status === 'verzonden').reduce((s, i) => s + Number(i.total), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-black text-surface-dark">Facturen</h1><p className="text-sm text-warm-gray/70 mt-1">{total} facturen · Openstaand: {fmt(totalOpen)}</p></div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-sand/40 hover:bg-sand-dark/20 text-warm-gray rounded-xl text-sm font-medium border border-sand-dark/20 transition-all">
            <Download size={14} /> CSV {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
          <button onClick={openForm} className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"><Plus size={16} /> Nieuwe factuur</button>
        </div>
      </div>

      <FilterBar config={FILTER_CONFIG} values={filters} onChange={updateFilter} onReset={resetFilters} />

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-primary/[0.06] rounded-xl px-4 py-3 border border-primary/20">
          <span className="text-sm font-semibold text-primary">{selected.size} geselecteerd</span>
          <button onClick={bulkMarkPaid} className="text-xs font-semibold text-accent hover:text-accent-dark flex items-center gap-1 transition-colors"><CheckCircle size={12} /> Markeer betaald</button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-warm-gray/70 hover:text-warm-gray underline ml-auto">Deselecteren</button>
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-sand-dark/20 overflow-hidden">
        <div className="table-responsive">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-sand/40 border-b border-sand-dark/20"><tr>
            <th className="w-10 px-4 py-3.5">
              <button onClick={toggleAll} className="text-warm-gray/50 hover:text-warm-gray transition-colors" aria-label="Alles selecteren">
                {selected.size === invoices.length && invoices.length > 0 ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
              </button>
            </th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Factuur</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Klant</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Omschrijving</th>
            <th className="text-right px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Bedrag</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Vervaldatum</th>
            <th className="text-center px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Status</th>
            <th className="text-right px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Acties</th>
          </tr></thead>
          <tbody className="divide-y divide-sand-dark/10">
            {loading ? <tr><td colSpan={8} className="px-4 py-8 text-center text-warm-gray/70">Laden...</td></tr> :
            invoices.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-warm-gray/70">Geen facturen gevonden</td></tr> :
            invoices.map(i => {
              const overdue = !i.paid_date && new Date(i.due_date) < new Date();
              const displayStatus = overdue && i.status !== 'betaald' ? 'achterstallig' : i.status;
              return (
                <tr key={i.id} className={`hover:bg-sand/30 transition-colors ${selected.has(i.id) ? 'bg-primary/[0.03]' : ''}`}>
                  <td className="w-10 px-4 py-3">
                    <button onClick={() => toggleSelect(i.id)} className="text-warm-gray/50 hover:text-warm-gray transition-colors" aria-label={`Selecteer ${i.invoice_number}`}>
                      {selected.has(i.id) ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-warm-gray">{i.invoice_number}</td>
                  <td className="px-4 py-3 text-surface-dark">{i.customer_name}</td>
                  <td className="px-4 py-3 text-warm-gray/70 text-xs max-w-[200px] truncate">{i.description || '-'}</td>
                  <td className="px-4 py-3 text-right font-medium text-surface-dark">{fmt(Number(i.total))}</td>
                  <td className="px-4 py-3 text-xs text-warm-gray">{fmtDate(i.due_date)} {overdue && <AlertTriangle size={12} className="inline text-danger ml-1" />}</td>
                  <td className="px-4 py-3 text-center"><span className={`text-xs font-medium px-2 py-1 rounded-full ${INVOICE_STATUS_COLORS[displayStatus] || 'bg-sand'}`}>{displayStatus}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`/api/admin/invoices/${i.id}/pdf`} target="_blank" rel="noopener noreferrer" className="text-xs text-ocean font-medium flex items-center gap-1 hover:text-ocean-dark transition-colors"><Download size={12} /> PDF</a>
                      {i.status !== 'betaald' && i.status !== 'geannuleerd' && (
                        <button onClick={() => markPaid(i.id)} className="text-xs text-accent font-medium flex items-center gap-1 hover:text-accent-dark transition-colors"><CheckCircle size={12} /> Betaald</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-sand-dark/20"><p className="text-xs text-warm-gray/70">Pagina {page}/{totalPages}</p><div className="flex gap-1"><button disabled={page<=1} onClick={()=>setPage(page-1)} className="p-1.5 rounded-lg hover:bg-sand-dark/20 disabled:opacity-30 transition-colors" aria-label="Vorige pagina"><ChevronLeft size={16} className="text-warm-gray/70"/></button><button disabled={page>=totalPages} onClick={()=>setPage(page+1)} className="p-1.5 rounded-lg hover:bg-sand-dark/20 disabled:opacity-30 transition-colors" aria-label="Volgende pagina"><ChevronRight size={16} className="text-warm-gray/70"/></button></div></div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nieuwe factuur">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-warm-gray block mb-1">Klant *</label>
            <select required value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value, contract_id: ''})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
              <option value="">Selecteer klant...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({c.email})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-warm-gray block mb-1">Contract (optioneel)</label>
            <select value={form.contract_id} onChange={e => { const ct = contracts.find(c => String(c.id) === e.target.value); setForm({...form, contract_id: e.target.value, subtotal: ct ? String(ct.monthly_rate) : form.subtotal, description: ct ? `Stalling ${ct.contract_number}` : form.description }); }} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
              <option value="">Geen contract</option>
              {filteredContracts.map(c => <option key={c.id} value={c.id}>{c.contract_number} (€{c.monthly_rate}/mnd)</option>)}
            </select>
          </div>
          <div><label className="text-xs font-semibold text-warm-gray block mb-1">Omschrijving</label><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-warm-gray block mb-1">Subtotaal (€) *</label><input type="number" step="0.01" required value={form.subtotal} onChange={e=>setForm({...form,subtotal:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"/></div>
            <div><label className="text-xs font-semibold text-warm-gray block mb-1">BTW % *</label><input type="number" step="0.01" required value={form.tax_rate} onChange={e=>setForm({...form,tax_rate:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"/></div>
          </div>
          {form.subtotal && <p className="text-xs text-warm-gray/70">Totaal incl. BTW: {fmt(parseFloat(form.subtotal) * (1 + parseFloat(form.tax_rate) / 100))}</p>}
          <div><label className="text-xs font-semibold text-warm-gray block mb-1">Vervaldatum *</label><input type="date" required value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"/></div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2.5 text-sm text-warm-gray/70 hover:bg-sand-dark/20 rounded-xl transition-colors">Annuleren</button>
            <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-primary/20 transition-all">Aanmaken</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
