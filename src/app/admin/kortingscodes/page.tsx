'use client';
import { useState, useEffect } from 'react';
import { Plus, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { fmtDate, fmt } from '@/lib/format';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';

interface DiscountCode {
  id: number; code: string; description: string; type: string; value: number;
  min_months: number; max_uses: number | null; used_count: number;
  is_active: boolean; valid_from: string; valid_until: string; created_at: string;
}

export default function KortingscodesPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', description: '', type: 'percentage', value: '', min_months: '1', max_uses: '', valid_from: '', valid_until: '' });

  const fetchCodes = async () => {
    const res = await fetch('/api/admin/discount-codes', { credentials: 'include' });
    const data = await res.json();
    setCodes(data.codes || []);
    setTotal(data.total || 0);
  };

  useEffect(() => { fetchCodes(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/discount-codes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, value: parseFloat(form.value), min_months: parseInt(form.min_months) || 1, max_uses: form.max_uses ? parseInt(form.max_uses) : null }),
      credentials: 'include',
    });
    setShowForm(false); fetchCodes();
    toast.success('Kortingscode aangemaakt');
  };

  const toggleActive = async (id: number, active: boolean) => {
    await fetch(`/api/admin/discount-codes/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: active }), credentials: 'include',
    });
    fetchCodes();
    toast.success(active ? 'Code geactiveerd' : 'Code gedeactiveerd');
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'CS-';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setForm({ ...form, code });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-gray-900">Kortingscodes</h1><p className="text-sm text-gray-500/70 mt-1">{total} codes</p></div>
        <button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary-light text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"><Plus size={16} /> Nieuwe code</button>
      </div>

      <div className="bg-surface rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200"><tr>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Code</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Omschrijving</th>
            <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Type</th>
            <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Waarde</th>
            <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Gebruik</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Geldig</th>
            <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Status</th>
            <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Acties</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {codes.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500/70">Geen kortingscodes</td></tr>
            ) : codes.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-primary">{c.code}</td>
                <td className="px-4 py-3 text-gray-500">{c.description || '-'}</td>
                <td className="px-4 py-3 text-center"><span className="text-xs bg-ocean/10 text-ocean px-2 py-1 rounded-full">{c.type === 'percentage' ? '%' : '€'}</span></td>
                <td className="px-4 py-3 text-right font-medium">{c.type === 'percentage' ? `${c.value}%` : fmt(c.value)}</td>
                <td className="px-4 py-3 text-center text-xs text-gray-500">{c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{c.valid_from ? fmtDate(c.valid_from) : '∞'} – {c.valid_until ? fmtDate(c.valid_until) : '∞'}</td>
                <td className="px-4 py-3 text-center"><span className={`text-xs font-medium px-2 py-1 rounded-full ${c.is_active ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-500/50'}`}>{c.is_active ? 'Actief' : 'Inactief'}</span></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => toggleActive(c.id, !c.is_active)} className="text-gray-500/50 hover:text-gray-500 transition-colors" title={c.is_active ? 'Deactiveren' : 'Activeren'}>
                    {c.is_active ? <ToggleRight size={20} className="text-accent" /> : <ToggleLeft size={20} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nieuwe kortingscode">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Code *</label>
            <div className="flex gap-2">
              <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="bv. ZOMER2025" className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 font-mono focus:ring-2 focus:ring-primary/20 outline-none" />
              <button type="button" onClick={generateCode} className="px-3 py-2.5 bg-gray-100 hover:bg-gray-300/20 rounded-xl text-xs font-semibold text-gray-500 transition-colors">Genereer</button>
            </div>
          </div>
          <div><label className="text-xs font-semibold text-gray-500 block mb-1">Omschrijving</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Type *</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Vast bedrag (€)</option>
              </select>
            </div>
            <div><label className="text-xs font-semibold text-gray-500 block mb-1">Waarde *</label><input type="number" step="0.01" required value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder={form.type === 'percentage' ? 'bv. 10' : 'bv. 25.00'} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-500 block mb-1">Min. maanden</label><input type="number" value={form.min_months} onChange={e => setForm({ ...form, min_months: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none" /></div>
            <div><label className="text-xs font-semibold text-gray-500 block mb-1">Max. gebruik (leeg = onbeperkt)</label><input type="number" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-500 block mb-1">Geldig vanaf</label><input type="date" value={form.valid_from} onChange={e => setForm({ ...form, valid_from: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none" /></div>
            <div><label className="text-xs font-semibold text-gray-500 block mb-1">Geldig tot</label><input type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none" /></div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-gray-500/70 hover:bg-gray-300/20 rounded-xl transition-colors">Annuleren</button>
            <button type="submit" className="bg-primary hover:bg-primary-light text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-primary/20 transition-all">Aanmaken</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
