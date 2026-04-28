'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { Button, Input, Skeleton } from '@/components/ui';
import PageHeader from '@/components/admin/PageHeader';

export default function SettingsPage() {
  const [stallingBinnen, setStallingBinnen] = useState('');
  const [stallingBuiten, setStallingBuiten] = useState('');
  const [transport, setTransport] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setStallingBinnen(String(Number(d.stalling_price_binnen ?? 0)));
        setStallingBuiten(String(Number(d.stalling_price_buiten ?? 0)));
        setTransport(String(Number(d.transport_price ?? 0)));
      })
      .catch(() => { /* keep empty */ })
      .finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const parse = (s: string) => {
        const n = parseFloat(s.replace(',', '.'));
        return Number.isFinite(n) && n >= 0 ? n : 0;
      };
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stalling_price_binnen: parse(stallingBinnen),
          stalling_price_buiten: parse(stallingBuiten),
          transport_price: parse(transport),
        }),
        credentials: 'include',
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || 'Opslaan mislukt');
        return;
      }
      toast.success('Prijzen opgeslagen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Beheer"
        title="Instellingen"
        description="Vaste prijzen voor stalling en transport. Een prijs op 0 € verbergt die optie."
      />

      <form onSubmit={save} className="card-surface p-6 max-w-xl space-y-5">
        <div>
          <h2 className="text-[10px] font-medium uppercase tracking-[0.22em] text-text-muted mb-3">
            Stalling (jaarprijs)
          </h2>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" delayMs={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Binnen (€ / jaar)"
                inputMode="decimal"
                value={stallingBinnen}
                onChange={(e) => setStallingBinnen(e.target.value)}
              />
              <Input
                label="Buiten (€ / jaar)"
                inputMode="decimal"
                value={stallingBuiten}
                onChange={(e) => setStallingBuiten(e.target.value)}
              />
            </div>
          )}
        </div>

        <div>
          <h2 className="text-[10px] font-medium uppercase tracking-[0.22em] text-text-muted mb-3">
            Transport (vast bedrag per rit)
          </h2>
          {loading ? (
            <Skeleton className="h-10" />
          ) : (
            <Input
              label="Prijs (€)"
              inputMode="decimal"
              value={transport}
              onChange={(e) => setTransport(e.target.value)}
            />
          )}
        </div>

        <div className="pt-2">
          <Button type="submit" loading={saving}>
            <Save size={14} /> Opslaan
          </Button>
        </div>
      </form>
    </>
  );
}
