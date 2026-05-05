'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Loader2, Caravan as CaravanIcon, ShieldCheck, Calendar, FileText, Camera,
  Wrench, ClipboardCheck, Sparkles, Download,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AccountLayout from '@/components/account/AccountLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { StringKey } from '@/lib/i18n';

type Customer = {
  id: number;
  name: string;
  email: string;
  mustChangePassword: boolean;
};

type Tab = 'overview' | 'history' | 'docs' | 'photos';
type T = (k: StringKey, ...a: (string | number)[]) => string;

export default function MijnCaravanPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/account/me', { credentials: 'include' });
        if (res.status === 401) { router.push('/account/login'); return; }
        const data = await res.json();
        if (!alive) return;
        setCustomer(data.customer);
        if (data.customer.mustChangePassword) {
          router.push('/account/wachtwoord-wijzigen?first=1');
          return;
        }
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

  const tabs: Array<{ id: Tab; labelKey: StringKey }> = [
    { id: 'overview', labelKey: 'pt1.cv-tab-overview' },
    { id: 'history', labelKey: 'pt1.cv-tab-history' },
    { id: 'docs', labelKey: 'pt1.cv-tab-docs' },
    { id: 'photos', labelKey: 'pt1.cv-tab-photos' },
  ];

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
          {t('pt1.cv-h1')}
        </h1>
      </motion.header>

      {/* Header-card */}
      <div className="card-mk card-lift" style={{ padding: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <span
          aria-hidden
          style={{
            width: 76, height: 76, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--sky) 0%, #BFE7FD 100%)',
            color: 'var(--navy)',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}
        >
          <CaravanIcon size={38} aria-hidden />
        </span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 19, color: 'var(--navy)' }}>
            Hobby De Luxe 460 LU
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            Bouwjaar 2019 · Lengte 6,5 m · Kenteken WL-AB-12
          </div>
        </div>
        <span className="tag-mk green">
          <ShieldCheck size={11} /> Verzekerd
        </span>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--line)', marginBottom: 22, overflowX: 'auto' }}>
        <ul style={{ display: 'flex', gap: 4, listStyle: 'none', margin: 0, padding: 0 }}>
          {tabs.map((tb) => {
            const active = tab === tb.id;
            return (
              <li key={tb.id} style={{ flex: '0 0 auto' }}>
                <button
                  type="button"
                  onClick={() => setTab(tb.id)}
                  style={{
                    fontFamily: 'var(--sora)', fontWeight: active ? 600 : 500, fontSize: 13.5,
                    color: active ? 'var(--navy)' : 'var(--muted)',
                    padding: '12px 18px', background: 'none', border: 'none', cursor: 'pointer',
                    borderBottom: active ? '2px solid var(--orange)' : '2px solid transparent',
                    marginBottom: -1,
                    whiteSpace: 'nowrap',
                  }}
                  aria-pressed={active}
                >
                  {t(tb.labelKey)}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {tab === 'overview' && <OverviewTab t={t} />}
      {tab === 'history' && <HistoryTab t={t} />}
      {tab === 'docs' && <DocsTab t={t} />}
      {tab === 'photos' && <PhotosTab t={t} />}
    </AccountLayout>
  );
}

function OverviewTab({ t }: { t: T }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-6">
        {/* Specs */}
        <div className="card-mk" style={{ padding: 24 }}>
          <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 16, color: 'var(--navy)', margin: '0 0 16px' }}>
            Specificaties
          </h2>
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px 24px', fontSize: 13.5 }}>
            <SpecRow k={t('pt1.cv-spec-brand')} v="Hobby" />
            <SpecRow k={t('pt1.cv-spec-model')} v="De Luxe 460 LU" />
            <SpecRow k={t('pt1.cv-spec-year')} v="2019" />
            <SpecRow k={t('pt1.cv-spec-length')} v="6,5 m" />
            <SpecRow k={t('pt1.cv-spec-reg')} v="WL-AB-12" />
          </dl>
        </div>

        {/* Stallingplek met SVG-plattegrond */}
        <div className="card-mk" style={{ padding: 24 }}>
          <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 16, color: 'var(--navy)', margin: '0 0 16px' }}>
            {t('pt1.cv-spot-h3')}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <span
              aria-hidden
              style={{
                width: 86, height: 86, borderRadius: 12,
                background: 'var(--sky-soft)',
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--sora)', fontWeight: 800, fontSize: 28,
                color: 'var(--navy)',
                border: '2px solid var(--sky)',
              }}
            >
              B-12
            </span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 15, color: 'var(--navy)', marginBottom: 4 }}>
                Buitenstalling — Sectie B
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                Toegankelijk via hoofdpoort, links na de werkplaats
              </div>
            </div>
            <SpotMapSvg />
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        {/* Contract */}
        <div className="card-mk" style={{ padding: 22 }}>
          <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 12px' }}>
            {t('pt1.cv-contract-h3')}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0' }}>
            <span style={{ color: 'var(--muted)' }}>{t('pt1.cv-contract-since')}</span>
            <span style={{ color: 'var(--ink)', fontFamily: 'var(--sora)', fontWeight: 600 }}>2021</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0' }}>
            <span style={{ color: 'var(--muted)' }}>{t('pt1.cv-contract-renew')}</span>
            <span style={{ color: 'var(--ink)', fontFamily: 'var(--sora)', fontWeight: 600 }}>1 jan 2027</span>
          </div>
        </div>

        {/* Insurance */}
        <div className="card-mk" style={{ padding: 22 }}>
          <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 12px' }}>
            {t('pt1.cv-insurance-h3')}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
            <ShieldCheck size={18} style={{ color: 'var(--green)' }} aria-hidden />
            <div>
              <div style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 13.5, color: 'var(--navy)' }}>Securitas Direct</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('pt1.cv-insurance-cover')}</div>
            </div>
          </div>
        </div>

        {/* Documenten */}
        <div className="card-mk" style={{ padding: 22 }}>
          <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 12px' }}>
            {t('pt1.cv-doc-h3')}
          </h3>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <DocLink label="Stalling-contract 2026" />
            <DocLink label="Verzekerings-polis" />
          </ul>
        </div>
      </aside>
    </div>
  );
}

function HistoryTab({ t }: { t: T }) {
  // Mock-historie tot DB-koppeling
  const history: Array<{ icon: LucideIcon; date: string; title: string; desc: string; status: 'done' | 'planned' }> = [
    { icon: Sparkles, date: '12 mrt 2026', title: 'Volledige schoonmaak', desc: 'Buiten + interieur + ramen', status: 'done' },
    { icon: ClipboardCheck, date: '01 mrt 2026', title: 'Voorseizoen-inspectie', desc: '25-punts check uitgevoerd', status: 'done' },
    { icon: Wrench, date: '14 nov 2025', title: 'Dakreparatie', desc: 'Kleine lekkage rechts achter, opnieuw gekit', status: 'done' },
  ];
  if (history.length === 0) {
    return <div className="card-mk text-center" style={{ padding: 40, color: 'var(--muted)', fontSize: 14 }}>{t('pt1.cv-history-empty')}</div>;
  }
  return (
    <div className="card-mk" style={{ padding: 24 }}>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', position: 'relative' }}>
        {history.map((h, i) => (
          <li key={i} style={{ display: 'flex', gap: 14, paddingBottom: 22, position: 'relative' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <span
                aria-hidden
                style={{
                  width: 36, height: 36, borderRadius: 999,
                  background: 'var(--green-soft)', color: 'var(--green)',
                  display: 'grid', placeItems: 'center',
                }}
              >
                <h.icon size={16} />
              </span>
              {i < history.length - 1 && (
                <span aria-hidden style={{ position: 'absolute', top: 38, bottom: -22, left: '50%', width: 2, background: 'var(--line)' }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--sora)', fontWeight: 600, letterSpacing: 0.4 }}>{h.date}</div>
              <div style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 15, color: 'var(--navy)', margin: '2px 0 4px' }}>{h.title}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>{h.desc}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DocsTab({ t }: { t: T }) {
  return (
    <div className="card-mk" style={{ padding: 24 }}>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <DocLink label="Stalling-contract 2026" detail="PDF · 240 KB" />
        <DocLink label="Verzekerings-polis" detail="PDF · 1.1 MB" />
        <DocLink label="Inspectierapport · 01 mrt 2026" detail="PDF · 3.4 MB" />
      </ul>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 16 }}>{t('pt1.cv-docs-empty').includes('Nog') ? '' : ''}</p>
    </div>
  );
}

function PhotosTab({ t }: { t: T }) {
  return (
    <div className="card-mk text-center" style={{ padding: 40 }}>
      <Camera size={32} style={{ margin: '0 auto 10px', color: 'var(--muted)', opacity: 0.5 }} aria-hidden />
      <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>{t('pt1.cv-photos-empty')}</p>
    </div>
  );
}

function SpotMapSvg() {
  return (
    <svg viewBox="0 0 220 130" width="180" height="106" role="img" aria-label="Plattegrond stalling-terrein">
      <rect x="2" y="2" width="216" height="126" rx="6" fill="#F8FBFD" stroke="#2F4254" strokeWidth="1.5" />
      {/* gates */}
      <rect x="6" y="56" width="2" height="20" fill="#F9AD36" />
      {/* sections */}
      <text x="40" y="20" fontFamily="var(--sora)" fontSize="9" fontWeight="600" fill="#2F4254">A</text>
      <text x="100" y="20" fontFamily="var(--sora)" fontSize="9" fontWeight="600" fill="#2F4254">B</text>
      <text x="160" y="20" fontFamily="var(--sora)" fontSize="9" fontWeight="600" fill="#2F4254">C</text>
      {/* B section grid */}
      <g>
        {Array.from({ length: 16 }).map((_, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const isOurs = i === 11; // B-12 (0-indexed 11)
          return (
            <rect
              key={i}
              x={70 + col * 18}
              y={30 + row * 18}
              width={14}
              height={14}
              rx={2}
              fill={isOurs ? '#F9AD36' : '#E5F3FB'}
              stroke="#2F4254"
              strokeWidth="0.8"
            />
          );
        })}
      </g>
      {/* path */}
      <path d="M40 110 H180" stroke="#2F4254" strokeWidth="1" strokeDasharray="3 3" />
      <text x="135" y="124" fontFamily="var(--sora)" fontSize="8" fill="#2F4254" opacity="0.6">jouw plek</text>
    </svg>
  );
}

function SpecRow({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt style={{ color: 'var(--muted)', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, fontFamily: 'var(--sora)', fontWeight: 600, marginBottom: 4 }}>{k}</dt>
      <dd style={{ color: 'var(--ink)', margin: 0, fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 14 }}>{v}</dd>
    </div>
  );
}

function DocLink({ label, detail }: { label: string; detail?: string }) {
  return (
    <li>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 12px', borderRadius: 8,
          background: 'var(--bg)',
          textDecoration: 'none',
          fontSize: 13.5, color: 'var(--ink)',
        }}
      >
        <FileText size={15} aria-hidden style={{ color: 'var(--orange)', flexShrink: 0 }} />
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontFamily: 'var(--sora)', fontWeight: 600, color: 'var(--navy)' }}>{label}</span>
          {detail && <span style={{ display: 'block', fontSize: 11.5, color: 'var(--muted)', marginTop: 1 }}>{detail}</span>}
        </span>
        <Download size={14} aria-hidden style={{ color: 'var(--muted)' }} />
      </a>
    </li>
  );
}
