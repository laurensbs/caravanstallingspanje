'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, Trash2, RefreshCw, AlertTriangle, Refrigerator, Warehouse, Truck,
  Activity, Loader2, ExternalLink, KeyRound, Copy, Check, X, Mail,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import InlineField from '@/components/InlineField';
import ConfirmDialog from '@/components/ConfirmDialog';
import CustomerCaravanSection from './CustomerCaravanSection';

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

export type HoldedCustomFieldRow = {
  field?: string;
  value?: string;
  name?: string;
  id?: string;
};

export type HoldedSnapshotAddress = {
  address?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  country?: string;
  countryCode?: string;
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
  // Holded snapshot — alle Holded-velden, opgehaald bij sync.
  holded_raw?: Record<string, unknown> | null;
  holded_custom_fields?: HoldedCustomFieldRow[] | null;
  holded_tags?: string[] | null;
  holded_code?: string | null;
  holded_type?: string | null;
  holded_iban?: string | null;
  holded_web?: string | null;
  holded_secondary_email?: string | null;
  holded_default_currency?: string | null;
  holded_billing_address?: HoldedSnapshotAddress | null;
  holded_shipping_address?: HoldedSnapshotAddress | null;
};

type ActivityEvent = {
  id: number;
  actor: string | null;
  action: string;
  entity_label: string | null;
  details: string | null;
  created_at: string;
};

function stallingStatusLabel(s: string): string {
  const map: Record<string, string> = {
    controleren: 'Review', akkoord: 'Approved', betaald: 'Paid', afgewezen: 'Rejected',
  };
  return map[s] || s;
}

function transportStatusLabel(s: string): string {
  const map: Record<string, string> = {
    controleren: 'Review', betaald: 'Paid', gepland: 'Scheduled',
    uitgevoerd: 'Completed', afgewezen: 'Rejected',
  };
  return map[s] || s;
}

interface Props {
  initialCustomer: Customer;
  initialFridges: FridgeWithBookings[];
  initialStalling: Stalling[];
  initialTransports: Transport[];
  initialCaravans?: import('./CustomerCaravanSection').AdminCaravan[];
}

export default function CustomerDetail({ initialCustomer, initialFridges, initialStalling, initialTransports, initialCaravans = [] }: Props) {
  const router = useRouter();
  const [customer, setCustomer] = useState(initialCustomer);
  const [fridges, setFridges] = useState(initialFridges);
  const [stalling, setStalling] = useState(initialStalling);
  const [transports, setTransports] = useState(initialTransports);
  const [activity, setActivity] = useState<ActivityEvent[] | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [sendingWelcome, setSendingWelcome] = useState(false);
  // Resultaat van een wachtwoord-reset — toont een modal met het temp-
  // password zodat admin het kan kopiëren als de mail niet aankomt.
  const [resetResult, setResetResult] = useState<null | { tempPassword: string; mailSent: boolean; mailError: string | null; email: string }>(null);
  const [welcomeResult, setWelcomeResult] = useState<null | { mailSent: boolean; mailError: string | null; email: string; setupUrl: string; expiresAt: string }>(null);
  const [copied, setCopied] = useState(false);

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
      toast.error(j.error || 'Save failed');
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
      toast.success('Customer synced with Holded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  // Live snapshot ophalen — vult holded_raw + alle holded_* kolommen met
  // de complete contact-payload zoals die nu in Holded staat. Roept daarna
  // de detail-load opnieuw zodat de UI direct de nieuwe velden ziet.
  const refreshHoldedSnapshot = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}/holded-snapshot`, {
        method: 'POST', credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'fetch failed');
      // Re-fetch customer-detail zodat we de nieuwste DB-state hebben.
      const detail = await fetch(`/api/admin/customers/${customer.id}`, { credentials: 'include' });
      if (detail.ok) {
        const d = await detail.json();
        if (d.customer) setCustomer(d.customer);
      }
      toast.success('Holded data refreshed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not refresh Holded data');
    } finally {
      setSyncing(false);
    }
  };

  const resetPortalPassword = async () => {
    if (!customer.email) {
      toast.error('Klant heeft geen e-mailadres.');
      return;
    }
    if (!confirm(`Genereer een nieuw eenmalig wachtwoord voor ${customer.name}? Het oude wachtwoord werkt daarna niet meer.`)) {
      return;
    }
    setResettingPassword(true);
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}/reset-password`, {
        method: 'POST', credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Reset mislukt');
        return;
      }
      setResetResult({
        tempPassword: data.tempPassword,
        mailSent: data.mailSent,
        mailError: data.mailError,
        email: data.email,
      });
      setCopied(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reset mislukt');
    } finally {
      setResettingPassword(false);
    }
  };

  const sendWelcomeMail = async () => {
    if (!customer.email) {
      toast.error('Klant heeft geen e-mailadres.');
      return;
    }
    if (!confirm(`Welkomstmail versturen naar ${customer.email}? Klant kiest zelf zijn wachtwoord via een eenmalige link (14 dagen geldig).`)) {
      return;
    }
    setSendingWelcome(true);
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}/send-welcome`, {
        method: 'POST', credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Versturen mislukt');
        return;
      }
      setWelcomeResult({
        mailSent: data.mailSent,
        mailError: data.mailError,
        email: data.email,
        setupUrl: data.setupUrl,
        expiresAt: data.expiresAt,
      });
      setCopied(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Versturen mislukt');
    } finally {
      setSendingWelcome(false);
    }
  };

  const deleteCustomer = async () => {
    const res = await fetch(`/api/admin/customers/${customer.id}`, {
      method: 'DELETE', credentials: 'include',
    });
    if (!res.ok) { toast.error('Delete failed'); return; }
    toast.success('Customer deleted');
    router.push('/admin/klanten');
  };

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/klanten"
          className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={13} /> Back to customers
        </Link>
      </div>

      <header className="mb-8 flex flex-wrap gap-4 items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted mb-2">
            Customer
          </div>
          <InlineField
            value={customer.name}
            type="text"
            onSave={(v) => updateField('name', v)}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {customer.holded_contact_id && <Badge tone="success">Holded</Badge>}
            {customer.holded_sync_failed && (
              <Badge tone="warning"><AlertTriangle size={10} /> Sync failed</Badge>
            )}
            {customer.source === 'holded_import' && <Badge tone="neutral">Imported</Badge>}
            {customer.source === 'stripe' && <Badge tone="accent">Via payment</Badge>}
            {customer.holded_synced_at && (
              <span className="text-[11px] text-text-muted tabular-nums">
                Last synced: {new Date(customer.holded_synced_at).toLocaleString('en-GB')}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <Button variant="secondary" onClick={refreshHoldedSnapshot} disabled={syncing}>
            {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Pull Holded data
          </Button>
          <Button variant="secondary" onClick={syncToHolded} disabled={syncing}>
            <RefreshCw size={14} /> Push to Holded
          </Button>
          <Button variant="secondary" onClick={sendWelcomeMail} disabled={sendingWelcome || !customer.email}>
            {sendingWelcome ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
            Stuur welkomstmail
          </Button>
          <Button variant="secondary" onClick={resetPortalPassword} disabled={resettingPassword || !customer.email}>
            {resettingPassword ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
            Reset portal-wachtwoord
          </Button>
          <Button variant="ghost" onClick={() => setConfirmingDelete(true)}>
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        {/* Contact */}
        <section className="space-y-6 self-start">
          <div className="card-surface p-5 space-y-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              Contact details
            </h2>
            <InlineField label="Email" value={customer.email} type="email" onSave={(v) => updateField('email', v)} />
            <InlineField label="Phone" value={customer.phone} type="tel" onSave={(v) => updateField('phone', v)} />
            <InlineField label="Mobile" value={customer.mobile} type="tel" onSave={(v) => updateField('mobile', v)} />
            <InlineField label="Address" value={customer.address} onSave={(v) => updateField('address', v)} />
            <div className="grid grid-cols-3 gap-3">
              <InlineField label="Postal code" value={customer.postal_code} onSave={(v) => updateField('postal_code', v)} />
              <InlineField label="City" value={customer.city} onSave={(v) => updateField('city', v)} />
              <InlineField label="Country" value={customer.country} onSave={(v) => updateField('country', v)} />
            </div>
            <InlineField label="VAT number" value={customer.vat_number} onSave={(v) => updateField('vat_number', v)} />
            <InlineField label="Notes" value={customer.notes} type="textarea" onSave={(v) => updateField('notes', v)} />
          </div>

          <HoldedDataSection customer={customer} />

          <CustomerCaravanSection customerId={customer.id} initialCaravans={initialCaravans} />
        </section>

        <div className="space-y-6">
          <RelatedSection
            icon={Refrigerator}
            title="Fridges & ACs"
            count={fridges.length}
            empty="No fridge or AC linked yet."
            action={
              <Link href={`/admin/koelkasten?customer_id=${customer.id}`}>
                <Button size="sm" variant="secondary">+ Add</Button>
              </Link>
            }
          >
            {fridges.map((f) => (
              <div key={f.id} className="px-4 py-3 hover:bg-surface-2 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium">{f.device_type}</div>
                    <div className="text-[12px] text-text-muted">
                      {f.bookings.length} {f.bookings.length === 1 ? 'period' : 'periods'}
                    </div>
                  </div>
                  <Link
                    href={`/admin/koelkasten?focus=${f.id}`}
                    className="text-[12px] text-text-muted hover:text-text underline-offset-4 hover:underline inline-flex items-center gap-1"
                  >
                    Open <ExternalLink size={11} />
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
                        <Badge tone={b.status === 'compleet' ? 'success' : 'warning'}>{b.status === 'compleet' ? 'Complete' : b.status === 'controleren' ? 'Review' : b.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </RelatedSection>

          <RelatedSection
            icon={Warehouse}
            title="Storage"
            count={stalling.length}
            empty="No storage requests."
            action={
              <Link href={`/admin/stalling?customer_id=${customer.id}`}>
                <Button size="sm" variant="secondary">+ Add</Button>
              </Link>
            }
          >
            {stalling.map((s) => (
              <div key={s.id} className="px-4 py-3 hover:bg-surface-2 transition-colors flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium capitalize">{s.type}</div>
                  <div className="text-[12px] text-text-muted">
                    From {s.start_date}{s.registration ? ` · ${s.registration}` : ''}
                  </div>
                </div>
                <Badge tone={s.status === 'akkoord' || s.status === 'betaald' ? 'success' : 'warning'}>{stallingStatusLabel(s.status)}</Badge>
              </div>
            ))}
          </RelatedSection>

          <RelatedSection
            icon={Truck}
            title="Transports"
            count={transports.length}
            empty="No transports."
            action={
              <Link href="/admin/transport">
                <Button size="sm" variant="secondary">Manage</Button>
              </Link>
            }
          >
            {transports.map((t) => (
              <div key={t.id} className="px-4 py-3 hover:bg-surface-2 transition-colors flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium truncate">{t.camping || '—'}</div>
                  <div className="text-[12px] text-text-muted">
                    {t.preferred_date ? `Outbound ${t.preferred_date}` : '—'}
                    {t.return_date ? ` · Return ${t.return_date}` : ''}
                  </div>
                </div>
                <Badge tone={t.status === 'uitgevoerd' ? 'success' : t.status === 'afgewezen' ? 'danger' : 'warning'}>{transportStatusLabel(t.status)}</Badge>
              </div>
            ))}
          </RelatedSection>

          {/* Activity */}
          <section className="card-surface overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted flex items-center gap-2">
                <Activity size={12} /> Activity
              </h2>
            </div>
            {activity === null ? (
              <div className="p-5 text-[13px] text-text-muted">Loading…</div>
            ) : activity.length === 0 ? (
              <div className="p-5 text-[13px] text-text-muted">No activity yet for this customer.</div>
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
                      {new Date(e.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
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
        title="Delete customer?"
        description={`${customer.name} will be soft-deleted. Related fridges and storage entries remain but are unlinked.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => { await deleteCustomer(); }}
        onCancel={() => setConfirmingDelete(false)}
      />

      {/* Reset-password resultaat modal — toont temp-password éénmalig
          zodat admin het kan kopiëren of doorbellen aan klant. */}
      {resetResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setResetResult(null)}
        >
          <div
            className="bg-bg border border-border rounded-[var(--radius-xl)] shadow-lg max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-medium text-text inline-flex items-center gap-2">
                <KeyRound size={18} /> Nieuw eenmalig wachtwoord
              </h2>
              <button
                type="button"
                onClick={() => setResetResult(null)}
                className="text-text-muted hover:text-text"
                aria-label="Sluiten"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[13px] text-text-muted">
              Wachtwoord voor <strong>{resetResult.email}</strong>. Dit zie je <strong>maar één keer</strong> — kopieer of mail het direct.
            </p>

            <div className="rounded-[var(--radius-md)] bg-surface-2 border border-border p-3 flex items-center justify-between gap-3">
              <code className="text-[16px] font-mono tracking-wide text-text break-all">
                {resetResult.tempPassword}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(resetResult.tempPassword);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Gekopieerd' : 'Kopiëren'}
              </Button>
            </div>

            {resetResult.mailSent ? (
              <div className="flex items-start gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-[12px] bg-success-soft text-success">
                <Mail size={13} className="mt-0.5 shrink-0" />
                <span>Welkomst-mail verstuurd naar {resetResult.email}.</span>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-[12px] bg-warning-soft text-warning">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                <span>
                  Mail niet verstuurd{resetResult.mailError ? ` (${resetResult.mailError})` : ''}.
                  Geef het wachtwoord handmatig door aan de klant.
                </span>
              </div>
            )}

            <p className="text-[12px] text-text-muted">
              Klant logt in op <code className="text-text">/account/login</code> en wordt direct naar het wachtwoord-wijzig-scherm gestuurd.
            </p>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setResetResult(null)}>Klaar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Welkomstmail-resultaat modal — toont de set-password-link zodat
          admin 'm via een ander kanaal kan delen als de mail niet aankomt. */}
      {welcomeResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setWelcomeResult(null)}
        >
          <div
            className="bg-bg border border-border rounded-[var(--radius-xl)] shadow-lg max-w-lg w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-medium text-text inline-flex items-center gap-2">
                <Mail size={18} /> Welkomstmail klaar
              </h2>
              <button
                type="button"
                onClick={() => setWelcomeResult(null)}
                className="text-text-muted hover:text-text"
                aria-label="Sluiten"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[13px] text-text-muted">
              Set-password-link voor <strong>{welcomeResult.email}</strong>. Geldig tot{' '}
              <strong>{new Date(welcomeResult.expiresAt).toLocaleString('nl-NL')}</strong>.
            </p>

            <div className="rounded-[var(--radius-md)] bg-surface-2 border border-border p-3 flex items-center justify-between gap-3">
              <code className="text-[12px] font-mono text-text break-all">
                {welcomeResult.setupUrl}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(welcomeResult.setupUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Gekopieerd' : 'Kopiëren'}
              </Button>
            </div>

            {welcomeResult.mailSent ? (
              <div className="flex items-start gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-[12px] bg-success-soft text-success">
                <Mail size={13} className="mt-0.5 shrink-0" />
                <span>Welkomstmail verstuurd naar {welcomeResult.email}.</span>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-[12px] bg-warning-soft text-warning">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                <span>
                  Mail niet verstuurd{welcomeResult.mailError ? ` (${welcomeResult.mailError})` : ''}.
                  Deel de link via WhatsApp of bel de klant.
                </span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => setWelcomeResult(null)}>Klaar</Button>
            </div>
          </div>
        </div>
      )}
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

// ─── Holded data sectie ────────────────────────────────────────────────
// Toont alle Holded-specifieke velden — custom fields (kenteken!), tags,
// billing/shipping adres, IBAN, web, secondary email. Wordt automatisch
// gevuld bij Holded-import en bijgewerkt via 'Pull Holded data'.
function HoldedDataSection({ customer }: { customer: Customer }) {
  const cf = customer.holded_custom_fields || [];
  const tags = customer.holded_tags || [];
  const billing = customer.holded_billing_address;
  const shipping = customer.holded_shipping_address;
  const hasAnything =
    cf.length > 0 || tags.length > 0 ||
    !!billing || !!shipping ||
    !!customer.holded_code || !!customer.holded_type ||
    !!customer.holded_iban || !!customer.holded_web ||
    !!customer.holded_secondary_email;

  if (!hasAnything) {
    return (
      <div className="card-surface p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-3">
          Holded data
        </h2>
        <p className="text-[13px] text-text-muted">
          {customer.holded_contact_id
            ? 'No additional Holded fields stored yet — click "Pull Holded data" to fetch the latest.'
            : 'Customer is not linked to a Holded contact.'}
        </p>
      </div>
    );
  }

  return (
    <div className="card-surface p-5 space-y-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
        Holded data
      </h2>

      {/* Identificatie */}
      <div className="grid grid-cols-2 gap-3 text-[13px]">
        {customer.holded_code && (
          <Row label="Internal code" value={customer.holded_code} />
        )}
        {customer.holded_type && (
          <Row label="Type" value={customer.holded_type} />
        )}
        {customer.holded_default_currency && (
          <Row label="Currency" value={customer.holded_default_currency} />
        )}
        {customer.holded_secondary_email && (
          <Row label="Secondary email" value={customer.holded_secondary_email} />
        )}
        {customer.holded_web && (
          <Row label="Website" value={customer.holded_web} />
        )}
        {customer.holded_iban && (
          <Row label="IBAN" value={customer.holded_iban} mono />
        )}
      </div>

      {/* Custom fields — kenteken etc. */}
      {cf.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-2">
            Custom fields
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {cf.map((f, i) => (
              <Row
                key={i}
                label={f.field || f.name || f.id || `Field ${i + 1}`}
                value={f.value || '—'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-2">
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t, i) => (
              <span
                key={i}
                className="inline-flex items-center text-[11px] font-medium text-accent bg-accent-soft border border-accent/30 rounded-full px-2 py-0.5"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Billing address */}
      {billing && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-2">
            Billing address
          </p>
          <p className="text-[13px] text-text whitespace-pre-line">
            {[
              billing.address,
              [billing.postalCode, billing.city, billing.province].filter(Boolean).join(' '),
              billing.country,
            ].filter(Boolean).join('\n') || '—'}
          </p>
        </div>
      )}

      {/* Shipping address */}
      {shipping && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-2">
            Shipping address
          </p>
          <p className="text-[13px] text-text whitespace-pre-line">
            {[
              shipping.address,
              [shipping.postalCode, shipping.city, shipping.province].filter(Boolean).join(' '),
              shipping.country,
            ].filter(Boolean).join('\n') || '—'}
          </p>
        </div>
      )}

      {customer.holded_synced_at && (
        <p className="text-[11px] text-text-subtle pt-2 border-t border-border">
          Last refreshed {new Date(customer.holded_synced_at).toLocaleString('en-GB')}
        </p>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[13px]">
      <span className="text-text-muted text-[12px]">{label}</span>
      <span className={`text-text text-right ${mono ? 'font-mono text-[12px]' : ''}`}>{value}</span>
    </div>
  );
}
