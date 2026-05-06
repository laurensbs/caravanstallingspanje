'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Save, X, Loader2 } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { Button, Input } from '@/components/ui';
import PhotoDropzone, { type UploadedFile } from '@/components/PhotoDropzone';

type StockItem = {
  id: number;
  kind: 'caravan' | 'camper' | string;
  brand: string;
  model: string;
  year: number | null;
  km: number | null;
  length_m: string | null;
  price_eur: string | null;
  status: 'available' | 'new' | 'reserved' | 'sold' | 'draft' | string;
  slug: string | null;
  description: string | null;
  hero_photo_url: string | null;
  gallery_urls: string[] | unknown;
  created_at: string;
  updated_at: string;
};

type FormState = {
  kind: 'caravan' | 'camper';
  brand: string;
  model: string;
  year: string;
  km: string;
  length_m: string;
  price_eur: string;
  status: 'available' | 'new' | 'reserved' | 'sold' | 'draft';
  description: string;
  hero_photo_url: string;
  gallery_urls: string[];
};

const empty: FormState = {
  kind: 'caravan', brand: '', model: '', year: '', km: '', length_m: '',
  price_eur: '', status: 'available', description: '',
  hero_photo_url: '', gallery_urls: [],
};

export default function VoorraadPage() {
  const [items, setItems] = useState<StockItem[] | null>(null);
  const [editing, setEditing] = useState<StockItem | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const res = await fetch('/api/admin/stock', { credentials: 'include' });
    const data = await res.json();
    setItems(data.items || []);
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <PageHeader
        eyebrow="Sales"
        title="Voorraad"
        description="Caravans en campers die wij verkopen — gepubliceerd op /verkoop."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus size={14} /> Nieuw item
          </Button>
        }
      />

      <div className="card-surface p-0 overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.14em] text-text-muted border-b border-border">
              <th className="text-left p-3 pl-5">Item</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Bouwjaar</th>
              <th className="text-right p-3">Prijs</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Foto&apos;s</th>
              <th className="p-3 pr-5"></th>
            </tr>
          </thead>
          <tbody>
            {items === null ? (
              <tr><td colSpan={7} className="p-6 text-center"><Loader2 className="animate-spin inline" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-text-muted">Nog geen items.</td></tr>
            ) : items.map((it) => (
              <tr key={it.id} className="border-b border-border last:border-b-0 hover:bg-surface-2">
                <td className="p-3 pl-5">
                  <div className="font-medium">{it.brand} {it.model}</div>
                  <div className="text-[12px] text-text-subtle">/{it.slug}</div>
                </td>
                <td className="p-3 capitalize">{it.kind}</td>
                <td className="p-3">{it.year || '—'}</td>
                <td className="p-3 text-right tabular-nums">
                  {it.price_eur ? `€${Number(it.price_eur).toLocaleString('nl-NL')}` : '—'}
                </td>
                <td className="p-3">
                  <StatusPill status={it.status} />
                </td>
                <td className="p-3 text-[12px] text-text-muted">
                  {(Array.isArray(it.gallery_urls) ? it.gallery_urls.length : 0) + (it.hero_photo_url ? 1 : 0)} foto&apos;s
                </td>
                <td className="p-3 pr-5 text-right">
                  <Button variant="secondary" onClick={() => setEditing(it)}>Bewerken</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <EditDrawer
          item={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); load(); }}
        />
      )}
    </>
  );
}

function StatusPill({ status }: { status: string }) {
  const cfg: Record<string, { label: string; bg: string; color: string }> = {
    available:  { label: 'Beschikbaar', bg: 'rgba(65,138,70,0.14)',  color: '#418A46' },
    new:        { label: 'Nieuw',       bg: 'rgba(249,173,54,0.18)', color: '#8A5C00' },
    reserved:   { label: 'Gereserveerd', bg: 'rgba(31,42,54,0.10)',  color: '#1F2A36' },
    sold:       { label: 'Verkocht',    bg: 'rgba(0,0,0,0.06)',      color: 'rgba(0,0,0,0.55)' },
    draft:      { label: 'Concept',     bg: 'rgba(0,0,0,0.04)',      color: 'rgba(0,0,0,0.5)' },
  };
  const m = cfg[status] || { label: status, bg: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.55)' };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 999,
      background: m.bg, color: m.color, fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11.5,
    }}>{m.label}</span>
  );
}

function EditDrawer({
  item, onClose, onSaved,
}: {
  item: StockItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isCreate = !item;
  const [form, setForm] = useState<FormState>(() => {
    if (!item) return empty;
    const gallery = Array.isArray(item.gallery_urls) ? item.gallery_urls as string[] : [];
    return {
      kind: (item.kind === 'camper' ? 'camper' : 'caravan') as 'caravan' | 'camper',
      brand: item.brand,
      model: item.model,
      year: item.year !== null ? String(item.year) : '',
      km: item.km !== null ? String(item.km) : '',
      length_m: item.length_m || '',
      price_eur: item.price_eur || '',
      status: (item.status as FormState['status']) || 'available',
      description: item.description || '',
      hero_photo_url: item.hero_photo_url || '',
      gallery_urls: gallery,
    };
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // PhotoDropzone-state — converteer naar UploadedFile-shape voor weergave.
  const heroPhotos: UploadedFile[] = useMemo(
    () => form.hero_photo_url
      ? [{ url: form.hero_photo_url, webUrl: form.hero_photo_url, fileName: 'hero', sizeKb: 0 }]
      : [],
    [form.hero_photo_url],
  );
  const galleryPhotos: UploadedFile[] = useMemo(
    () => form.gallery_urls.map((url, i) => ({ url, webUrl: url, fileName: `gallery-${i + 1}`, sizeKb: 0 })),
    [form.gallery_urls],
  );

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const uploadRef = useMemo(
    () => isCreate
      ? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
      : `stock-${item!.id}`,
    [isCreate, item],
  );

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        kind: form.kind,
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: form.year ? Number(form.year) : null,
        km: form.km ? Number(form.km) : null,
        length_m: form.length_m ? Number(form.length_m) : null,
        price_eur: form.price_eur ? Number(form.price_eur) : null,
        status: form.status,
        description: form.description.trim() || null,
        hero_photo_url: form.hero_photo_url || null,
        gallery_urls: form.gallery_urls,
      };
      const res = isCreate
        ? await fetch('/api/admin/stock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' })
        : await fetch(`/api/admin/stock/${item!.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || 'Opslaan mislukt');
        return;
      }
      toast.success(isCreate ? 'Item toegevoegd' : 'Item bijgewerkt');
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!item) return;
    if (!confirm(`Verwijder "${item.brand} ${item.model}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/stock/${item.id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d?.error || 'Verwijderen mislukt');
        return;
      }
      toast.success('Verwijderd');
      onSaved();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', justifyContent: 'flex-end',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: 'min(720px, 100%)',
          background: 'var(--surface)',
          height: '100%',
          overflowY: 'auto',
          padding: '24px 28px',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-semibold">
            {isCreate ? 'Nieuw voorraad-item' : `${item!.brand} ${item!.model}`}
          </h2>
          <button onClick={onClose} aria-label="Sluiten" className="p-2 rounded-md hover:bg-surface-2">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-text-muted mb-1">Type</label>
              <select
                className="w-full h-10 px-3 border border-border rounded-md bg-surface text-text"
                value={form.kind}
                onChange={(e) => set('kind', e.target.value as 'caravan' | 'camper')}
              >
                <option value="caravan">Caravan</option>
                <option value="camper">Camper</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-text-muted mb-1">Status</label>
              <select
                className="w-full h-10 px-3 border border-border rounded-md bg-surface text-text"
                value={form.status}
                onChange={(e) => set('status', e.target.value as FormState['status'])}
              >
                <option value="draft">Concept (niet zichtbaar)</option>
                <option value="available">Beschikbaar</option>
                <option value="new">Nieuw binnen</option>
                <option value="reserved">Gereserveerd</option>
                <option value="sold">Verkocht</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Merk" value={form.brand} onChange={(e) => set('brand', e.target.value)} required />
            <Input label="Model" value={form.model} onChange={(e) => set('model', e.target.value)} required />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="Bouwjaar" inputMode="numeric" value={form.year} onChange={(e) => set('year', e.target.value)} />
            <Input label="KM" inputMode="numeric" value={form.km} onChange={(e) => set('km', e.target.value)} />
            <Input label="Lengte (m)" inputMode="decimal" value={form.length_m} onChange={(e) => set('length_m', e.target.value)} />
          </div>

          <Input label="Prijs (€)" inputMode="decimal" value={form.price_eur} onChange={(e) => set('price_eur', e.target.value)} />

          <div>
            <label className="block text-[11px] uppercase tracking-[0.14em] text-text-muted mb-1">Beschrijving</label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md bg-surface text-text text-[14px]"
              rows={5}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Verkooptekst, opvallende kenmerken, conditie…"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.14em] text-text-muted mb-2">Hoofdfoto</label>
            <PhotoDropzone
              kind="sale-listing"
              ref={uploadRef + '-hero'}
              value={heroPhotos}
              onChange={(files) => set('hero_photo_url', files[0]?.url || '')}
              maxFiles={1}
              label=""
              hint="Eén grote foto die op de overzicht-grid verschijnt"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.14em] text-text-muted mb-2">Galerij</label>
            <PhotoDropzone
              kind="sale-listing"
              ref={uploadRef + '-gallery'}
              value={galleryPhotos}
              onChange={(files) => set('gallery_urls', files.map((f) => f.url))}
              maxFiles={8}
              label=""
              hint="Tot 8 foto's voor de detail-pagina"
            />
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-border flex items-center justify-between gap-3">
          {!isCreate && (
            <Button variant="danger" onClick={del} loading={deleting}>
              <Trash2 size={14} /> Verwijderen
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" onClick={onClose}>Annuleer</Button>
            <Button onClick={save} loading={saving}>
              <Save size={14} /> {isCreate ? 'Toevoegen' : 'Opslaan'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
