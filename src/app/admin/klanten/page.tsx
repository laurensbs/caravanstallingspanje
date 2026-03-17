'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, ChevronLeft, ChevronRight, Edit2, Eye, Mail, Phone } from 'lucide-react';

interface Customer {
  id: number; customer_number: string; first_name: string; last_name: string; email: string;
  phone: string; address: string; city: string; postal_code: string; country: string;
  company_name: string; notes: string; created_at: string;
}

export default function KlantenPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', address: '', city: '', postal_code: '', country: 'Nederland', company_name: '', notes: '' });
  const limit = 50;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/customers?${params}`, { credentials: 'include' });
      const data = await res.json();
      setCustomers(data.customers || []);
      setTotal(data.total || 0);
    } catch { /* */ }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

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
          <h1 className="text-2xl font-black text-slate-900">Klanten</h1>
          <p className="text-sm text-slate-400 mt-1">{total.toLocaleString('nl-NL')} klanten totaal</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ first_name: '', last_name: '', email: '', phone: '', address: '', city: '', postal_code: '', country: 'Nederland', company_name: '', notes: '' }); setShowForm(true); }} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all">
          <Plus size={16} /> Nieuwe klant
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-100 mb-6 p-4">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-100">
          <Search size={15} className="text-slate-300" />
          <input placeholder="Zoek op naam, email, klantnummer..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="bg-transparent text-sm outline-none flex-1 text-slate-600 placeholder:text-slate-300" />
          {search && <button onClick={() => setSearch('')}><X size={14} className="text-slate-400" /></button>}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Klantnr</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Naam</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Plaats</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Land</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Laden...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Geen klanten gevonden</td></tr>
              ) : customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-400">{c.customer_number}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-800">{c.first_name} {c.last_name}</p>
                    {c.company_name && <p className="text-xs text-slate-400">{c.company_name}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-xs text-slate-500"><Mail size={12} /> {c.email}</div>
                    {c.phone && <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5"><Phone size={12} /> {c.phone}</div>}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{c.city || '-'}</td>
                  <td className="px-4 py-3.5 text-slate-500">{c.country}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors" title="Bewerken"><Edit2 size={14} /></button>
                      <a href={`/admin/klanten/${c.id}`} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors" title="Details"><Eye size={14} /></a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">Pagina {page} van {totalPages}</p>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-400 transition-colors"><ChevronLeft size={16} /></button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-400 transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{editing ? 'Klant bewerken' : 'Nieuwe klant'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-slate-400 block mb-1.5">Voornaam *</label><input required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all" /></div>
                <div><label className="text-xs font-semibold text-slate-400 block mb-1.5">Achternaam *</label><input required value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all" /></div>
              </div>
              <div><label className="text-xs font-semibold text-slate-400 block mb-1.5">E-mail *</label><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all" /></div>
              <div><label className="text-xs font-semibold text-slate-400 block mb-1.5">Telefoon</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all" /></div>
              <div><label className="text-xs font-semibold text-slate-400 block mb-1.5">Adres</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-slate-400 block mb-1.5">Postcode</label><input value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all" /></div>
                <div><label className="text-xs font-semibold text-slate-400 block mb-1.5">Plaats</label><input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all" /></div>
              </div>
              <div><label className="text-xs font-semibold text-slate-400 block mb-1.5">Land</label><input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all" /></div>
              <div><label className="text-xs font-semibold text-slate-400 block mb-1.5">Bedrijfsnaam</label><input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all" /></div>
              <div><label className="text-xs font-semibold text-slate-400 block mb-1.5">Notities</label><textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all" /></div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">Annuleren</button>
                <button type="submit" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all">Opslaan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
