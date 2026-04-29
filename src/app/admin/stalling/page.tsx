'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Mail, Phone, Calendar, Trash2, Warehouse, Plus, Pencil,
} from 'lucide-react';
import { Button, Badge, Skeleton, Select, Input } from '@/components/ui';
import PageHeader from '@/components/admin/PageHeader';
import Drawer from '@/components/Drawer';

type Entry = {
  id: number;
  type: 'binnen' | 'buiten' | string;
  name: string;
  email: string;
  phone: string | null;
  start_date: string;
  end_date: string | null;
  registration: string | null;
  brand: string | null;
  model: string | null;
  length: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: 'controleren', label: 'Controleren', tone: 'warning' as const },
  { value: 'akkoord',     label: 'Akkoord',     tone: 'accent'  as const },
  { value: 'betaald',     label: 'Betaald',     tone: 'success' as const },
  { value: 'afgewezen',   label: 'Afgewezen',   tone: 'danger'  as const },
];

const empty = {
  type: 'buiten' as 'binnen' | 'buiten',
  name: '', email: '', phone: '', start_date: '', end_date: '',
  registration: '', brand: '', model: '', length: '', notes: '',
  status: 'akkoord',
};

function fmtDate(s: string | null | undefined): string {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusTone(status: string): 'warning' | 'success' | 'accent' | 'danger' | 'neutral' {
  return STATUS_OPTIONS.find((s) => s.value === status)?.tone ?? 'neutral';
}

export default function StallingAdminPage() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [filter, setFilter] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter) params.set('status', filter);
      const r = await fetch(`/api/admin/stalling?${params}`, { credentials: 'include' });
      const d = await r.json();
      setEntries(d.entries || []);
    } catch {
      setEntries([]);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(empty);
    setDrawerOpen(true);
  };

  const openEdit = (e: Entry) => {
    setEditingId(e.id);
    setForm({
      type: (e.type === 'binnen' ? 'binnen' : 'buiten'),
      name: e.name,
      email: e.email,
      phone: e.phone || '',
      start_date: e.start_date ? e.start_date.slice(0, 10) : '',
      end_date: e.end_date ? e.end_date.slice(0, 10) : '',
      registration: e.registration || '',
      brand: e.brand || '',
      model: e.model || '',
      length: e.length || '',
      notes: e.notes || '',
      status: e.status,
    });
    setDrawerOpen(true);
  };

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/stalling/${editingId}` : '/api/admin/stalling';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Opslaan mislukt');
        return;
      }
      toast.success(editingId ? 'Stalling bijgewerkt' : 'Stalling toegevoegd');
      setDrawerOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Stalling-aanvraag verwijderen?')) return;
    const res = await fetch(`/api/admin/stalling/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) { toast.error('Verwijderen mislukt'); return; }
    toast.success('Verwijderd');
    load();
  };

  const setStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/admin/stalling/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    if (!res.ok) { toast.error('Status wijzigen mislukt'); return; }
    toast.success('Status bijgewerkt');
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Operatie"
        title="Stalling"
        description="Stalling-aanvragen — binnen en buiten."
        actions={
          <div className="flex gap-2 items-center">
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="min-w-[160px]">
              <option value="">Alle statussen</option>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
            <Button onClick={openCreate}>
              <Plus size={14} /> Stalling toevoegen
            </Button>
          </div>
        }
      />

      {entries === null ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" delayMs={i * 40} />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="card-surface p-12 text-center">
          <div className="w-12 h-12 rounded-[var(--radius-2xl)] bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
            <Warehouse size={18} className="text-text-subtle" />
          </div>
          <p className="text-sm text-text">
            {filter ? `Geen stalling-aanvragen met status "${filter}"` : 'Nog geen stalling-aanvragen'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {entries.map((e) => (
              <motion.li
                key={e.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="card-surface p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-text">{e.name}</h3>
                      <Badge tone={statusTone(e.status)}>
                        {STATUS_OPTIONS.find((s) => s.value === e.status)?.label || e.status}
                      </Badge>
                      <Badge tone="neutral" className="capitalize">{e.type}</Badge>
                    </div>
                    <p className="text-[11px] text-text-muted mt-1">
                      Aangemeld op {fmtDate(e.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0 items-center">
                    <Select value={e.status} onChange={(ev) => setStatus(e.id, ev.target.value)} className="min-w-[140px]">
                      {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </Select>
                    <button
                      onClick={() => openEdit(e)}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-[var(--radius-md)] text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                      aria-label="Bewerken"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => remove(e.id)}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-[var(--radius-md)] text-text-muted hover:text-danger hover:bg-danger-soft transition-colors"
                      aria-label="Verwijderen"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
                  <span className="flex items-center gap-1.5 text-text">
                    <Calendar size={12} className="text-text-subtle shrink-0" />
                    Vanaf {fmtDate(e.start_date)}{e.end_date ? ` · t/m ${fmtDate(e.end_date)}` : ''}
                  </span>
                  <a href={`mailto:${e.email}`} className="flex items-center gap-1.5 text-text hover:text-text">
                    <Mail size={12} className="text-text-subtle shrink-0" /> {e.email}
                  </a>
                  {e.phone && (
                    <a href={`tel:${e.phone}`} className="flex items-center gap-1.5 text-text hover:text-text">
                      <Phone size={12} className="text-text-subtle shrink-0" /> {e.phone}
                    </a>
                  )}
                </div>
                {(e.registration || e.brand || e.model || e.length) && (
                  <p className="text-[12px] text-text-muted mt-3">
                    Caravan: {[e.brand, e.model, e.registration, e.length ? `${e.length}m` : null].filter(Boolean).join(' · ') || '—'}
                  </p>
                )}
                {e.notes && (
                  <p className="text-[12px] text-text-muted italic mt-3 pt-3 border-t border-border">{e.notes}</p>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingId ? 'Stalling bewerken' : 'Nieuwe stalling'} width={560}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text mb-1.5">Type <span className="text-text-subtle">*</span></label>
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'binnen' | 'buiten' })}>
                <option value="binnen">Binnen</option>
                <option value="buiten">Buiten</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text mb-1.5">Status</label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </div>
            <Input label="Naam" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="E-mail" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Telefoon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Startdatum" type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <Input label="Einddatum" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            <Input label="Kenteken" value={form.registration} onChange={(e) => setForm({ ...form, registration: e.target.value })} />
            <Input label="Merk" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            <Input label="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            <Input label="Lengte (m)" value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text mb-1.5">Notities</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setDrawerOpen(false)}>Annuleren</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Bezig…' : (editingId ? 'Opslaan' : 'Toevoegen')}</Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
