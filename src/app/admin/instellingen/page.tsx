'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { Button, Input, Skeleton } from '@/components/ui';
import PageHeader from '@/components/admin/PageHeader';
import AuditLogPanel from '@/components/admin/AuditLogPanel';
import NotificationToggle from '@/components/admin/NotificationToggle';

type FormState = {
  stalling_price_binnen: string;
  stalling_price_buiten: string;
  fridge_price_grote: string;
  fridge_price_tafel: string;
  fridge_price_airco: string;
  fridge_stock_grote: string;
  fridge_stock_tafel: string;
  fridge_stock_airco: string;
  transport_price_wij_rijden: string;
  transport_price_zelf: string;
  service_price_cleaning_full: string;
  service_price_maintenance_full: string;
  service_price_inspection: string;
  service_price_repair_hourly: string;
  stalling_address: string;
};

const empty: FormState = {
  stalling_price_binnen: '', stalling_price_buiten: '',
  fridge_price_grote: '', fridge_price_tafel: '', fridge_price_airco: '',
  fridge_stock_grote: '', fridge_stock_tafel: '', fridge_stock_airco: '',
  transport_price_wij_rijden: '', transport_price_zelf: '',
  service_price_cleaning_full: '', service_price_maintenance_full: '',
  service_price_inspection: '', service_price_repair_hourly: '',
  stalling_address: '',
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
          transport_price_wij_rijden: String(Number(d.transport_price_wij_rijden ?? 100)),
          transport_price_zelf: String(Number(d.transport_price_zelf ?? 50)),
          service_price_cleaning_full: String(Number(d.service_price_cleaning_full ?? 0)),
          service_price_maintenance_full: String(Number(d.service_price_maintenance_full ?? 0)),
          service_price_inspection: String(Number(d.service_price_inspection ?? 0)),
          service_price_repair_hourly: String(Number(d.service_price_repair_hourly ?? 0)),
          stalling_address: String(d.stalling_address ?? ''),
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
        transport_price_wij_rijden: parse(form.transport_price_wij_rijden),
        transport_price_zelf: parse(form.transport_price_zelf),
        service_price_cleaning_full: parse(form.service_price_cleaning_full),
        service_price_maintenance_full: parse(form.service_price_maintenance_full),
        service_price_inspection: parse(form.service_price_inspection),
        service_price_repair_hourly: parse(form.service_price_repair_hourly),
        stalling_address: form.stalling_address,
      };
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || 'Save failed');
        return;
      }
      toast.success('Settings saved');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Settings"
        description="Prices and stock. A price of €0 hides the option on the website."
      />

      <form onSubmit={save} className="space-y-6 max-w-2xl">
        <div className="card-surface p-6 space-y-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
            Storage (annual price)
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" delayMs={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Indoor (€ / year)" inputMode="decimal"
                value={form.stalling_price_binnen}
                onChange={(e) => set('stalling_price_binnen', e.target.value)} />
              <Input label="Outdoor (€ / year)" inputMode="decimal"
                value={form.stalling_price_buiten}
                onChange={(e) => set('stalling_price_buiten', e.target.value)} />
            </div>
          )}
        </div>

        <div className="card-surface p-6 space-y-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
            Fridges & AC — price per week
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[0, 1, 2].map(i => <Skeleton key={i} className="h-10" delayMs={i * 40} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input label="Large fridge (€/week)" inputMode="decimal"
                value={form.fridge_price_grote}
                onChange={(e) => set('fridge_price_grote', e.target.value)} />
              <Input label="Tabletop (€/week)" inputMode="decimal"
                value={form.fridge_price_tafel}
                onChange={(e) => set('fridge_price_tafel', e.target.value)} />
              <Input label="AC unit (€/week)" inputMode="decimal"
                value={form.fridge_price_airco}
                onChange={(e) => set('fridge_price_airco', e.target.value)} />
            </div>
          )}
        </div>

        <div className="card-surface p-6 space-y-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
            Stock (capacity)
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[0, 1, 2].map(i => <Skeleton key={i} className="h-10" delayMs={i * 40} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input label="Large fridge (units)" inputMode="numeric"
                value={form.fridge_stock_grote}
                onChange={(e) => set('fridge_stock_grote', e.target.value)} />
              <Input label="Tabletop (units)" inputMode="numeric"
                value={form.fridge_stock_tafel}
                onChange={(e) => set('fridge_stock_tafel', e.target.value)} />
              <Input label="AC unit (units)" inputMode="numeric"
                value={form.fridge_stock_airco}
                onChange={(e) => set('fridge_stock_airco', e.target.value)} />
            </div>
          )}
        </div>

        <div className="card-surface p-6 space-y-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
            Transport rates
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1].map(i => <Skeleton key={i} className="h-10" delayMs={i * 40} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="We drive — round trip (€)" inputMode="decimal"
                value={form.transport_price_wij_rijden}
                onChange={(e) => set('transport_price_wij_rijden', e.target.value)} />
              <Input label="Self pickup/drop-off (€)" inputMode="decimal"
                value={form.transport_price_zelf}
                onChange={(e) => set('transport_price_zelf', e.target.value)} />
            </div>
          )}
        </div>

        <div className="card-surface p-6 space-y-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
            Service rates (0 = "Op aanvraag" tonen op website)
          </h2>
          <p className="text-[12px] text-text-muted -mt-2">
            Schoonmaak, onderhoud, inspectie en reparatie. Een waarde van €0 verbergt het bedrag op /tarieven en op de service-pages — daar staat dan &quot;Op aanvraag&quot;.
          </p>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-10" delayMs={i * 40} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Volledig schoonmaak-pakket (€)" inputMode="decimal"
                value={form.service_price_cleaning_full}
                onChange={(e) => set('service_price_cleaning_full', e.target.value)} />
              <Input label="Volledige jaarlijkse onderhoudbeurt (€)" inputMode="decimal"
                value={form.service_price_maintenance_full}
                onChange={(e) => set('service_price_maintenance_full', e.target.value)} />
              <Input label="25-punts inspectie (€)" inputMode="decimal"
                value={form.service_price_inspection}
                onChange={(e) => set('service_price_inspection', e.target.value)} />
              <Input label="Reparatie uurtarief (€/u)" inputMode="decimal"
                value={form.service_price_repair_hourly}
                onChange={(e) => set('service_price_repair_hourly', e.target.value)} />
            </div>
          )}
        </div>

        <div className="card-surface p-6 space-y-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
            Storage address (used in emails after approval)
          </h2>
          {loading ? (
            <Skeleton className="h-10" />
          ) : (
            <Input
              label="Address"
              placeholder="Stalling Cruïlles, Cruïlles (Girona), Spain"
              value={form.stalling_address}
              onChange={(e) => set('stalling_address', e.target.value)}
            />
          )}
        </div>

        <div className="pt-2">
          <Button type="submit" loading={saving}>
            <Save size={14} /> Save all
          </Button>
        </div>
      </form>

      <div className="mt-12 pt-8 border-t border-border">
        <NotificationToggle />
      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <AuditLogPanel limit={50} />
      </div>
    </>
  );
}
