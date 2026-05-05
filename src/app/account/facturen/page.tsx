'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Loader2, Download, ExternalLink, AlertCircle, CreditCard, Receipt,
} from 'lucide-react';
import AccountLayout from '@/components/account/AccountLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { StringKey } from '@/lib/i18n';

type Customer = {
  id: number;
  name: string;
  email: string;
  mustChangePassword: boolean;
};

type Invoice = {
  id: string;
  number: string | null;
  amount_paid: number;
  amount_due?: number;
  currency: string;
  status: string | null;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  created: number;
};

type T = (k: StringKey, ...a: (string | number)[]) => string;

export default function FacturenPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const meRes = await fetch('/api/account/me', { credentials: 'include' });
        if (meRes.status === 401) { router.push('/account/login'); return; }
        const me = await meRes.json();
        if (!alive) return;
        setCustomer(me.customer);
        if (me.customer.mustChangePassword) {
          router.push('/account/wachtwoord-wijzigen?first=1');
          return;
        }
        const invRes = await fetch('/api/account/invoices', { credentials: 'include' });
        const inv = await invRes.json();
        if (!alive) return;
        setInvoices(inv.invoices || []);
      } catch {
        if (alive) router.push('/account/login');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [router]);

  const kpis = useMemo(() => {
    const list = invoices || [];
    const thisYear = new Date().getFullYear();
    const ofYear = list.filter((i) => new Date(i.created * 1000).getFullYear() === thisYear);
    const total = ofYear.reduce((sum, i) => sum + i.amount_paid, 0);
    const paid = ofYear.filter((i) => i.status === 'paid').length;
    const open = ofYear.filter((i) => i.status === 'open').length;
    const late = ofYear.filter((i) => i.status === 'uncollectible').length;
    return { total, currency: list[0]?.currency || 'eur', paid, open, late };
  }, [invoices]);

  if (loading || !customer) {
    return (
      <AccountLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin" style={{ color: 'var(--muted)' }} />
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout customerName={customer.name} customerEmail={customer.email}>
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <span className="eyebrow-mk">{t('pt1.brand')}</span>
        <h1 className="h2-mk" style={{ marginTop: 4, fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)' }}>
          {t('pt1.inv-h1')}
        </h1>
      </motion.header>

      {/* KPI tegels */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiTile labelKey="pt1.inv-kpi-total" value={fmtEur(kpis.total, kpis.currency)} accent="navy" />
        <KpiTile labelKey="pt1.inv-kpi-paid" value={String(kpis.paid)} accent="green" />
        <KpiTile labelKey="pt1.inv-kpi-open" value={String(kpis.open)} accent={kpis.open > 0 ? 'orange' : 'muted'} />
        <KpiTile labelKey="pt1.inv-kpi-late" value={String(kpis.late)} accent={kpis.late > 0 ? 'red' : 'muted'} />
      </div>

      {/* Open-invoice banner */}
      {kpis.open > 0 && (
        <div
          role="alert"
          style={{
            background: '#FFF7E5',
            border: '1px solid #F9AD36',
            color: '#8A5C00',
            padding: 16,
            borderRadius: 12,
            marginBottom: 22,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0, color: 'var(--orange-d)' }} />
          <div style={{ flex: 1, fontSize: 13.5 }}>
            <strong>Je hebt {kpis.open} openstaande factu{kpis.open === 1 ? 'ur' : 'ren'}.</strong>{' '}
            Klik op een rij hieronder om direct te betalen.
          </div>
        </div>
      )}

      {/* Invoice tabel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="tbl-wrap-mk">
          {!invoices || invoices.length === 0 ? (
            <div className="text-center" style={{ padding: 40 }}>
              <Receipt size={32} style={{ margin: '0 auto 10px', color: 'var(--muted)', opacity: 0.5 }} aria-hidden />
              <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>{t('pt1.inv-empty')}</p>
            </div>
          ) : (
            <table className="tbl-mk">
              <thead>
                <tr>
                  <th>{t('pt1.inv-tbl-num')}</th>
                  <th>{t('pt1.inv-tbl-date')}</th>
                  <th style={{ textAlign: 'right' }}>{t('pt1.inv-tbl-amount')}</th>
                  <th>{t('pt1.inv-tbl-status')}</th>
                  <th style={{ textAlign: 'right' }}>{t('pt1.inv-tbl-pdf')}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: 'var(--sora)', fontWeight: 600, color: 'var(--navy)' }}>
                      {inv.number || inv.id.slice(0, 10)}
                    </td>
                    <td>{fmtDate(inv.created)}</td>
                    <td className="price" style={{ textAlign: 'right' }}>{fmtEur(inv.amount_paid, inv.currency)}</td>
                    <td><StatusPill status={inv.status} t={t} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        {inv.invoice_pdf && (
                          <a
                            href={inv.invoice_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--orange-d)' }}
                            title="PDF downloaden"
                          >
                            <Download size={15} />
                          </a>
                        )}
                        {inv.hosted_invoice_url && (
                          <a
                            href={inv.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--muted)' }}
                            title="In browser bekijken"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Betaalmethode-card */}
        <aside>
          <div className="card-mk" style={{ padding: 22 }}>
            <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 14px' }}>
              {t('pt1.inv-pay-method-h3')}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
              <span aria-hidden style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--sky-soft)', color: 'var(--navy)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <CreditCard size={16} />
              </span>
              <div>
                <div style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 13.5, color: 'var(--navy)' }}>iDEAL · SEPA</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>via Stripe</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.55, marginTop: 12 }}>
              {t('pt1.inv-pay-method-info')}
            </p>
          </div>
        </aside>
      </div>
    </AccountLayout>
  );
}

function KpiTile({
  labelKey, value, accent,
}: {
  labelKey: StringKey;
  value: string;
  accent: 'navy' | 'green' | 'orange' | 'red' | 'muted';
}) {
  const { t } = useLocale();
  const color = accent === 'navy' ? 'var(--navy)'
    : accent === 'green' ? 'var(--green)'
    : accent === 'orange' ? 'var(--orange-d)'
    : accent === 'red' ? 'var(--red)'
    : 'var(--muted)';
  return (
    <div className="card-mk" style={{ padding: 18 }}>
      <div style={{ fontSize: 11.5, fontFamily: 'var(--sora)', fontWeight: 600, color: 'var(--muted)', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>
        {t(labelKey)}
      </div>
      <div style={{ fontFamily: 'var(--sora)', fontWeight: 700, fontSize: 22, color }}>{value}</div>
    </div>
  );
}

function StatusPill({ status, t }: { status: string | null; t: T }) {
  const map: Record<string, { labelKey: StringKey; cls: string }> = {
    paid: { labelKey: 'pt1.inv-status-paid', cls: 'tag-mk green' },
    open: { labelKey: 'pt1.inv-status-open', cls: 'tag-mk orange' },
    uncollectible: { labelKey: 'pt1.inv-status-late', cls: 'tag-mk' },
  };
  const m = map[status || ''];
  if (!m) return <span style={{ fontSize: 12, color: 'var(--muted)' }}>{status || '—'}</span>;
  return (
    <span
      className={m.cls}
      style={m.cls === 'tag-mk' ? { background: 'rgba(194,69,69,0.10)', color: 'var(--red)' } : undefined}
    >
      {t(m.labelKey)}
    </span>
  );
}

function fmtEur(cents: number, currency: string): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
}

function fmtDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' });
}
