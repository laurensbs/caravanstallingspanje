'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Caravan as CaravanIcon, Plus, Trash2, Pencil, Save, X } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';

export type AdminCaravan = {
  id: number;
  customer_id: number;
  kind: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  registration: string | null;
  length_m: string | null;
  spot_code: string | null;
  storage_type: string | null;
  contract_start: string | null;
  contract_renew: string | null;
  insurance_provider: string | null;
  notes: string | null;
};

interface Props {
  customerId: number;
  initialCaravans: AdminCaravan[];
}

type Draft = {
  kind: 'caravan' | 'camper';
  brand: string;
  model: string;
  year: string;
  registration: string;
  length_m: string;
  spot_code: string;
  storage_type: '' | 'binnen' | 'overdekt' | 'buiten';
  contract_start: string;
  contract_renew: string;
  insurance_provider: string;
  notes: string;
};

const empty: Draft = {
  kind: 'caravan', brand: '', model: '', year: '', registration: '', length_m: '',
  spot_code: '', storage_type: '', contract_start: '', contract_renew: '',
  insurance_provider: '', notes: '',
};

function rowToDraft(r: AdminCaravan): Draft {
  return {
    kind: (r.kind === 'camper' ? 'camper' : 'caravan'),
    brand: r.brand || '',
    model: r.model || '',
    year: r.year !== null ? String(r.year) : '',
    registration: r.registration || '',
    length_m: r.length_m || '',
    spot_code: r.spot_code || '',
    storage_type: (r.storage_type as Draft['storage_type']) || '',
    contract_start: r.contract_start ? r.contract_start.slice(0, 10) : '',
    contract_renew: r.contract_renew ? r.contract_renew.slice(0, 10) : '',
    insurance_provider: r.insurance_provider || '',
    notes: r.notes || '',
  };
}

export default function CustomerCaravanSection({ customerId, initialCaravans }: Props) {
  const [caravans, setCaravans] = useState<AdminCaravan[]>(initialCaravans);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <section
      className="card-surface p-6 space-y-4"
      style={{ borderRadius: 14 }}
    >
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <CaravanIcon size={16} className="text-text-muted" />
          <h3 className="text-[14px] font-semibold">Caravan(s) van klant</h3>
          <span className="text-[12px] text-text-muted">({caravans.length})</span>
        </div>
        {!creating && (
          <Button variant="secondary" onClick={() => setCreating(true)}>
            <Plus size={13} /> Caravan koppelen
          </Button>
        )}
      </header>

      {caravans.length === 0 && !creating && (
        <p className="text-[13px] text-text-muted py-2">
          Nog geen caravan gekoppeld. Voeg er een toe zodat de klant 'm in zijn portaal ziet.
        </p>
      )}

      {creating && (
        <CaravanEditor
          initial={empty}
          onCancel={() => setCreating(false)}
          onSave={async (draft) => {
            const res = await fetch('/api/admin/caravans', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ customer_id: customerId, ...draftToPayload(draft) }),
              credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) {
              toast.error(data?.error || 'Toevoegen mislukt');
              return;
            }
            setCaravans([data.item, ...caravans]);
            setCreating(false);
            toast.success('Caravan gekoppeld');
          }}
        />
      )}

      {caravans.map((c) =>
        editingId === c.id ? (
          <CaravanEditor
            key={c.id}
            initial={rowToDraft(c)}
            onCancel={() => setEditingId(null)}
            onSave={async (draft) => {
              const res = await fetch(`/api/admin/caravans/${c.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(draftToPayload(draft)),
                credentials: 'include',
              });
              const data = await res.json();
              if (!res.ok) {
                toast.error(data?.error || 'Opslaan mislukt');
                return;
              }
              setCaravans(caravans.map((x) => (x.id === c.id ? data.item : x)));
              setEditingId(null);
              toast.success('Bijgewerkt');
            }}
            onDelete={async () => {
              if (!confirm('Caravan-koppeling verwijderen?')) return;
              const res = await fetch(`/api/admin/caravans/${c.id}`, { method: 'DELETE', credentials: 'include' });
              if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                toast.error(d?.error || 'Verwijderen mislukt');
                return;
              }
              setCaravans(caravans.filter((x) => x.id !== c.id));
              setEditingId(null);
              toast.success('Verwijderd');
            }}
          />
        ) : (
          <CaravanRow key={c.id} c={c} onEdit={() => setEditingId(c.id)} />
        )
      )}
    </section>
  );
}

function CaravanRow({ c, onEdit }: { c: AdminCaravan; onEdit: () => void }) {
  const title = [c.brand, c.model].filter(Boolean).join(' ') || `Caravan #${c.id}`;
  const subParts = [
    c.year ? String(c.year) : null,
    c.registration,
    c.spot_code ? `plek ${c.spot_code}` : null,
    c.storage_type,
  ].filter(Boolean);
  return (
    <div className="border border-border rounded-md p-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="font-medium text-[14px]">{title}</div>
        {subParts.length > 0 && (
          <div className="text-[12px] text-text-muted">{subParts.join(' · ')}</div>
        )}
      </div>
      <Button variant="secondary" onClick={onEdit}>
        <Pencil size={12} /> Bewerken
      </Button>
    </div>
  );
}

function CaravanEditor({
  initial, onCancel, onSave, onDelete,
}: {
  initial: Draft;
  onCancel: () => void;
  onSave: (d: Draft) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft({ ...draft, [k]: v });

  return (
    <div className="border border-border rounded-md p-4 space-y-3 bg-surface-2">
      <div className="grid grid-cols-2 gap-3">
        <Select value={draft.kind} onChange={(e) => set('kind', e.target.value as 'caravan' | 'camper')} label="Type">
          <option value="caravan">Caravan</option>
          <option value="camper">Camper</option>
        </Select>
        <Input label="Bouwjaar" inputMode="numeric" value={draft.year} onChange={(e) => set('year', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Merk" value={draft.brand} onChange={(e) => set('brand', e.target.value)} />
        <Input label="Model" value={draft.model} onChange={(e) => set('model', e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input label="Kenteken" value={draft.registration} onChange={(e) => set('registration', e.target.value)} />
        <Input label="Lengte (m)" inputMode="decimal" value={draft.length_m} onChange={(e) => set('length_m', e.target.value)} />
        <Input label="Plek-code" value={draft.spot_code} onChange={(e) => set('spot_code', e.target.value)} placeholder="B-12" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Select label="Type stalling" value={draft.storage_type} onChange={(e) => set('storage_type', e.target.value as Draft['storage_type'])}>
          <option value="">— niet ingesteld —</option>
          <option value="binnen">Binnen</option>
          <option value="overdekt">Overdekt</option>
          <option value="buiten">Buiten</option>
        </Select>
        <Input label="Contract start" type="date" value={draft.contract_start} onChange={(e) => set('contract_start', e.target.value)} />
        <Input label="Contract verlengt" type="date" value={draft.contract_renew} onChange={(e) => set('contract_renew', e.target.value)} />
      </div>
      <Input label="Verzekering provider" value={draft.insurance_provider} onChange={(e) => set('insurance_provider', e.target.value)} placeholder="Securitas Direct" />
      <div>
        <label className="block text-[11px] uppercase tracking-[0.14em] text-text-muted mb-1">Notitie (zichtbaar voor klant)</label>
        <textarea
          className="w-full px-3 py-2 border border-border rounded-md bg-surface text-text text-[14px]"
          rows={2}
          value={draft.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Bv: Toegankelijk via hoofdpoort, links na de werkplaats"
        />
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
        <div>
          {onDelete && (
            <Button variant="danger" onClick={async () => { setSaving(true); await onDelete(); setSaving(false); }} loading={saving}>
              <Trash2 size={12} /> Verwijderen
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel}>
            <X size={12} /> Annuleer
          </Button>
          <Button onClick={async () => { setSaving(true); await onSave(draft); setSaving(false); }} loading={saving}>
            <Save size={12} /> Opslaan
          </Button>
        </div>
      </div>
    </div>
  );
}

function draftToPayload(d: Draft) {
  const num = (s: string) => {
    const n = parseFloat(s.replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };
  const nint = (s: string) => {
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : null;
  };
  return {
    kind: d.kind,
    brand: d.brand.trim() || null,
    model: d.model.trim() || null,
    year: d.year.trim() ? nint(d.year) : null,
    registration: d.registration.trim() || null,
    length_m: d.length_m.trim() ? num(d.length_m) : null,
    spot_code: d.spot_code.trim() || null,
    storage_type: d.storage_type || null,
    contract_start: d.contract_start || null,
    contract_renew: d.contract_renew || null,
    insurance_provider: d.insurance_provider.trim() || null,
    notes: d.notes.trim() || null,
  };
}
