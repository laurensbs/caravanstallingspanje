'use client';

import { useState, useCallback } from 'react';
import { Search, Plus, X, ChevronLeft, ChevronRight, Edit2, Eye, Mail, Phone, Download, CheckSquare, Square, Filter } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import Modal from '@/components/ui/Modal';
import { useAdminI18n } from '@/lib/admin-i18n';

interface Customer {
  id: number; customer_number: string; first_name: string; last_name: string; email: string;
  phone: string; address: string; city: string; postal_code: string; country: string;
  company_name: string; notes: string; created_at: string;
}

export default function KlantenPage() {
  const { t } = useAdminI18n();
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const { items: customers, total, page, setPage, loading, refetch: fetchCustomers } = useAdminData<Customer>({ endpoint: '/api/admin/customers', dataKey: 'customers', params: { search, country: countryFilter } });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', address: '', city: '', postal_code: '', country: 'Nederland', company_name: '', notes: '' });
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const limit = 50;

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === customers.length) setSelected(new Set());
    else setSelected(new Set(customers.map(c => c.id)));
  };

  const exportCSV = useCallback(() => {
    const rows = customers.filter(c => selected.size === 0 || selected.has(c.id));
    const headers = [t('Klantnr'), t('Voornaam'), t('Achternaam'), t('Email'), t('Telefoon'), t('Adres'), t('Postcode'), t('Plaats'), t('Land'), t('Bedrijf')];
    const csv = [headers.join(';'), ...rows.map(c => [c.customer_number, c.first_name, c.last_name, c.email, c.phone || '', c.address || '', c.postal_code || '', c.city || '', c.country || '', c.company_name || ''].join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `klanten-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [customers, selected]);

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
          <h1 className="text-2xl font-bold text-gray-900">{t('Klanten')}</h1>
          <p className="text-sm text-gray-500/70 mt-1">{total.toLocaleString('nl-NL')} {t('klanten totaal')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-300/20 text-gray-500 rounded-xl text-sm font-medium border border-gray-200 transition-all">
            <Download size={14} /> CSV {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
          <button onClick={() => { setEditing(null); setForm({ first_name: '', last_name: '', email: '', phone: '', address: '', city: '', postal_code: '', country: 'Nederland', company_name: '', notes: '' }); setShowForm(true); }} className="bg-primary hover:bg-primary-light text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
            <Plus size={16} /> {t('Nieuwe klant')}
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-surface rounded-2xl border border-gray-200 mb-6 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3.5 py-2.5 border border-gray-200 flex-1 min-w-[200px]">
            <Search size={15} className="text-gray-500/50" />
            <input placeholder={t('Zoek op naam, email, klantnummer...')} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="bg-transparent text-sm outline-none flex-1 text-gray-500 placeholder:text-gray-500/50" />
            {search && <button onClick={() => setSearch('')} aria-label={t('Zoekopdracht wissen')}><X size={14} className="text-gray-500/70" /></button>}
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-500/50" />
            <select value={countryFilter} onChange={e => { setCountryFilter(e.target.value); setPage(1); }} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 outline-none">
              <option value="">{t('Alle landen')}</option>
              <option value="NL">{t('Nederland')}</option>
              <option value="BE">{t('België')}</option>
              <option value="DE">{t('Duitsland')}</option>
              <option value="ES">{t('Spanje')}</option>
            </select>
          </div>
        </div>
        {selected.size > 0 && (
          <div className="mt-3 flex items-center gap-3 bg-primary/[0.06] rounded-xl px-4 py-2.5 border border-primary/20">
            <span className="text-sm font-semibold text-primary">{selected.size} {t('geselecteerd')}</span>
            <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500/70 hover:text-gray-500 underline">{t('Deselecteren')}</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-10 px-4 py-3.5">
                  <button onClick={toggleAll} className="text-gray-500/50 hover:text-gray-500 transition-colors" aria-label={t('Alles selecteren')}>
                    {selected.size === customers.length && customers.length > 0 ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                  </button>
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">{t('Klantnr')}</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">{t('Naam')}</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">{t('Contact')}</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">{t('Plaats')}</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">{t('Land')}</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">{t('Acties')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500/70">{t('Laden...')}</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500/70">{t('Geen klanten gevonden')}</td></tr>
              ) : customers.map(c => (
                <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${selected.has(c.id) ? 'bg-primary/[0.03]' : ''}`}>
                  <td className="w-10 px-4 py-3.5">
                    <button onClick={() => toggleSelect(c.id)} className="text-gray-500/50 hover:text-gray-500 transition-colors" aria-label={`${t('Selecteer')} ${c.first_name} ${c.last_name}`}>
                      {selected.has(c.id) ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-gray-500/70">{c.customer_number}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-gray-900">{c.first_name} {c.last_name}</p>
                    {c.company_name && <p className="text-xs text-gray-500/70">{c.company_name}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-xs text-gray-500"><Mail size={12} /> {c.email}</div>
                    {c.phone && <div className="flex items-center gap-1 text-xs text-gray-500/70 mt-0.5"><Phone size={12} /> {c.phone}</div>}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500">{c.city || '-'}</td>
                  <td className="px-4 py-3.5 text-gray-500">{c.country}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gray-300/20 rounded-lg text-gray-500/70 hover:text-gray-500 transition-colors" title={t('Bewerken')}><Edit2 size={14} /></button>
                      <a href={`/admin/klanten/${c.id}`} className="p-1.5 hover:bg-gray-300/20 rounded-lg text-gray-500/70 hover:text-gray-500 transition-colors" title={t('Details')}><Eye size={14} /></a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-xs text-gray-500/70">{t('Pagina')} {page} {t('van')} {totalPages}</p>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-1.5 rounded-lg hover:bg-gray-300/20 disabled:opacity-30 text-gray-500/70 transition-colors" aria-label={t('Vorige pagina')}><ChevronLeft size={16} /></button>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="p-1.5 rounded-lg hover:bg-gray-300/20 disabled:opacity-30 text-gray-500/70 transition-colors" aria-label={t('Volgende pagina')}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Form modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? t('Klant bewerken') : t('Nieuwe klant')}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">{t('Voornaam')} *</label><input required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
                <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">{t('Achternaam')} *</label><input required value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
              </div>
              <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">{t('E-mail')} *</label><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
              <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">{t('Telefoon')}</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
              <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">{t('Adres')}</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">{t('Postcode')}</label><input value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
                <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">{t('Plaats')}</label><input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
              </div>
              <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">{t('Land')}</label><input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
              <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">{t('Bedrijfsnaam')}</label><input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
              <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">{t('Notities')}</label><textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm font-medium text-gray-500/70 hover:text-gray-500 hover:bg-gray-50 rounded-xl transition-all">{t('Annuleren')}</button>
                <button type="submit" className="bg-primary hover:bg-primary-light text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-primary/20 transition-all">{t('Opslaan')}</button>
              </div>
            </form>
      </Modal>
    </div>
  );
}
