'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, Phone, ShieldCheck, Wrench, Truck, Sparkles, ClipboardCheck,
  Snowflake, Tag, Check,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import type { StringKey } from '@/lib/i18n';

const EASE = [0.16, 1, 0.3, 1] as const;

type T = (k: StringKey, ...a: (string | number)[]) => string;

export default function DienstenIndex() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1">
        <Hero t={t} />
        <Specialties t={t} />
        <MoreServices t={t} />
        <Combos t={t} />
        <CtaBand t={t} />
      </main>
      <PublicFooter />
    </div>
  );
}

// ─── HERO ───────────────────────────────────────
function Hero({ t }: { t: T }) {
  const reduce = useReducedMotion();
  const fade = (delay = 0) =>
    reduce
      ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: EASE, delay } };

  return (
    <section className="section-bg-sky-soft relative overflow-hidden">
      <div className="relative max-w-[1200px] mx-auto px-5 sm:px-10 py-14 sm:py-20">
        <div className="max-w-[820px]">
          <motion.span {...fade(0)} className="eyebrow-mk">{t('svc1.hero-eyebrow')}</motion.span>
          <motion.h1 {...fade(0.06)} className="h1-mk" style={{ marginTop: 4 }}>
            {t('svc1.hero-h1')}
          </motion.h1>
          <motion.p {...fade(0.14)} className="lead-mk" style={{ marginTop: 14, maxWidth: 700 }}>
            {t('svc1.hero-lead')}
          </motion.p>
          <motion.div {...fade(0.22)} className="flex flex-wrap gap-3 mt-7">
            <span className="spec-chip">
              <span className="v">{t('svc1.hero-chip-1-v')}</span>
              <span className="l">{t('svc1.hero-chip-1-l')}</span>
            </span>
            <span className="spec-chip">
              <span className="v">{t('svc1.hero-chip-2-v')}</span>
              <span className="l">{t('svc1.hero-chip-2-l')}</span>
            </span>
            <span className="spec-chip">
              <span className="v">{t('svc1.hero-chip-3-v')}</span>
              <span className="l">{t('svc1.hero-chip-3-l')}</span>
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── SPECIALTIES — schoonmaken + onderhoud naast elkaar ────
function Specialties({ t }: { t: T }) {
  // Schoonmaak- en onderhouds-tarieven verschillen per caravan-maat en
  // gevraagd pakket; we tonen "Op aanvraag" en sturen klanten naar offerte.
  const onRequest = t('pri1.on-request');
  const cleaning = [
    { keyL: 'svc1.clean-row-1' as StringKey, price: onRequest, featured: false },
    { keyL: 'svc1.clean-row-2' as StringKey, price: onRequest, featured: false },
    { keyL: 'svc1.clean-row-3' as StringKey, price: onRequest, featured: false },
    { keyL: 'svc1.clean-row-4' as StringKey, price: onRequest, featured: false },
    { keyL: 'svc1.clean-row-5' as StringKey, price: onRequest, featured: true },
  ];
  const maint = [
    { keyL: 'svc1.maint-row-1' as StringKey, price: onRequest, featured: false },
    { keyL: 'svc1.maint-row-2' as StringKey, price: onRequest, featured: false },
    { keyL: 'svc1.maint-row-3' as StringKey, price: onRequest, featured: false },
    { keyL: 'svc1.maint-row-4' as StringKey, price: onRequest, featured: true },
    { keyL: 'svc1.maint-row-5' as StringKey, price: onRequest, featured: false },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-12">
          <span className="eyebrow-mk">{t('svc1.spec-eyebrow')}</span>
          <h2 className="h2-mk">{t('svc1.spec-h2')}</h2>
          <p className="lead-mk" style={{ marginTop: 10 }}>{t('svc1.spec-intro')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpecialtyBlock
            t={t}
            icon={Sparkles}
            titleKey="svc1.clean-title"
            descKey="svc1.clean-desc"
            ctaKey="svc1.clean-cta"
            ctaHref="/diensten/service"
            rows={cleaning}
          />
          <SpecialtyBlock
            t={t}
            icon={Wrench}
            titleKey="svc1.maint-title"
            descKey="svc1.maint-desc"
            ctaKey="svc1.maint-cta"
            ctaHref="/diensten/reparatie"
            rows={maint}
          />
        </div>
      </div>
    </section>
  );
}

function SpecialtyBlock({
  t, icon: Icon, titleKey, descKey, ctaKey, ctaHref, rows,
}: {
  t: T;
  icon: LucideIcon;
  titleKey: StringKey;
  descKey: StringKey;
  ctaKey: StringKey;
  ctaHref: string;
  rows: Array<{ keyL: StringKey; price: string; featured: boolean }>;
}) {
  return (
    <div className="card-mk" style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <span
          style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'var(--sky-soft)', color: 'var(--navy)',
            display: 'grid', placeItems: 'center',
          }}
          aria-hidden
        >
          <Icon size={20} />
        </span>
        <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 20, color: 'var(--navy)', margin: 0 }}>
          {t(titleKey)}
        </h3>
      </div>
      <p style={{ color: 'var(--ink-2)', fontSize: 14.5, lineHeight: 1.6, margin: '0 0 18px' }}>
        {t(descKey)}
      </p>

      <div className="tbl-wrap-mk">
        <table className="tbl-mk">
          <thead>
            <tr>
              <th>{t('svc1.tbl-h-task')}</th>
              <th style={{ textAlign: 'right' }}>{t('svc1.tbl-h-price')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.keyL} className={r.featured ? 'featured' : undefined}>
                <td>{t(r.keyL)}</td>
                <td className="price" style={{ textAlign: 'right' }}>{r.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Link href={ctaHref} className="btn btn-primary">
          {t(ctaKey)} <ArrowRight size={15} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

// ─── MORE SERVICES — 6-grid ─────────────────────────
function MoreServices({ t }: { t: T }) {
  const items: Array<{ icon: LucideIcon; titleKey: StringKey; descKey: StringKey; href: string }> = [
    { icon: ShieldCheck, titleKey: 'svc1.more-1-title', descKey: 'svc1.more-1-desc', href: '/diensten/stalling' },
    { icon: Wrench, titleKey: 'svc1.more-2-title', descKey: 'svc1.more-2-desc', href: '/diensten/reparatie' },
    { icon: ClipboardCheck, titleKey: 'svc1.more-3-title', descKey: 'svc1.more-3-desc', href: '/diensten/inspectie' },
    { icon: Truck, titleKey: 'svc1.more-4-title', descKey: 'svc1.more-4-desc', href: '/diensten/transport' },
    { icon: Snowflake, titleKey: 'svc1.more-5-title', descKey: 'svc1.more-5-desc', href: '/koelkast' },
    { icon: Tag, titleKey: 'svc1.more-6-title', descKey: 'svc1.more-6-desc', href: '/verkoop' },
  ];
  return (
    <section className="py-16 sm:py-20 section-bg-grey">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-12">
          <span className="eyebrow-mk">{t('svc1.more-eyebrow')}</span>
          <h2 className="h2-mk">{t('svc1.more-h2')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(({ icon: Icon, titleKey, descKey, href }) => (
            <Link key={href} href={href} className="service-card-mk block" style={{ textDecoration: 'none' }}>
              <div className="ic"><Icon size={20} aria-hidden /></div>
              <h3>{t(titleKey)}</h3>
              <p>{t(descKey)}</p>
              <span className="more">{t('svc1.combo-cta')}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── COMBOS — 3 pakket-cards met korting-prijs ─────
function Combos({ t }: { t: T }) {
  const combos = [
    {
      titleKey: 'svc1.combo-1-title' as StringKey,
      list: ['svc1.combo-1-list-1', 'svc1.combo-1-list-2', 'svc1.combo-1-list-3'] as StringKey[],
      priceKey: 'svc1.combo-1-price' as StringKey,
      oldKey: 'svc1.combo-1-old' as StringKey,
      featured: false,
      ctaKey: 'svc1.combo-cta' as StringKey,
      ctaHref: '/contact?subject=Winter-klaar',
    },
    {
      titleKey: 'svc1.combo-2-title' as StringKey,
      list: ['svc1.combo-2-list-1', 'svc1.combo-2-list-2', 'svc1.combo-2-list-3'] as StringKey[],
      priceKey: 'svc1.combo-2-price' as StringKey,
      oldKey: 'svc1.combo-2-old' as StringKey,
      featured: true,
      ctaKey: 'svc1.combo-cta' as StringKey,
      ctaHref: '/contact?subject=Seizoen-klaar',
    },
    {
      titleKey: 'svc1.combo-3-title' as StringKey,
      list: ['svc1.combo-3-list-1', 'svc1.combo-3-list-2', 'svc1.combo-3-list-3'] as StringKey[],
      priceKey: 'svc1.combo-3-price' as StringKey,
      oldKey: null,
      featured: false,
      ctaKey: 'svc1.combo-cta-quote' as StringKey,
      ctaHref: '/contact?subject=Compleet-jaar',
    },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-12">
          <span className="eyebrow-mk">{t('svc1.combo-eyebrow')}</span>
          <h2 className="h2-mk">{t('svc1.combo-h2')}</h2>
          <p className="lead-mk" style={{ marginTop: 10 }}>{t('svc1.combo-intro')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {combos.map((c) => (
            <div
              key={c.titleKey}
              className="card-mk relative"
              style={{
                padding: 28,
                border: c.featured ? '2px solid var(--orange)' : '1px solid var(--line)',
                boxShadow: c.featured
                  ? 'var(--shadow-card-mk), 0 24px 48px -24px rgba(249, 173, 54, 0.35)'
                  : 'var(--shadow-card-mk)',
              }}
            >
              {c.featured && (
                <span
                  className="tag-mk orange"
                  style={{ position: 'absolute', top: -12, left: 24 }}
                >
                  {t('svc1.combo-popular')}
                </span>
              )}
              <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 20, color: 'var(--navy)', margin: '0 0 16px' }}>
                {t(c.titleKey)}
              </h3>
              <ul className="checklist-mk" style={{ marginBottom: 22 }}>
                {c.list.map((k) => (
                  <li key={k}>
                    <span className="v" />
                    {t(k)}
                  </li>
                ))}
              </ul>
              {(() => {
                const priceText = t(c.priceKey);
                const oldText = c.oldKey ? t(c.oldKey) : '';
                const isOnRequest = !/^[€$\d]/.test(priceText);
                return (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '0 0 18px', flexWrap: 'wrap' }}>
                    <span
                      className="display-num"
                      style={{
                        fontSize: isOnRequest ? 22 : 36,
                        lineHeight: 1.1,
                        color: 'var(--navy)',
                        fontWeight: 700,
                      }}
                    >
                      {priceText}
                    </span>
                    {oldText && (
                      <span style={{ color: 'var(--muted)', fontSize: 14, textDecoration: 'line-through' }}>
                        {t('svc1.combo-was')} {oldText}
                      </span>
                    )}
                  </div>
                );
              })()}
              <Link href={c.ctaHref} className={c.featured ? 'btn btn-primary btn-block' : 'btn btn-ghost btn-block'}>
                {t(c.ctaKey)} <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA-BAND ───────────────────────────────────────
function CtaBand({ t }: { t: T }) {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="cta-band-mk">
          <div>
            <h2 className="h2-mk on-navy" style={{ margin: 0 }}>{t('svc1.cta-h2')}</h2>
            <p style={{ marginTop: 8, color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.55 }}>
              {t('svc1.cta-sub')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/contact" className="btn btn-primary">
              <Check size={15} aria-hidden /> {t('home1.cta-secondary')}
            </Link>
            <a href="tel:+34633778699" className="btn btn-ghost-light">
              <Phone size={15} aria-hidden /> +34 633 77 86 99
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
