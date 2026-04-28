'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button, Input, Textarea, Skeleton, Badge } from '@/components/ui';
import PageHeader from '@/components/admin/PageHeader';
import Drawer from '@/components/Drawer';
import ConfirmDialog from '@/components/ConfirmDialog';

type Service = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price_eur: string;
  sort_order: number;
  active: boolean;
};

const empty = { slug: '', name: '', description: '', price_eur: '', sort_order: '100', active: true };

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function formatEur(eur: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(eur);
}

export default function ServicesAdminPage() {
  const [items, setItems] = useState<Service[] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/services', { credentials: 'include' });
      const d = await r.json();
      setItems(d.services || []);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(empty);
    setDrawerOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditingId(s.id);
    setForm({
      slug: s.slug,
      name: s.name,
      description: s.description || '',
      price_eur: String(Number(s.price_eur)),
      sort_order: String(s.sort_order),
      active: s.active,
    });
    setDrawerOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(form.price_eur.replace(',', '.'));
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      toast.error('Vul een geldig bedrag in');
      return;
    }
    const slug = form.slug || slugify(form.name);
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/services/${editingId}` : '/api/admin/services';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name: form.name,
          description: form.description,
          price_eur: priceNum,
          sort_order: parseInt(form.sort_order) || 100,
          active: form.active,
        }),
        credentials: 'include',
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(d.error || 'Opslaan mislukt');
        return;
      }
      toast.success(editingId ? 'Service bijgewerkt' : 'Service toegevoegd');
      setDrawerOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s: Service) => {
    await fetch(`/api/admin/services/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !s.active }),
      credentials: 'include',
    });
    load();
  };

  const remove = async () => {
    if (!confirmDel) return;
    const res = await fetch(`/api/admin/services/${confirmDel}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) {
      toast.error('Verwijderen mislukt');
      return;
    }
    toast.success('Verwijderd');
    setConfirmDel(null);
    setDrawerOpen(false);
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Catalogus"
        title="Services"
        description="Vaste-prijs diensten die op /diensten/service zichtbaar zijn voor klanten."
        actions={
          <Button onClick={openCreate}>
            <Plus size={14} /> Nieuwe service
          </Button>
        }
      />

      {items === null ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16" delayMs={i * 40} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="card-surface p-12 text-center">
          <div className="w-12 h-12 rounded-[var(--radius-2xl)] bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
            <Sparkles size={18} className="text-text-subtle" />
          </div>
          <p className="text-sm text-text">Nog geen services in de catalogus</p>
          <p className="text-xs text-text-muted mt-1 mb-4">
            Voeg er één toe om hem op de website te tonen.
          </p>
          <Button onClick={openCreate}>
            <Plus size={14} /> Nieuwe service
          </Button>
        </div>
      ) : (
        <ul className="card-surface divide-y divide-border overflow-hidden">
          <AnimatePresence initial={false}>
            {items.map((s) => (
              <motion.li
                key={s.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 py-3 flex items-center gap-4 hover:bg-surface-2/50 transition-colors"
              >
                <button
                  onClick={() => toggleActive(s)}
                  className="text-text-muted hover:text-text"
                  title={s.active ? 'Klik om uit te schakelen' : 'Klik om in te schakelen'}
                >
                  {s.active ? <ToggleRight size={20} className="text-success" /> : <ToggleLeft size={20} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-medium text-text">{s.name}</span>
                    {!s.active && <Badge tone="neutral">Inactief</Badge>}
                  </div>
                  <div className="text-[11px] text-text-muted truncate mt-0.5 font-mono">{s.slug}</div>
                </div>
                <div className="text-sm font-semibold tabular-nums text-text shrink-0">
                  {formatEur(Number(s.price_eur))}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(s)}
                    className="w-8 h-8 inline-flex items-center justify-center rounded-[var(--radius-md)] text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                    aria-label="Bewerken"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setConfirmDel(s.id)}
                    className="w-8 h-8 inline-flex items-center justify-center rounded-[var(--radius-md)] text-text-muted hover:text-danger hover:bg-danger-soft transition-colors"
                    aria-label="Verwijderen"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? 'Service bewerken' : 'Nieuwe service'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={save} loading={saving}>
              {editingId ? 'Opslaan' : 'Toevoegen'}
            </Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <Input
            label="Naam"
            required
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm({ ...form, name, slug: form.slug || slugify(name) });
            }}
          />
          <Input
            label="Slug (URL-vriendelijke naam)"
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            hint="Gebruikt in URL's en metadata. Alleen letters, cijfers en streepjes."
          />
          <Input
            label="Prijs (€)"
            required
            inputMode="decimal"
            placeholder="65,00"
            value={form.price_eur}
            onChange={(e) => setForm({ ...form, price_eur: e.target.value })}
          />
          <Textarea
            label="Omschrijving"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Volgorde"
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            hint="Lager nummer = hoger in de lijst."
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <span>Actief (zichtbaar op website)</span>
          </label>
        </form>
      </Drawer>

      <ConfirmDialog
        open={!!confirmDel}
        title="Service verwijderen?"
        description="Deze service wordt permanent uit de catalogus verwijderd. Bestaande aanvragen blijven staan."
        confirmLabel="Verwijderen"
        destructive
        onConfirm={remove}
        onCancel={() => setConfirmDel(null)}
      />
    </>
  );
}
