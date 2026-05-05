'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Phone, Plus } from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import { useLocale } from '@/components/LocaleProvider';
import type { StringKey } from '@/lib/i18n';

const EASE = [0.16, 1, 0.3, 1] as const;
type T = (k: StringKey, ...a: (string | number)[]) => string;

export default function StallingPage() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1">
        <Hero t={t} />
        <Tiers t={t} />
        <Included t={t} />
        <Faq t={t} />
        <CtaBand t={t} />
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
          <motion.span {...fade(0)} className="eyebrow-mk">{t('stl1.hero-eyebrow')}</motion.span>
          <motion.h1 {...fade(0.06)} className="h1-mk" style={{ marginTop: 4 }}>{t('stl1.hero-h1')}</motion.h1>
          <motion.p {...fade(0.14)} className="lead-mk" style={{ marginTop: 14, maxWidth: 700 }}>{t('stl1.hero-lead')}</motion.p>
        </div>
      </div>
    </section>
  );
}

function Tiers({ t }: { t: T }) {
  const tiers = [
    {
      titleKey: 'stl1.tier-1-title' as StringKey,
      descKey: 'stl1.tier-1-desc' as StringKey,
      fromKey: 'stl1.tier-1-from' as StringKey,
      featured: false,
      badgeKey: null,
    },
    {
      titleKey: 'stl1.tier-2-title' as StringKey,
      descKey: 'stl1.tier-2-desc' as StringKey,
      fromKey: 'stl1.tier-2-from' as StringKey,
      featured: true,
      badgeKey: 'stl1.tier-2-badge' as StringKey,
    },
    {
      titleKey: 'stl1.tier-3-title' as StringKey,
      descKey: 'stl1.tier-3-desc' as StringKey,
      fromKey: 'stl1.tier-3-from' as StringKey,
      featured: false,
      badgeKey: null,
    },
  ];
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-12">
          <span className="eyebrow-mk">{t('stl1.tier-eyebrow')}</span>
          <h2 className="h2-mk">{t('stl1.tier-h2')}</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {tiers.map((tr) => (
            <div
              key={tr.titleKey}
              className="card-mk relative"
              style={{
                padding: 28,
                border: tr.featured ? '2px solid var(--orange)' : '1px solid var(--line)',
                boxShadow: tr.featured
                  ? 'var(--shadow-card-mk), 0 24px 48px -24px rgba(249, 173, 54, 0.35)'
                  : 'var(--shadow-card-mk)',
              }}
            >
              {tr.featured && tr.badgeKey && (
                <span className="tag-mk orange" style={{ position: 'absolute', top: -12, left: 24 }}>
                  {t(tr.badgeKey)}
                </span>
              )}
              <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 22, color: 'var(--navy)', margin: '0 0 8px' }}>
                {t(tr.titleKey)}
              </h3>
              <p style={{ color: 'var(--ink-2)', fontSize: 14.5, lineHeight: 1.6, margin: '0 0 18px' }}>
                {t(tr.descKey)}
              </p>
              <div className="display-num" style={{ fontSize: 30, lineHeight: 1, color: 'var(--navy)', marginBottom: 22 }}>
                {t(tr.fromKey)}
              </div>
              <Link href="/reserveren/configurator" className={tr.featured ? 'btn btn-primary btn-block' : 'btn btn-ghost btn-block'}>
                {t('stl1.tier-cta')} <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Included({ t }: { t: T }) {
  const items: StringKey[] = [
    'stl1.incl-1', 'stl1.incl-2', 'stl1.incl-3',
    'stl1.incl-4', 'stl1.incl-5', 'stl1.incl-6',
  ];
  return (
    <section className="py-16 sm:py-20 section-bg-grey">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-10 sm:mb-12">
          <span className="eyebrow-mk">{t('stl1.incl-eyebrow')}</span>
          <h2 className="h2-mk">{t('stl1.incl-h2')}</h2>
        </div>
        <ul className="checklist-mk grid grid-cols-1 sm:grid-cols-2 gap-x-10" style={{ maxWidth: 880, margin: '0 auto' }}>
          {items.map((k) => (
            <li key={k}>
              <span className="v" />
              {t(k)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Faq({ t }: { t: T }) {
  const items: Array<{ qKey: StringKey; aKey: StringKey }> = [
    { qKey: 'stl1.faq-1-q', aKey: 'stl1.faq-1-a' },
    { qKey: 'stl1.faq-2-q', aKey: 'stl1.faq-2-a' },
    { qKey: 'stl1.faq-3-q', aKey: 'stl1.faq-3-a' },
    { qKey: 'stl1.faq-4-q', aKey: 'stl1.faq-4-a' },
    { qKey: 'stl1.faq-5-q', aKey: 'stl1.faq-5-a' },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-[820px] mx-auto px-5 sm:px-10">
        <div className="text-center mb-10">
          <span className="eyebrow-mk">{t('stl1.faq-eyebrow')}</span>
          <h2 className="h2-mk">{t('stl1.faq-h2')}</h2>
        </div>
        <div className="acc-mk">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={it.qKey} className={isOpen ? 'acc-item-mk open' : 'acc-item-mk'}>
                <button
                  type="button"
                  className="acc-q-mk w-full text-left"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  style={{ background: 'none', border: 'none' }}
                >
                  <span>{t(it.qKey)}</span>
                  <span className="pl" aria-hidden><Plus size={20} /></span>
                </button>
                {isOpen && <div className="acc-a-mk">{t(it.aKey)}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CtaBand({ t }: { t: T }) {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="cta-band-mk">
          <div>
            <h2 className="h2-mk on-navy" style={{ margin: 0 }}>{t('stl1.cta-h2')}</h2>
            <p style={{ marginTop: 8, color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.55 }}>
              {t('stl1.cta-sub')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/reserveren/configurator" className="btn btn-primary">
              {t('stl1.tier-cta')} <ArrowRight size={15} aria-hidden />
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
