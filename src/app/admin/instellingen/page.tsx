'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { Button, Input, Skeleton } from '@/components/ui';
import PageHeader from '@/components/admin/PageHeader';

type FormState = {
  stalling_price_binnen: string;
  stalling_price_buiten: string;
  fridge_price_grote: string;
  fridge_price_tafel: string;
  fridge_price_airco: string;
  fridge_stock_grote: string;
  fridge_stock_tafel: string;
  fridge_stock_airco: string;
};

const empty: FormState = {
  stalling_price_binnen: '', stalling_price_buiten: '',
  fridge_price_grote: '', fridge_price_tafel: '', fridge_price_airco: '',
  fridge_stock_grote: '', fridge_stock_tafel: '', fridge_stock_airco: '',
};

export default function SettingsPage() {
  const [form, setForm] = useState<FormState>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setForm({
          stalling_price_binnen: String(Number(d.stalling_price_binnen ?? 0)),
          stalling_price_buiten: String(Number(d.stalling_price_buiten ?? 0)),
          fridge_price_grote: String(Number(d.fridge_price_grote ?? 40)),
          fridge_price_tafel: String(Number(d.fridge_price_tafel ?? 25)),
          fridge_price_airco: String(Number(d.fridge_price_airco ?? 50)),
          fridge_stock_grote: String(Number(d.fridge_stock_grote ?? 110)),
          fridge_stock_tafel: String(Number(d.fridge_stock_tafel ?? 20)),
          fridge_stock_airco: String(Number(d.fridge_stock_airco ?? 10)),
        });
      })
      .catch(() => { /* keep empty */ })
      .finally(() => setLoading(false));
  }, []);

  const set = (k: keyof FormState, v: string) => setForm({ ...form, [k]: v });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const parse = (s: string) => {
        const n = parseFloat(s.replace(',', '.'));
        return Number.isFinite(n) && n >= 0 ? n : 0;
      };
      const parseInt0 = (s: string) => {
        const n = parseInt(s, 10);
        return Number.isFinite(n) && n >= 0 ? n : 0;
      };
      const payload = {
        stalling_price_binnen: parse(form.stalling_price_binnen),
        stalling_price_buiten: parse(form.stalling_price_buiten),
        fridge_price_grote: parse(form.fridge_price_grote),
        fridge_price_tafel: parse(form.fridge_price_tafel),
        fridge_price_airco: parse(form.fridge_price_airco),
        fridge_stock_grote: parseInt0(form.fridge_stock_grote),
        fridge_stock_tafel: parseInt0(form.fridge_stock_tafel),
        fridge_stock_airco: parseInt0(form.fridge_stock_airco),
      };
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || 'Opslaan mislukt');
        return;
      }
      toast.success('Instellingen opgeslagen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Beheer"
        title="Instellingen"
        description="Prijzen en voorraad. Een prijs op 0 € verbergt de optie op de website."
      />

      <form onSubmit={save} className="space-y-6 max-w-2xl">
        <div className="card-surface p-6 space-y-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
            Stalling (jaarprijs)
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" delayMs={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Binnen (€ / jaar)" inputMode="decimal"
                value={form.stalling_price_binnen}
                onChange={(e) => set('stalling_price_binnen', e.target.value)} />
              <Input label="Buiten (€ / jaar)" inputMode="decimal"
                value={form.stalling_price_buiten}
                onChange={(e) => set('stalling_price_buiten', e.target.value)} />
            </div>
          )}
        </div>

        <div className="card-surface p-6 space-y-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
            Koelkasten & airco — prijs per week
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[0, 1, 2].map(i => <Skeleton key={i} className="h-10" delayMs={i * 40} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input label="Grote koelkast (€/week)" inputMode="decimal"
                value={form.fridge_price_grote}
                onChange={(e) => set('fridge_price_grote', e.target.value)} />
              <Input label="Tafelmodel (€/week)" inputMode="decimal"
                value={form.fridge_price_tafel}
                onChange={(e) => set('fridge_price_tafel', e.target.value)} />
              <Input label="Airco (€/week)" inputMode="decimal"
                value={form.fridge_price_airco}
                onChange={(e) => set('fridge_price_airco', e.target.value)} />
            </div>
          )}
        </div>

        <div className="card-surface p-6 space-y-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
            Voorraad (capaciteit)
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[0, 1, 2].map(i => <Skeleton key={i} className="h-10" delayMs={i * 40} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input label="Grote koelkast (stuks)" inputMode="numeric"
                value={form.fridge_stock_grote}
                onChange={(e) => set('fridge_stock_grote', e.target.value)} />
              <Input label="Tafelmodel (stuks)" inputMode="numeric"
                value={form.fridge_stock_tafel}
                onChange={(e) => set('fridge_stock_tafel', e.target.value)} />
              <Input label="Airco (stuks)" inputMode="numeric"
                value={form.fridge_stock_airco}
                onChange={(e) => set('fridge_stock_airco', e.target.value)} />
            </div>
          )}
        </div>

        <div className="pt-2">
          <Button type="submit" loading={saving}>
            <Save size={14} /> Alles opslaan
          </Button>
        </div>
      </form>
    </>
  );
}
