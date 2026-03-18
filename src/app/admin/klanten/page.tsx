'use client';

import { useState } from 'react';
import { Search, Plus, X, ChevronLeft, ChevronRight, Edit2, Eye, Mail, Phone } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import Modal from '@/components/ui/Modal';

interface Customer {
  id: number; customer_number: string; first_name: string; last_name: string; email: string;
  phone: string; address: string; city: string; postal_code: string; country: string;
  company_name: string; notes: string; created_at: string;
}

export default function KlantenPage() {
  const [search, setSearch] = useState('');
  const { items: customers, total, page, setPage, loading, refetch: fetchCustomers } = useAdminData<Customer>({ endpoint: '/api/admin/customers', dataKey: 'customers', params: { search } });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', address: '', city: '', postal_code: '', country: 'Nederland', company_name: '', notes: '' });
  const limit = 50;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const body = editing ? { ...form, id: editing.id } : form;
    await fetch('/api/admin/customers', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'include' });
    setShowForm(false); setEditing(null);
    setForm({ first_name: '', last_name: '', email: '', phone: '', address: '', city: '', postal_code: '', country: 'Nederland', company_name: '', notes: '' });
    fetchCustomers();
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ first_name: c.first_name, last_name: c.last_name, email: c.email, phone: c.phone || '', address: c.address || '', city: c.city || '', postal_code: c.postal_code || '', country: c.country || 'Nederland', company_name: c.company_name || '', notes: c.notes || '' });
    setShowForm(true);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-surface-dark">Klanten</h1>
          <p className="text-sm text-warm-gray/70 mt-1">{total.toLocaleString('nl-NL')} klanten totaal</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ first_name: '', last_name: '', email: '', phone: '', address: '', city: '', postal_code: '', country: 'Nederland', company_name: '', notes: '' }); setShowForm(true); }} className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
          <Plus size={16} /> Nieuwe klant
        </button>
      </div>

      {/* Search */}
      <div className="bg-surface rounded-2xl border border-sand-dark/20 mb-6 p-4">
        <div className="flex items-center gap-2 bg-sand/40 rounded-xl px-3.5 py-2.5 border border-sand-dark/20">
          <Search size={15} className="text-warm-gray/50" />
          <input placeholder="Zoek op naam, email, klantnummer..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="bg-transparent text-sm outline-none flex-1 text-warm-gray placeholder:text-warm-gray/50" />
          {search && <button onClick={() => setSearch('')} aria-label="Zoekopdracht wissen"><X size={14} className="text-warm-gray/70" /></button>}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-sand-dark/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand/40 border-b border-sand-dark/20">
              <tr>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Klantnr</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Naam</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Contact</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Plaats</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Land</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-dark/10">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-warm-gray/70">Laden...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-warm-gray/70">Geen klanten gevonden</td></tr>
              ) : customers.map(c => (
                <tr key={c.id} className="hover:bg-sand/30 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs text-warm-gray/70">{c.customer_number}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-surface-dark">{c.first_name} {c.last_name}</p>
                    {c.company_name && <p className="text-xs text-warm-gray/70">{c.company_name}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-xs text-warm-gray"><Mail size={12} /> {c.email}</div>
                    {c.phone && <div className="flex items-center gap-1 text-xs text-warm-gray/70 mt-0.5"><Phone size={12} /> {c.phone}</div>}
                  </td>
                  <td className="px-4 py-3.5 text-warm-gray">{c.city || '-'}</td>
                  <td className="px-4 py-3.5 text-warm-gray">{c.country}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-sand-dark/20 rounded-lg text-warm-gray/70 hover:text-warm-gray transition-colors" title="Bewerken"><Edit2 size={14} /></button>
                      <a href={`/admin/klanten/${c.id}`} className="p-1.5 hover:bg-sand-dark/20 rounded-lg text-warm-gray/70 hover:text-warm-gray transition-colors" title="Details"><Eye size={14} /></a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-sand-dark/20">
            <p className="text-xs text-warm-gray/70">Pagina {page} van {totalPages}</p>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-1.5 rounded-lg hover:bg-sand-dark/20 disabled:opacity-30 text-warm-gray/70 transition-colors" aria-label="Vorige pagina"><ChevronLeft size={16} /></button>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="p-1.5 rounded-lg hover:bg-sand-dark/20 disabled:opacity-30 text-warm-gray/70 transition-colors" aria-label="Volgende pagina"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Form modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Klant bewerken' : 'Nieuwe klant'}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-warm-gray/70 block mb-1.5">Voornaam *</label><input required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-3.5 py-2.5 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
                <div><label className="text-xs font-semibold text-warm-gray/70 block mb-1.5">Achternaam *</label><input required value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-3.5 py-2.5 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
              </div>
              <div><label className="text-xs font-semibold text-warm-gray/70 block mb-1.5">E-mail *</label><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-3.5 py-2.5 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
              <div><label className="text-xs font-semibold text-warm-gray/70 block mb-1.5">Telefoon</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-3.5 py-2.5 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
              <div><label className="text-xs font-semibold text-warm-gray/70 block mb-1.5">Adres</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-3.5 py-2.5 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-warm-gray/70 block mb-1.5">Postcode</label><input value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-3.5 py-2.5 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
                <div><label className="text-xs font-semibold text-warm-gray/70 block mb-1.5">Plaats</label><input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-3.5 py-2.5 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
              </div>
              <div><label className="text-xs font-semibold text-warm-gray/70 block mb-1.5">Land</label><input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-3.5 py-2.5 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
              <div><label className="text-xs font-semibold text-warm-gray/70 block mb-1.5">Bedrijfsnaam</label><input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-3.5 py-2.5 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
              <div><label className="text-xs font-semibold text-warm-gray/70 block mb-1.5">Notities</label><textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-3.5 py-2.5 text-sm bg-sand/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm font-medium text-warm-gray/70 hover:text-warm-gray hover:bg-sand/40 rounded-xl transition-all">Annuleren</button>
                <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-primary/20 transition-all">Opslaan</button>
              </div>
            </form>
      </Modal>
    </div>
  );
}
