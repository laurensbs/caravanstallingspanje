'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Search, Plus, ArrowRight, Phone } from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import { useLocale } from '@/components/LocaleProvider';
import type { StringKey } from '@/lib/i18n';

const EASE = [0.16, 1, 0.3, 1] as const;
type T = (k: StringKey, ...a: (string | number)[]) => string;

type Cat = 'all' | 'storage' | 'services' | 'payment' | 'portal' | 'other';
type FaqItem = { qKey: StringKey; aKey: StringKey; cat: Exclude<Cat, 'all'> };

const ITEMS: FaqItem[] = [
  { qKey: 'faq1.q-stl-1-q', aKey: 'faq1.q-stl-1-a', cat: 'storage' },
  { qKey: 'faq1.q-stl-2-q', aKey: 'faq1.q-stl-2-a', cat: 'storage' },
  { qKey: 'faq1.q-stl-3-q', aKey: 'faq1.q-stl-3-a', cat: 'storage' },
  { qKey: 'faq1.q-stl-4-q', aKey: 'faq1.q-stl-4-a', cat: 'storage' },
  { qKey: 'faq1.q-svc-1-q', aKey: 'faq1.q-svc-1-a', cat: 'services' },
  { qKey: 'faq1.q-svc-2-q', aKey: 'faq1.q-svc-2-a', cat: 'services' },
  { qKey: 'faq1.q-svc-3-q', aKey: 'faq1.q-svc-3-a', cat: 'services' },
  { qKey: 'faq1.q-pay-1-q', aKey: 'faq1.q-pay-1-a', cat: 'payment' },
  { qKey: 'faq1.q-pay-2-q', aKey: 'faq1.q-pay-2-a', cat: 'payment' },
  { qKey: 'faq1.q-pay-3-q', aKey: 'faq1.q-pay-3-a', cat: 'payment' },
  { qKey: 'faq1.q-por-1-q', aKey: 'faq1.q-por-1-a', cat: 'portal' },
  { qKey: 'faq1.q-por-2-q', aKey: 'faq1.q-por-2-a', cat: 'portal' },
  { qKey: 'faq1.q-oth-1-q', aKey: 'faq1.q-oth-1-a', cat: 'other' },
  { qKey: 'faq1.q-oth-2-q', aKey: 'faq1.q-oth-2-a', cat: 'other' },
];

export default function FaqPage() {
  const { t } = useLocale();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Cat>('all');
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const norm = q.trim().toLowerCase();
    return ITEMS.filter((it) => {
      if (cat !== 'all' && it.cat !== cat) return false;
      if (!norm) return true;
      const text = (t(it.qKey) + ' ' + t(it.aKey)).toLowerCase();
      return text.includes(norm);
    });
  }, [q, cat, t]);

  const categories: Array<{ key: Cat; labelKey: StringKey }> = [
    { key: 'all', labelKey: 'faq1.cat-all' },
    { key: 'storage', labelKey: 'faq1.cat-storage' },
    { key: 'services', labelKey: 'faq1.cat-services' },
    { key: 'payment', labelKey: 'faq1.cat-payment' },
    { key: 'portal', labelKey: 'faq1.cat-portal' },
    { key: 'other', labelKey: 'faq1.cat-other' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1">
        <Hero t={t} q={q} setQ={setQ} />
        <section className="py-12 sm:py-16">
          <div className="max-w-[820px] mx-auto px-5 sm:px-10">
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((c) => {
                const active = cat === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCat(c.key)}
                    className="press-spring"
                    aria-pressed={active}
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
                  >
                    {t(c.labelKey)}
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 ? (
              <div className="card-mk text-center" style={{ padding: 40 }}>
                <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>{t('faq1.empty')}</p>
              </div>
            ) : (
              <div className="acc-mk">
                {filtered.map((it) => {
                  const id = it.qKey;
                  const isOpen = open === id;
                  return (
                    <div key={id} className={isOpen ? 'acc-item-mk open' : 'acc-item-mk'}>
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : id)}
                        className="acc-q-mk w-full text-left"
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
            )}
          </div>
        </section>
        <CtaBand t={t} />
      </main>
      <PublicFooter />
    </div>
  );
}

function Hero({ t, q, setQ }: { t: T; q: string; setQ: (v: string) => void }) {
  const reduce = useReducedMotion();
  const fade = (delay = 0) =>
    reduce
      ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: EASE, delay } };

  return (
    <section className="section-bg-sky-soft">
      <div className="max-w-[820px] mx-auto px-5 sm:px-10 py-14 sm:py-20 text-center">
        <motion.span {...fade(0)} className="eyebrow-mk">{t('faq1.hero-eyebrow')}</motion.span>
        <motion.h1 {...fade(0.06)} className="h1-mk" style={{ marginTop: 4 }}>{t('faq1.hero-h1')}</motion.h1>
        <motion.p {...fade(0.14)} className="lead-mk" style={{ marginTop: 14 }}>{t('faq1.hero-lead')}</motion.p>

        <motion.div
          {...fade(0.22)}
          style={{
            marginTop: 26,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#fff',
            border: '1px solid var(--line)',
            borderRadius: 14,
            padding: '8px 16px',
            boxShadow: 'var(--shadow-card-mk)',
            maxWidth: 520,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <Search size={18} aria-hidden style={{ color: 'var(--muted)' }} />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('faq1.search-placeholder')}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--inter)',
              fontSize: 15,
              color: 'var(--ink)',
              padding: '10px 0',
            }}
            aria-label={t('faq1.search-placeholder')}
          />
        </motion.div>
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
            <h2 className="h2-mk on-navy" style={{ margin: 0 }}>{t('faq1.cta-h2')}</h2>
            <p style={{ marginTop: 8, color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.55 }}>
              {t('faq1.cta-sub')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/contact" className="btn btn-primary">
              Stuur bericht <ArrowRight size={14} aria-hidden />
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
