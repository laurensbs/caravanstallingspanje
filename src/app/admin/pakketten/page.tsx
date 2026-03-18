'use client';
import { fmt, fmtDate } from "@/lib/format";

import { useState, useEffect, useCallback } from 'react';
import { Package, Plus, Pencil, Trash2, Check, X, Euro, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface ServicePackage {
  id: number; name: string; slug: string; category: string; description: string;
  price: number; price_type: string; is_active: boolean; sort_order: number;
  features: string[];
}

const CATEGORIES = [
  { value: 'stalling', label: 'Stalling' },
  { value: 'schoonmaak', label: 'Schoonmaak' },
  { value: 'onderhoud', label: 'Onderhoud' },
  { value: 'transport', label: 'Transport' },
  { value: 'verzekering', label: 'Verzekering' },
  { value: 'abonnement', label: 'VIP Abonnement' },
];

const PRICE_TYPES = [
  { value: 'eenmalig', label: 'Eenmalig' },
  { value: 'maandelijks', label: 'Per maand' },
  { value: 'jaarlijks', label: 'Per jaar' },
  { value: 'per_keer', label: 'Per keer' },
];

export default function DienstenPakkettenPage() {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ServicePackage | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', category: 'service', description: '', price: '', price_type: 'eenmalig', features: '' as string, sort_order: '0' });
  const [filterCat, setFilterCat] = useState('all');

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/packages?active=false', { credentials: 'include' });
    const data = await res.json();
    setPackages(data.packages || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const savePackage = async () => {
    const payload = {
      ...form,
      price: Number(form.price),
      sort_order: Number(form.sort_order),
      features: form.features.split('\n').filter(Boolean),
    };

    if (editing) {
      await fetch(`/api/admin/packages/${editing.id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/admin/packages', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setShowForm(false);
    setEditing(null);
    resetForm();
    fetchPackages();
  };

  const deletePackage = async (id: number) => {
    if (!confirm('Weet je zeker dat je dit pakket wilt verwijderen?')) return;
    await fetch(`/api/admin/packages/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchPackages();
  };

  const toggleActive = async (pkg: ServicePackage) => {
    await fetch(`/api/admin/packages/${pkg.id}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !pkg.is_active }),
    });
    fetchPackages();
  };

  const editPackage = (pkg: ServicePackage) => {
    setEditing(pkg);
    setForm({
      name: pkg.name,
      slug: pkg.slug,
      category: pkg.category,
      description: pkg.description || '',
      price: String(pkg.price),
      price_type: pkg.price_type,
      features: (pkg.features || []).join('\n'),
      sort_order: String(pkg.sort_order),
    });
    setShowForm(true);
  };

  const resetForm = () => setForm({ name: '', slug: '', category: 'service', description: '', price: '', price_type: 'eenmalig', features: '', sort_order: '0' });

  const filtered = filterCat === 'all' ? packages : packages.filter(p => p.category === filterCat);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-surface-dark">Diensten & Pakketten</h1>
          <p className="text-sm text-warm-gray/70 mt-1">{packages.length} pakketten • {packages.filter(p => p.is_active).length} actief</p>
        </div>
        <button onClick={() => { resetForm(); setEditing(null); setShowForm(true); }} className="bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
          <Plus size={16} /> Nieuw pakket
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setFilterCat('all')} className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${filterCat === 'all' ? 'bg-primary text-white' : 'bg-sand text-warm-gray hover:bg-sand-dark/30'}`}>Alle</button>
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setFilterCat(c.value)} className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${filterCat === c.value ? 'bg-primary text-white' : 'bg-sand text-warm-gray hover:bg-sand-dark/30'}`}>{c.label}</button>
        ))}
      </div>

      {/* Form modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing ? 'Pakket bewerken' : 'Nieuw pakket'}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-warm-gray block mb-1">Naam *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} className="w-full px-4 py-2.5 border border-sand-dark/30 rounded-xl text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-warm-gray block mb-1">Slug *</label>
                  <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full px-4 py-2.5 border border-sand-dark/30 rounded-xl text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-warm-gray block mb-1">Categorie</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 border border-sand-dark/30 rounded-xl text-sm outline-none focus:border-primary">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-warm-gray block mb-1">Prijstype</label>
                  <select value={form.price_type} onChange={e => setForm({ ...form, price_type: e.target.value })} className="w-full px-4 py-2.5 border border-sand-dark/30 rounded-xl text-sm outline-none focus:border-primary">
                    {PRICE_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-warm-gray block mb-1">Prijs (€) *</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2.5 border border-sand-dark/30 rounded-xl text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-warm-gray block mb-1">Sortering</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} className="w-full px-4 py-2.5 border border-sand-dark/30 rounded-xl text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-warm-gray block mb-1">Omschrijving</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 border border-sand-dark/30 rounded-xl text-sm outline-none focus:border-primary resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-warm-gray block mb-1">Features (1 per regel)</label>
                <textarea value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} rows={4} placeholder="Tweewekelijkse inspectie&#10;Bandenspanning controle&#10;Acculader dienst" className="w-full px-4 py-2.5 border border-sand-dark/30 rounded-xl text-sm outline-none focus:border-primary resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-5 py-2.5 rounded-xl text-sm font-medium text-warm-gray hover:bg-sand/40">Annuleren</button>
                <button onClick={savePackage} disabled={!form.name || !form.slug || !form.price} className="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 flex items-center gap-2">
                  <Check size={14} /> Opslaan
                </button>
              </div>
            </div>
      </Modal>

      {/* Packages grid */}
      {loading ? (
        <div className="text-center py-16"><div className="animate-spin w-8 h-8 border-2 border-warning border-t-transparent rounded-full mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-sand-dark/20 p-12 text-center">
          <Package size={48} className="text-warm-gray/40 mx-auto mb-4" />
          <p className="text-warm-gray/70">Geen pakketten gevonden</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(pkg => (
            <div key={pkg.id} className={`bg-surface rounded-2xl border p-6 transition-all hover:shadow-lg ${pkg.is_active ? 'border-sand-dark/20' : 'border-red-100 bg-danger/10/30'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pkg.is_active ? 'bg-accent/15 text-accent-dark' : 'bg-danger/15 text-danger'}`}>{pkg.is_active ? 'Actief' : 'Inactief'}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sand text-warm-gray ml-1">{CATEGORIES.find(c => c.value === pkg.category)?.label || pkg.category}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleActive(pkg)} className="p-1.5 rounded-lg hover:bg-sand-dark/20 text-warm-gray/70 hover:text-warm-gray transition-colors">
                    {pkg.is_active ? <ToggleRight size={16} className="text-accent" /> : <ToggleLeft size={16} />}
                  </button>
                  <button onClick={() => editPackage(pkg)} className="p-1.5 rounded-lg hover:bg-sand-dark/20 text-warm-gray/70 hover:text-warm-gray transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => deletePackage(pkg.id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-warm-gray/70 hover:text-danger transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="font-bold text-surface-dark text-lg">{pkg.name}</h3>
              {pkg.description && <p className="text-sm text-warm-gray/70 mt-1">{pkg.description}</p>}
              <div className="flex items-baseline gap-1 mt-3">
                <Euro size={14} className="text-warning" />
                <span className="text-2xl font-black text-warning">{fmt(Number(pkg.price))}</span>
                <span className="text-xs text-warm-gray/70">/ {PRICE_TYPES.find(p => p.value === pkg.price_type)?.label || pkg.price_type}</span>
              </div>
              {pkg.features && pkg.features.length > 0 && (
                <ul className="mt-4 space-y-1.5">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="text-xs text-warm-gray flex items-center gap-2">
                      <Tag size={10} className="text-warning flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
