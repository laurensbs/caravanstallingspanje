'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Tag } from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import MotionPageTransition from '@/components/motion/MotionPageTransition';
import { useLocale } from '@/components/LocaleProvider';
import type { StringKey } from '@/lib/i18n';

const EASE = [0.16, 1, 0.3, 1] as const;
type T = (k: StringKey, ...a: (string | number)[]) => string;

export type PublicStockItem = {
  id: number;
  slug: string;
  kind: string;
  brand: string;
  model: string;
  year: number | null;
  km: number | null;
  price_eur: number | null;
  status: string;
  hero_photo_url: string | null;
};

export default function VerkoopClient({ items }: { items: PublicStockItem[] }) {
  const { t } = useLocale();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1">
        <MotionPageTransition>
          <Hero t={t} />
          <Stock t={t} items={items} />
          <Intake t={t} />
        </MotionPageTransition>
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

function Stock({ t, items }: { t: T; items: PublicStockItem[] }) {
  const [filter, setFilter] = useState<'all' | string>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((s) => s.kind === filter);
  }, [items, filter]);

  const filters: Array<{ key: 'all' | string; labelKey: StringKey }> = [
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

        {filtered.length === 0 ? (
          <div className="card-mk text-center" style={{ padding: 40 }}>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 14px' }}>
              Op dit moment hebben we niets in de aangevraagde categorie staan.
            </p>
            <Link href="/contact?topic=sales" className="btn btn-ghost">
              {t('sal1.empty-cta')} <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s) => <StockCard key={s.id} item={s} t={t} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function StockCard({ item, t }: { item: PublicStockItem; t: T }) {
  const statusTag = (() => {
    switch (item.status) {
      case 'new': return { keyL: 'sal1.tag-new' as StringKey, cls: 'tag-mk orange' };
      case 'reserved': return { keyL: 'sal1.tag-reserved' as StringKey, cls: 'tag-mk' };
      case 'sold': return { keyL: 'sal1.tag-sold' as StringKey, cls: 'tag-mk navy' };
      default: return { keyL: 'sal1.tag-checked' as StringKey, cls: 'tag-mk green' };
    }
  })();
  const sold = item.status === 'sold';
  const priceText = item.price_eur !== null
    ? `€${item.price_eur.toLocaleString('nl-NL')}`
    : 'Op aanvraag';

  return (
    <Link
      href={`/verkoop/${item.slug}`}
      className="card-mk relative is-clickable"
      style={{
        padding: 0,
        overflow: 'hidden',
        opacity: sold ? 0.65 : 1,
        textDecoration: 'none',
        display: 'block',
      }}
    >
      <div
        aria-hidden
        style={{
          aspectRatio: '4 / 3',
          background: item.hero_photo_url
            ? `url(${item.hero_photo_url}) center / cover no-repeat`
            : 'linear-gradient(160deg, #E5F3FB 0%, #95D8FD 70%, #F2DDB6 100%)',
          position: 'relative',
        }}
      >
        {!item.hero_photo_url && <CaravanThumbSvg kind={item.kind} />}
        <span className={statusTag.cls} style={{ position: 'absolute', top: 14, left: 14 }}>
          {t(statusTag.keyL)}
        </span>
      </div>
      <div style={{ padding: 22 }}>
        <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 17, color: 'var(--navy)', margin: '0 0 6px' }}>
          {item.brand} {item.model}
        </h3>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14 }}>
          {item.year || '—'}{item.km !== null ? ` · ${item.km.toLocaleString('nl-NL')} km` : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span className="display-num" style={{ fontSize: 22, lineHeight: 1.1, color: 'var(--navy)', fontWeight: 700 }}>
            {priceText}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--orange-d)', fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 13 }}>
            {t('sal1.cta-detail')} <ArrowRight size={13} aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CaravanThumbSvg({ kind }: { kind: string }) {
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
          <Link href="/verkoop/inkoop" className="btn btn-primary">
            <Tag size={15} aria-hidden /> {t('sal1.intake-cta')} <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
