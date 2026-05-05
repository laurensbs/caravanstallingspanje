'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Phone, Tag } from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import { useLocale } from '@/components/LocaleProvider';
import type { StringKey } from '@/lib/i18n';

const EASE = [0.16, 1, 0.3, 1] as const;
type T = (k: StringKey, ...a: (string | number)[]) => string;

type StockKind = 'caravan' | 'camper';
type StockStatus = 'available' | 'new' | 'reserved' | 'sold';

type StockItem = {
  id: string;
  brand: string;
  model: string;
  year: number;
  km: number | null;
  price: string;
  kind: StockKind;
  status: StockStatus;
};

// Mock-data — 12 items. Prijzen indicatief; later vervangen door DB-tabel.
const STOCK: StockItem[] = [
  { id: '01', brand: 'Hobby',     model: 'De Luxe 460 LU',     year: 2019, km: null,   price: '€16.450', kind: 'caravan', status: 'new' },
  { id: '02', brand: 'Adria',     model: 'Altea 522 PK',       year: 2017, km: null,   price: '€13.900', kind: 'caravan', status: 'available' },
  { id: '03', brand: 'Knaus',     model: 'Sport 540 KD',       year: 2020, km: null,   price: '€18.250', kind: 'caravan', status: 'available' },
  { id: '04', brand: 'Bürstner',  model: 'Premio 530 TK',      year: 2016, km: null,   price: '€11.500', kind: 'caravan', status: 'reserved' },
  { id: '05', brand: 'Hymer',     model: 'B-Class ML-T 580',   year: 2018, km: 64500,  price: '€59.900', kind: 'camper',  status: 'available' },
  { id: '06', brand: 'Pilote',    model: 'P 696 GJ',           year: 2021, km: 28000,  price: '€72.500', kind: 'camper',  status: 'new' },
  { id: '07', brand: 'Fendt',     model: 'Bianco Activ 465 SF',year: 2019, km: null,   price: '€17.250', kind: 'caravan', status: 'available' },
  { id: '08', brand: 'LMC',       model: 'Style 460 D',        year: 2015, km: null,   price: '€9.900',  kind: 'caravan', status: 'available' },
  { id: '09', brand: 'Knaus',     model: 'Sky Wave 700 MEG',   year: 2017, km: 89000,  price: '€48.900', kind: 'camper',  status: 'sold' },
  { id: '10', brand: 'Tabbert',   model: 'Da Vinci 490 DM',    year: 2022, km: null,   price: '€22.500', kind: 'caravan', status: 'new' },
  { id: '11', brand: 'Adria',     model: 'Sonic Plus I 700 SC',year: 2020, km: 45000,  price: '€68.900', kind: 'camper',  status: 'available' },
  { id: '12', brand: 'Eriba',     model: 'Touring Troll 542',  year: 2018, km: null,   price: '€19.500', kind: 'caravan', status: 'available' },
];

export default function VerkoopPage() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1">
        <Hero t={t} />
        <Stock t={t} />
        <Intake t={t} />
      </main>
      <PublicFooter />
    </div>
  );
}

function Hero({ t }: { t: T }) {
  const reduce = useReducedMotion();
  const fade = (delay = 0) =>
    reduce
      ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: EASE, delay } };

  return (
    <section className="section-bg-sky-soft">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-14 sm:py-20">
        <div className="max-w-[820px]">
          <motion.span {...fade(0)} className="eyebrow-mk">{t('sal1.hero-eyebrow')}</motion.span>
          <motion.h1 {...fade(0.06)} className="h1-mk" style={{ marginTop: 4 }}>{t('sal1.hero-h1')}</motion.h1>
          <motion.p {...fade(0.14)} className="lead-mk" style={{ marginTop: 14, maxWidth: 700 }}>{t('sal1.hero-lead')}</motion.p>
        </div>
      </div>
    </section>
  );
}

function Stock({ t }: { t: T }) {
  const [filter, setFilter] = useState<'all' | StockKind>('all');
  const items = useMemo(() => {
    if (filter === 'all') return STOCK;
    return STOCK.filter((s) => s.kind === filter);
  }, [filter]);

  const filters: Array<{ key: 'all' | StockKind; labelKey: StringKey }> = [
    { key: 'all', labelKey: 'sal1.filter-all' },
    { key: 'caravan', labelKey: 'sal1.filter-caravan' },
    { key: 'camper', labelKey: 'sal1.filter-camper' },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="mb-8 flex items-center gap-2 flex-wrap">
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className="press-spring"
                style={{
                  fontFamily: 'var(--sora)',
                  fontWeight: 600,
                  fontSize: 13,
                  padding: '8px 16px',
                  borderRadius: 999,
                  border: active ? '1px solid var(--navy)' : '1px solid var(--line)',
                  background: active ? 'var(--navy)' : '#fff',
                  color: active ? '#fff' : 'var(--ink-2)',
                  cursor: 'pointer',
                }}
                aria-pressed={active}
              >
                {t(f.labelKey)}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((s) => (
            <StockCard key={s.id} item={s} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StockCard({ item, t }: { item: StockItem; t: T }) {
  const statusTag: { keyL: StringKey | null; cls: string } = (() => {
    switch (item.status) {
      case 'new': return { keyL: 'sal1.tag-new', cls: 'tag-mk orange' };
      case 'reserved': return { keyL: 'sal1.tag-reserved', cls: 'tag-mk' };
      case 'sold': return { keyL: 'sal1.tag-sold', cls: 'tag-mk navy' };
      default: return { keyL: 'sal1.tag-checked', cls: 'tag-mk green' };
    }
  })();
  const sold = item.status === 'sold';

  return (
    <article
      className="card-mk relative"
      style={{
        padding: 0,
        overflow: 'hidden',
        opacity: sold ? 0.6 : 1,
      }}
    >
      <div
        aria-hidden
        style={{
          aspectRatio: '4 / 3',
          background: 'linear-gradient(160deg, #E5F3FB 0%, #95D8FD 70%, #F2DDB6 100%)',
          position: 'relative',
        }}
      >
        <CaravanThumbSvg kind={item.kind} />
        {statusTag.keyL && (
          <span
            className={statusTag.cls}
            style={{ position: 'absolute', top: 14, left: 14 }}
          >
            {t(statusTag.keyL)}
          </span>
        )}
      </div>
      <div style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
          <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 17, color: 'var(--navy)', margin: 0 }}>
            {item.brand} {item.model}
          </h3>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14 }}>
          {item.year} {item.km !== null ? ` · ${item.km.toLocaleString('nl-NL')} km` : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span className="display-num" style={{ fontSize: 24, lineHeight: 1, color: 'var(--navy)' }}>
            {item.price}
          </span>
          <Link
            href={`/contact?subject=Voorraad ${item.id}`}
            className="btn btn-ghost"
            style={{ pointerEvents: sold ? 'none' : 'auto' }}
          >
            {t('sal1.cta-detail')} <ArrowRight size={13} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

function CaravanThumbSvg({ kind }: { kind: StockKind }) {
  if (kind === 'camper') {
    return (
      <svg viewBox="0 0 240 180" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden style={{ position: 'absolute', inset: 0 }}>
        <g transform="translate(34,80)">
          <rect width="170" height="60" rx="10" fill="#FFFFFF" stroke="#2F4254" strokeWidth="2" />
          <rect x="0" y="0" width="40" height="36" rx="6" fill="#FFFFFF" stroke="#2F4254" strokeWidth="2" />
          <rect x="46" y="8" width="36" height="22" rx="3" fill="#95D8FD" stroke="#2F4254" strokeWidth="1.5" />
          <rect x="92" y="8" width="36" height="22" rx="3" fill="#95D8FD" stroke="#2F4254" strokeWidth="1.5" />
          <rect x="138" y="14" width="26" height="40" rx="3" fill="#F9AD36" stroke="#2F4254" strokeWidth="1.5" />
          <circle cx="50" cy="68" r="10" fill="#2F4254" />
          <circle cx="140" cy="68" r="10" fill="#2F4254" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 240 180" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden style={{ position: 'absolute', inset: 0 }}>
      <g transform="translate(40,90)">
        <rect width="160" height="56" rx="10" fill="#FFFFFF" stroke="#2F4254" strokeWidth="2" />
        <rect x="14" y="10" width="50" height="30" rx="4" fill="#95D8FD" stroke="#2F4254" strokeWidth="1.5" />
        <rect x="76" y="10" width="32" height="40" rx="3" fill="#F9AD36" stroke="#2F4254" strokeWidth="1.5" />
        <rect x="118" y="10" width="30" height="22" rx="3" fill="#95D8FD" stroke="#2F4254" strokeWidth="1.5" />
        <path d="M0 30 L-22 46 L-32 46" stroke="#2F4254" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="40" cy="62" r="10" fill="#2F4254" />
        <circle cx="130" cy="62" r="10" fill="#2F4254" />
      </g>
    </svg>
  );
}

function Intake({ t }: { t: T }) {
  const steps: Array<{ titleKey: StringKey; descKey: StringKey }> = [
    { titleKey: 'sal1.intake-1-title', descKey: 'sal1.intake-1-desc' },
    { titleKey: 'sal1.intake-2-title', descKey: 'sal1.intake-2-desc' },
    { titleKey: 'sal1.intake-3-title', descKey: 'sal1.intake-3-desc' },
  ];
  return (
    <section id="inkoop" className="py-16 sm:py-20 section-bg-grey">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-10 sm:mb-12">
          <span className="eyebrow-mk">{t('sal1.intake-eyebrow')}</span>
          <h2 className="h2-mk">{t('sal1.intake-h2')}</h2>
          <p className="lead-mk" style={{ marginTop: 10 }}>{t('sal1.intake-intro')}</p>
        </div>
        <div className="timeline-mk" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 14, marginBottom: 28 }}>
          {steps.map((s, i) => (
            <div className="timeline-step" key={s.titleKey} style={{ borderLeft: i === 0 ? 'none' : '1px solid var(--line)' }}>
              <span className="n">{String(i + 1).padStart(2, '0')}</span>
              <h4>{t(s.titleKey)}</h4>
              <p>{t(s.descKey)}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/contact?subject=Inkoop" className="btn btn-primary">
            <Tag size={15} aria-hidden /> {t('sal1.intake-cta')} <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
