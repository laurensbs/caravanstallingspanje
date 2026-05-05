'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Receipt, FileText, ExternalLink, ChevronRight, LogOut, Loader2,
  User, Plus, KeyRound, AlertCircle,
} from 'lucide-react';
import MarketingPage from '@/components/marketing/MarketingPage';

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

function fmtEur(cents: number, currency: string): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
}
function fmtDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AccountDashboard() {
  const router = useRouter();
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
        // Eerste login? Forceer wachtwoord-wijziging — dashboard is dan
        // visueel kort zichtbaar maar functioneel disabled tot wijziging.
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

  const logout = async () => {
    await fetch('/api/account/logout', { method: 'POST', credentials: 'include' });
    router.push('/account/login');
  };

  if (loading || !customer) {
    return (
      <MarketingPage
        hero={{
          title: 'Mijn portaal',
          back: { href: '/', label: 'Caravanstalling Spanje' },
          variant: 'compact',
        }}
      >
        <section className="max-w-3xl mx-auto px-5 sm:px-6 py-8 sm:py-12 flex justify-center">
          <Loader2 className="animate-spin" style={{ color: 'var(--color-terracotta)' }} />
        </section>
      </MarketingPage>
    );
  }

  return (
    <MarketingPage
      hero={{
        title: `Welkom terug, ${customer.name.split(' ')[0]}`,
        intro: 'Bekijk je facturen, update je gegevens of start een nieuwe boeking.',
        eyebrow: 'Klantportaal',
        back: { href: '/', label: 'Caravanstalling Spanje' },
        variant: 'compact',
      }}
    >
      <section className="max-w-3xl mx-auto px-5 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Quick-actions tegels */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <Link href="/koelkast" className="mk-card mk-card-hover group p-5 block">
            <div className="mk-icon-disc mb-3"><Plus size={20} /></div>
            <h3 className="font-display" style={{ color: 'var(--color-navy)', fontSize: '1rem', fontWeight: 700, margin: '0 0 0.2rem' }}>Nieuwe boeking</h3>
            <p className="text-[13px]" style={{ color: 'var(--color-marketing-ink-soft)' }}>Koelkast of airco huren</p>
          </Link>
          <Link href="/account/gegevens" className="mk-card mk-card-hover group p-5 block">
            <div className="mk-icon-disc mb-3"><User size={20} /></div>
            <h3 className="font-display" style={{ color: 'var(--color-navy)', fontSize: '1rem', fontWeight: 700, margin: '0 0 0.2rem' }}>Mijn gegevens</h3>
            <p className="text-[13px]" style={{ color: 'var(--color-marketing-ink-soft)' }}>Adres, telefoon, BTW</p>
          </Link>
          <Link href="/account/wachtwoord-wijzigen" className="mk-card mk-card-hover group p-5 block">
            <div className="mk-icon-disc mb-3"><KeyRound size={20} /></div>
            <h3 className="font-display" style={{ color: 'var(--color-navy)', fontSize: '1rem', fontWeight: 700, margin: '0 0 0.2rem' }}>Wachtwoord</h3>
            <p className="text-[13px]" style={{ color: 'var(--color-marketing-ink-soft)' }}>Wijzig wachtwoord</p>
          </Link>
        </motion.div>

        {/* Facturen-lijst */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mk-card p-5 sm:p-7"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt size={16} style={{ color: 'var(--color-terracotta-deep)' }} />
              <h2 className="font-display" style={{ color: 'var(--color-navy)', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Facturen & betalingen
              </h2>
            </div>
            <span className="text-[12px]" style={{ color: 'var(--color-marketing-ink-soft)' }}>
              {invoices?.length ?? 0} {invoices?.length === 1 ? 'factuur' : 'facturen'}
            </span>
          </div>

          {invoices === null ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin" style={{ color: 'var(--color-marketing-ink-soft)' }} />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={32} className="mx-auto mb-2" style={{ color: 'var(--color-marketing-ink-soft)', opacity: 0.5 }} />
              <p className="text-[14px]" style={{ color: 'var(--color-marketing-ink-soft)' }}>
                Nog geen facturen.
              </p>
              <p className="text-[12px] mt-1" style={{ color: 'var(--color-marketing-ink-soft)' }}>
                Zodra je een betaling doet verschijnen ze hier automatisch.
              </p>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: 'var(--color-marketing-line)' }}>
              {invoices.map((inv) => (
                <li key={inv.id} className="py-3.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium tabular-nums" style={{ color: 'var(--color-marketing-ink)' }}>
                        {inv.number || inv.id.slice(0, 12)}
                      </span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-marketing-ink-soft)' }}>
                      {fmtDate(inv.created)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-medium tabular-nums" style={{ color: 'var(--color-marketing-ink)' }}>
                      {fmtEur(inv.amount_paid, inv.currency)}
                    </span>
                    {inv.hosted_invoice_url && (
                      <a
                        href={inv.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[13px] font-medium hover:underline"
                        style={{ color: 'var(--color-terracotta-deep)' }}
                      >
                        Bekijk <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Logout-knop onder */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-marketing-ink-soft)' }}
          >
            <LogOut size={14} /> Uitloggen
          </button>
        </div>
      </section>
    </MarketingPage>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null;
  const map: Record<string, { label: string; bg: string; color: string; icon?: typeof ChevronRight }> = {
    paid: { label: 'Betaald', bg: 'var(--color-terracotta-soft)', color: 'var(--color-terracotta-deep)' },
    open: { label: 'Open', bg: 'rgba(255,180,80,0.18)', color: '#9a6a08', icon: AlertCircle },
    void: { label: 'Vervallen', bg: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.5)' },
    draft: { label: 'Concept', bg: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.5)' },
    uncollectible: { label: 'Niet inbaar', bg: 'rgba(220,38,38,0.10)', color: '#dc2626' },
  };
  const m = map[status] || { label: status, bg: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.55)' };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-[0.05em]"
      style={{ background: m.bg, color: m.color }}
    >
      {m.label}
    </span>
  );
}
