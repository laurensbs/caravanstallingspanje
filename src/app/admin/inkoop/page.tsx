'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Mail, Phone, ExternalLink } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { Button, Select } from '@/components/ui';

type PurchaseIntake = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  kind: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  registration: string | null;
  km: number | null;
  condition_note: string | null;
  asking_price_eur: string | null;
  photos: Array<{ url: string; webUrl?: string; fileName: string }>;
  status: string;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_OPTIONS = [
  { value: 'new', label: 'Nieuw' },
  { value: 'reviewed', label: 'Bekeken' },
  { value: 'offered', label: 'Bod gegeven' },
  { value: 'accepted', label: 'Akkoord' },
  { value: 'declined', label: 'Afgewezen' },
  { value: 'closed', label: 'Gesloten' },
];

export default function InkoopPage() {
  const [items, setItems] = useState<PurchaseIntake[] | null>(null);

  const load = async () => {
    const res = await fetch('/api/admin/purchase-intakes', { credentials: 'include' });
    const data = await res.json();
    setItems(data.items || []);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string, adminNote?: string) => {
    const res = await fetch(`/api/admin/purchase-intakes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_note: adminNote ?? null }),
      credentials: 'include',
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast.error(d?.error || 'Updaten mislukt');
      return;
    }
    toast.success('Bijgewerkt');
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Sales"
        title="Inkoop-aanvragen"
        description="Klanten die hun caravan/camper aan ons willen verkopen — met foto's."
      />

      {items === null ? (
        <div className="card-surface p-8 text-center">
          <Loader2 className="animate-spin inline" />
        </div>
      ) : items.length === 0 ? (
        <div className="card-surface p-8 text-center text-text-muted">Nog geen aanvragen.</div>
      ) : (
        <div className="space-y-4">
          {items.map((it) => (
            <IntakeCard key={it.id} item={it} onUpdate={updateStatus} />
          ))}
        </div>
      )}
    </>
  );
}

function IntakeCard({
  item, onUpdate,
}: {
  item: PurchaseIntake;
  onUpdate: (id: number, status: string, note?: string) => void;
}) {
  const [note, setNote] = useState(item.admin_note || '');
  const [status, setStatus] = useState(item.status);
  const photos = Array.isArray(item.photos) ? item.photos : [];

  const created = new Date(item.created_at);

  return (
    <div className="card-surface p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-[16px] font-semibold">{item.name}</h3>
            <span className="text-[12px] text-text-subtle">·</span>
            <span className="text-[12px] text-text-muted">
              {created.toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap text-[13px] text-text-muted">
            <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1 hover:underline">
              <Mail size={13} /> {item.email}
            </a>
            {item.phone && (
              <a href={`tel:${item.phone}`} className="inline-flex items-center gap-1 hover:underline">
                <Phone size={13} /> {item.phone}
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
          <Button onClick={() => onUpdate(item.id, status, note)}>Opslaan</Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
        <Spec k="Type" v={item.kind} />
        {item.brand && <Spec k="Merk" v={item.brand} />}
        {item.model && <Spec k="Model" v={item.model} />}
        {item.year && <Spec k="Bouwjaar" v={String(item.year)} />}
        {item.km !== null && <Spec k="KM" v={item.km.toLocaleString('nl-NL')} />}
        {item.registration && <Spec k="Kenteken" v={item.registration} />}
        {item.asking_price_eur && <Spec k="Vraagprijs" v={`€${Number(item.asking_price_eur).toLocaleString('nl-NL')}`} />}
      </div>

      {item.condition_note && (
        <p className="mt-3 text-[13.5px] text-text whitespace-pre-line border-l-2 border-border pl-3">
          {item.condition_note}
        </p>
      )}

      {photos.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] uppercase tracking-[0.14em] text-text-muted mb-2">Foto&apos;s ({photos.length})</div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {photos.map((p, i) => (
              <a
                key={i}
                href={p.webUrl || p.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  aspectRatio: '1 / 1',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: `url(${p.url}) center / cover no-repeat`,
                  border: '1px solid var(--color-border, var(--line))',
                  display: 'block',
                  position: 'relative',
                }}
              >
                <span style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: 6, padding: 2 }}>
                  <ExternalLink size={11} />
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <label className="block text-[11px] uppercase tracking-[0.14em] text-text-muted mb-1">Interne notitie</label>
        <textarea
          className="w-full px-3 py-2 border border-border rounded-md bg-surface text-text text-[13.5px]"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Bv: Bod €12.500 verstuurd, reageert vrijdag"
        />
      </div>
    </div>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <span className="text-text-muted">{k}: </span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
