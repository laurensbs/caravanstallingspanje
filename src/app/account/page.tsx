'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Receipt, ChevronRight, Loader2, Caravan, Calendar, Camera, AlertCircle,
  Wrench, Sparkles, ClipboardCheck, ArrowRight, Activity,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AccountLayout from '@/components/account/AccountLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { StringKey } from '@/lib/i18n';

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  vat_number: string | null;
  mustChangePassword: boolean;
};

type Invoice = {
  id: string;
  number: string | null;
  amount_paid: number;
  currency: string;
  status: string | null;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  created: number;
};

export default function AccountDashboard() {
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

  if (loading || !customer) {
    return (
      <AccountLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin" style={{ color: 'var(--muted)' }} />
        </div>
      </AccountLayout>
    );
  }

  const firstName = customer.name.split(' ')[0];
  const openInvoices = (invoices || []).filter((i) => i.status === 'open');
  const paidCount = (invoices || []).filter((i) => i.status === 'paid').length;

  return (
    <AccountLayout customerName={customer.name} customerEmail={customer.email}>
      {/* Welkom-header */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <span className="eyebrow-mk">{t('pt1.brand')}</span>
        <h1 className="h2-mk" style={{ marginTop: 4, fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)' }}>
          {t('pt1.db-welcome', firstName)}
        </h1>
        <p className="lead-mk" style={{ marginTop: 8, fontSize: 15 }}>
          {t('pt1.db-sub')}
        </p>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Caravan card */}
          <CaravanCard t={t} />

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile labelKey="pt1.db-stat-1-l" value={t('pt1.db-stat-1-v')} accent="green" />
            <StatTile labelKey="pt1.db-stat-2-l" value="—" accent="muted" />
            <StatTile labelKey="pt1.db-stat-3-l" value={String(openInvoices.length)} accent={openInvoices.length > 0 ? 'orange' : 'muted'} />
            <StatTile labelKey="pt1.db-stat-4-l" value={String(paidCount)} accent="muted" />
          </div>

          {/* Geplande afspraken */}
          <Appointments t={t} />

          {/* Recente activiteit */}
          <Activity_Section t={t} invoices={invoices || []} />
        </div>

        <aside className="space-y-6">
          <QuickActions t={t} />
          <RecentInvoices t={t} invoices={invoices || []} />
        </aside>
      </div>
    </AccountLayout>
  );
}

type T = (k: StringKey, ...a: (string | number)[]) => string;

function StatTile({
  labelKey, value, accent,
}: {
  labelKey: StringKey;
  value: string;
  accent: 'green' | 'orange' | 'muted';
}) {
  const { t } = useLocale();
  const accentColor = accent === 'green' ? 'var(--green)' : accent === 'orange' ? 'var(--orange-d)' : 'var(--muted)';
  return (
    <div className="card-mk" style={{ padding: 18 }}>
      <div style={{ fontSize: 11.5, fontFamily: 'var(--sora)', fontWeight: 600, color: 'var(--muted)', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>
        {t(labelKey)}
      </div>
      <div style={{ fontFamily: 'var(--sora)', fontWeight: 700, fontSize: 22, color: accentColor }}>{value}</div>
    </div>
  );
}

function CaravanCard({ t }: { t: T }) {
  return (
    <Link
      href="/account/caravan"
      className="card-mk card-lift block"
      style={{ padding: 24, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 18 }}
    >
      <span
        aria-hidden
        style={{
          width: 76, height: 76, borderRadius: 14,
          background: 'linear-gradient(135deg, var(--sky) 0%, #BFE7FD 100%)',
          color: 'var(--navy)',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}
      >
        <Caravan size={38} aria-hidden />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--sora)', fontWeight: 600, color: 'var(--muted)', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 4 }}>
          {t('pt1.db-caravan-h3')}
        </div>
        <div style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 17, color: 'var(--navy)' }}>
          Hobby De Luxe 460 LU
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
          Plek B-12 · Buitenstalling · Sinds 2021
        </div>
      </div>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--orange-d)', fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
        {t('pt1.db-caravan-cta')} <ChevronRight size={14} aria-hidden />
      </span>
    </Link>
  );
}

function Appointments({ t }: { t: T }) {
  return (
    <div className="card-mk" style={{ padding: 24 }}>
      <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
        <Calendar size={16} style={{ color: 'var(--orange)' }} aria-hidden />
        <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 16, color: 'var(--navy)', margin: 0 }}>
          {t('pt1.db-appoint-h3')}
        </h2>
      </div>
      <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 13.5, color: 'var(--muted)' }}>
        {t('pt1.db-appoint-empty')}
      </div>
    </div>
  );
}

function QuickActions({ t }: { t: T }) {
  const items: Array<{ icon: LucideIcon; labelKey: StringKey; href: string }> = [
    { icon: Wrench, labelKey: 'pt1.db-quick-1', href: '/diensten/reparatie' },
    { icon: Sparkles, labelKey: 'pt1.db-quick-2', href: '/diensten/service' },
    { icon: ClipboardCheck, labelKey: 'pt1.db-quick-3', href: '/diensten/inspectie' },
    { icon: Calendar, labelKey: 'pt1.db-quick-4', href: '/reserveren/configurator' },
  ];
  return (
    <div className="card-mk" style={{ padding: 24 }}>
      <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 14px' }}>
        {t('pt1.db-quick-h3')}
      </h2>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(({ icon: Icon, labelKey, href }) => (
          <li key={href}>
            <Link
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8,
                fontSize: 13.5, color: 'var(--ink-2)',
                textDecoration: 'none', fontFamily: 'var(--inter)',
                transition: 'background 0.15s',
              }}
              className="hover:bg-[color:var(--bg)]"
            >
              <Icon size={15} aria-hidden style={{ color: 'var(--orange)', flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{t(labelKey)}</span>
              <ArrowRight size={13} aria-hidden style={{ color: 'var(--muted)' }} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecentInvoices({ t, invoices }: { t: T; invoices: Invoice[] }) {
  const recent = invoices.slice(0, 3);
  return (
    <div className="card-mk" style={{ padding: 24 }}>
      <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
        <Receipt size={15} style={{ color: 'var(--orange)' }} aria-hidden />
        <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: 0 }}>
          {t('pt1.nav-invoices')}
        </h2>
      </div>
      {recent.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.55 }}>{t('pt1.inv-empty')}</p>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recent.map((inv) => (
            <li key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
              <span style={{ color: 'var(--ink)', fontFamily: 'var(--sora)', fontWeight: 600 }}>
                {inv.number || inv.id.slice(0, 8)}
              </span>
              <span style={{ color: 'var(--ink-2)', fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 12.5 }}>
                {fmtEur(inv.amount_paid, inv.currency)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/account/facturen"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          marginTop: 12, color: 'var(--orange-d)',
          fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 13, textDecoration: 'none',
        }}
      >
        Alle facturen <ArrowRight size={13} aria-hidden />
      </Link>
    </div>
  );
}

function Activity_Section({ t, invoices }: { t: T; invoices: Invoice[] }) {
  // Use invoices as proxy for activity-feed
  const activity = invoices.slice(0, 5);
  return (
    <div className="card-mk" style={{ padding: 24 }}>
      <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
        <Activity size={16} style={{ color: 'var(--orange)' }} aria-hidden />
        <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 16, color: 'var(--navy)', margin: 0 }}>
          {t('pt1.db-activity-h3')}
        </h2>
      </div>
      {activity.length === 0 ? (
        <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 13.5, color: 'var(--muted)' }}>
          {t('pt1.db-activity-empty')}
        </div>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
          {activity.map((inv) => (
            <li
              key={inv.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0', borderBottom: '1px solid var(--line)',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 32, height: 32, borderRadius: 999,
                  background: inv.status === 'paid' ? 'var(--green-soft)' : 'var(--bg)',
                  color: inv.status === 'paid' ? 'var(--green)' : 'var(--muted)',
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                  border: inv.status === 'paid' ? 'none' : '1px solid var(--line)',
                }}
              >
                <Receipt size={14} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: 'var(--ink)' }}>
                  Factuur {inv.number || inv.id.slice(0, 8)} {inv.status === 'paid' ? 'betaald' : 'aangemaakt'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{fmtDate(inv.created)}</div>
              </div>
              <span style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 13, color: 'var(--ink)', flexShrink: 0 }}>
                {fmtEur(inv.amount_paid, inv.currency)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function fmtEur(cents: number, currency: string): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
}

function fmtDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' });
}
