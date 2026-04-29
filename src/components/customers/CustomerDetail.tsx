'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, Trash2, RefreshCw, AlertTriangle, Refrigerator, Warehouse, Truck,
  Activity, Loader2, ExternalLink,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import InlineField from '@/components/InlineField';
import ConfirmDialog from '@/components/ConfirmDialog';

type Booking = {
  id: number;
  camping: string | null;
  spot_number: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  holded_invoice_number: string | null;
};

type FridgeWithBookings = {
  id: number;
  name: string;
  email: string | null;
  device_type: string;
  notes: string | null;
  bookings: Booking[];
};

type Stalling = {
  id: number;
  type: string;
  start_date: string;
  end_date: string | null;
  status: string;
  registration: string | null;
};

type Transport = {
  id: number;
  camping: string | null;
  preferred_date: string | null;
  return_date: string | null;
  status: string;
  created_via: string;
};

export type Customer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  vat_number: string | null;
  notes: string | null;
  holded_contact_id: string | null;
  holded_sync_failed: boolean;
  holded_synced_at: string | null;
  source: string;
  created_at: string;
};

type ActivityEvent = {
  id: number;
  actor: string | null;
  action: string;
  entity_label: string | null;
  details: string | null;
  created_at: string;
};

interface Props {
  initialCustomer: Customer;
  initialFridges: FridgeWithBookings[];
  initialStalling: Stalling[];
  initialTransports: Transport[];
}

export default function CustomerDetail({ initialCustomer, initialFridges, initialStalling, initialTransports }: Props) {
  const router = useRouter();
  const [customer, setCustomer] = useState(initialCustomer);
  const [fridges, setFridges] = useState(initialFridges);
  const [stalling, setStalling] = useState(initialStalling);
  const [transports, setTransports] = useState(initialTransports);
  const [activity, setActivity] = useState<ActivityEvent[] | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // setFridges/setStalling/setTransports zijn intentioneel niet hot-reloading;
  // we laden bij update alleen de customer terug. Reload-helper kan later
  // toegevoegd worden als sub-CRUD vanuit deze pagina nodig is.
  void setFridges; void setStalling; void setTransports;

  useEffect(() => {
    fetch(`/api/admin/customers/${customer.id}/activity`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : { events: [] })
      .then((d) => setActivity(d.events || []))
      .catch(() => setActivity([]));
  }, [customer.id]);

  const updateField = async (field: keyof Customer, value: string) => {
    const res = await fetch(`/api/admin/customers/${customer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ [field]: value }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error || 'Opslaan mislukt');
      throw new Error('save failed');
    }
    const data = await res.json();
    setCustomer(data.customer);
  };

  const syncToHolded = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}?action=sync-holded`, {
        method: 'POST', credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'sync failed');
      setCustomer(data.customer);
      toast.success('Klant gesynchroniseerd met Holded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sync mislukt');
    } finally {
      setSyncing(false);
    }
  };

  const deleteCustomer = async () => {
    const res = await fetch(`/api/admin/customers/${customer.id}`, {
      method: 'DELETE', credentials: 'include',
    });
    if (!res.ok) { toast.error('Verwijderen mislukt'); return; }
    toast.success('Klant verwijderd');
    router.push('/admin/klanten');
  };

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/klanten"
          className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={13} /> Terug naar klanten
        </Link>
      </div>

      <header className="mb-8 flex flex-wrap gap-4 items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted mb-2">
            Klant
          </div>
          <InlineField
            value={customer.name}
            type="text"
            onSave={(v) => updateField('name', v)}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {customer.holded_contact_id && <Badge tone="success">Holded</Badge>}
            {customer.holded_sync_failed && (
              <Badge tone="warning"><AlertTriangle size={10} /> Sync mislukt</Badge>
            )}
            {customer.source === 'holded_import' && <Badge tone="neutral">Geïmporteerd</Badge>}
            {customer.source === 'stripe' && <Badge tone="accent">Via betaling</Badge>}
            {customer.holded_synced_at && (
              <span className="text-[11px] text-text-muted tabular-nums">
                Laatst gesynced: {new Date(customer.holded_synced_at).toLocaleString('nl-NL')}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" onClick={syncToHolded} disabled={syncing}>
            {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Sync Holded
          </Button>
          <Button variant="ghost" onClick={() => setConfirmingDelete(true)}>
            <Trash2 size={14} /> Verwijderen
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        {/* Contact */}
        <section className="card-surface p-5 space-y-5 self-start">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
            Contactgegevens
          </h2>
          <InlineField label="E-mail" value={customer.email} type="email" onSave={(v) => updateField('email', v)} />
          <InlineField label="Telefoon" value={customer.phone} type="tel" onSave={(v) => updateField('phone', v)} />
          <InlineField label="Mobiel" value={customer.mobile} type="tel" onSave={(v) => updateField('mobile', v)} />
          <InlineField label="Adres" value={customer.address} onSave={(v) => updateField('address', v)} />
          <div className="grid grid-cols-3 gap-3">
            <InlineField label="Postcode" value={customer.postal_code} onSave={(v) => updateField('postal_code', v)} />
            <InlineField label="Plaats" value={customer.city} onSave={(v) => updateField('city', v)} />
            <InlineField label="Land" value={customer.country} onSave={(v) => updateField('country', v)} />
          </div>
          <InlineField label="BTW-nummer" value={customer.vat_number} onSave={(v) => updateField('vat_number', v)} />
          <InlineField label="Notities" value={customer.notes} type="textarea" onSave={(v) => updateField('notes', v)} />
        </section>

        <div className="space-y-6">
          <RelatedSection
            icon={Refrigerator}
            title="Koelkasten & airco's"
            count={fridges.length}
            empty="Nog geen koelkast of airco gekoppeld."
            action={
              <Link href={`/admin/koelkasten?customer_id=${customer.id}`}>
                <Button size="sm" variant="secondary">+ Toevoegen</Button>
              </Link>
            }
          >
            {fridges.map((f) => (
              <div key={f.id} className="px-4 py-3 hover:bg-surface-2 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium">{f.device_type}</div>
                    <div className="text-[12px] text-text-muted">
                      {f.bookings.length} {f.bookings.length === 1 ? 'periode' : 'periodes'}
                    </div>
                  </div>
                  <Link
                    href={`/admin/koelkasten?focus=${f.id}`}
                    className="text-[12px] text-text-muted hover:text-text underline-offset-4 hover:underline inline-flex items-center gap-1"
                  >
                    Openen <ExternalLink size={11} />
                  </Link>
                </div>
                {f.bookings.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {f.bookings.slice(0, 3).map((b) => (
                      <div key={b.id} className="flex items-center gap-2 text-[12px] text-text-muted">
                        <span className="text-text-subtle">→</span>
                        <span className="truncate flex-1">
                          {b.camping || '—'}{b.spot_number ? ` · ${b.spot_number}` : ''}
                          {b.start_date && b.end_date ? ` · ${b.start_date} → ${b.end_date}` : ''}
                        </span>
                        <Badge tone={b.status === 'compleet' ? 'success' : 'warning'}>{b.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </RelatedSection>

          <RelatedSection
            icon={Warehouse}
            title="Stalling"
            count={stalling.length}
            empty="Geen stalling-aanvragen."
            action={
              <Link href={`/admin/stalling?customer_id=${customer.id}`}>
                <Button size="sm" variant="secondary">+ Toevoegen</Button>
              </Link>
            }
          >
            {stalling.map((s) => (
              <div key={s.id} className="px-4 py-3 hover:bg-surface-2 transition-colors flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium capitalize">{s.type}</div>
                  <div className="text-[12px] text-text-muted">
                    Start {s.start_date}{s.registration ? ` · ${s.registration}` : ''}
                  </div>
                </div>
                <Badge tone={s.status === 'akkoord' || s.status === 'betaald' ? 'success' : 'warning'}>{s.status}</Badge>
              </div>
            ))}
          </RelatedSection>

          <RelatedSection
            icon={Truck}
            title="Transporten"
            count={transports.length}
            empty="Geen transporten."
            action={
              <Link href="/admin/transport">
                <Button size="sm" variant="secondary">Beheer</Button>
              </Link>
            }
          >
            {transports.map((t) => (
              <div key={t.id} className="px-4 py-3 hover:bg-surface-2 transition-colors flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium truncate">{t.camping || '—'}</div>
                  <div className="text-[12px] text-text-muted">
                    {t.preferred_date ? `Heen ${t.preferred_date}` : '—'}
                    {t.return_date ? ` · Terug ${t.return_date}` : ''}
                  </div>
                </div>
                <Badge tone={t.status === 'uitgevoerd' ? 'success' : t.status === 'afgewezen' ? 'danger' : 'warning'}>{t.status}</Badge>
              </div>
            ))}
          </RelatedSection>

          {/* Activity */}
          <section className="card-surface overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted flex items-center gap-2">
                <Activity size={12} /> Activiteit
              </h2>
            </div>
            {activity === null ? (
              <div className="p-5 text-[13px] text-text-muted">Laden…</div>
            ) : activity.length === 0 ? (
              <div className="p-5 text-[13px] text-text-muted">Nog geen activiteit voor deze klant.</div>
            ) : (
              <ul className="divide-y divide-border">
                {activity.map((e) => (
                  <li key={e.id} className="px-5 py-2.5 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium truncate">{e.action}</div>
                      {e.entity_label && (
                        <div className="text-[11px] text-text-muted truncate">{e.entity_label}</div>
                      )}
                    </div>
                    <span className="text-[11px] text-text-subtle tabular-nums shrink-0">
                      {new Date(e.created_at).toLocaleString('nl-NL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Klant verwijderen?"
        description={`${customer.name} wordt soft-deleted. Gerelateerde koelkasten en stallingen blijven bestaan maar worden ontkoppeld.`}
        confirmLabel="Verwijderen"
        destructive
        onConfirm={async () => { await deleteCustomer(); }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  );
}

function RelatedSection({
  icon: Icon, title, count, empty, action, children,
}: {
  icon: typeof Refrigerator;
  title: string;
  count: number;
  empty: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="card-surface overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted flex items-center gap-2">
          <Icon size={12} /> {title} <span className="text-text-subtle">({count})</span>
        </h2>
        {action}
      </div>
      {count === 0 ? (
        <div className="p-5 text-[13px] text-text-muted">{empty}</div>
      ) : (
        <div className="divide-y divide-border">{children}</div>
      )}
    </section>
  );
}
