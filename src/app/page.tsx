'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Phone, ArrowRight,
  Shield, Lock, FileCheck2, Search,
  Wrench, Truck, Sparkles, Wind, Refrigerator, ClipboardCheck,
} from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import PhotoSlot from '@/components/PhotoSlot';
import type { StringKey } from '@/lib/i18n';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function MarketingHomepage() {
  const { t } = useLocale();
  return (
    <div className="mk-page min-h-screen flex flex-col">
      <Topbar />
      <PublicHeader variant="marketing-cream" />

      <main id="main" className="flex-1">
        <Hero t={t} />
        <StatsStrip t={t} />
        <StorageOverview t={t} />
        <ServicesGrid t={t} />
        <VacationService t={t} />
        <Security t={t} />
        <Reviews t={t} />
        <About t={t} />
        <FaqSection t={t} />
        <CtaStrip t={t} />
      </main>

      <PublicFooter />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// HERO
// ──────────────────────────────────────────────────────────────
function Hero({ t }: { t: (k: StringKey, ...a: (string | number)[]) => string }) {
  return (
    <section className="mk-hero-bg relative overflow-hidden" style={{ paddingTop: '4rem', paddingBottom: '3.5rem' }}>
      <div className="relative max-w-[1180px] mx-auto px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.9fr] gap-10 lg:gap-16 items-center"
        >
          {/* Tekst-kolom */}
          <div>
            <span
              className="mk-eyebrow inline-block mb-4"
              style={{ color: '#ffd29b' }}
            >
              {t('mk.hero-eyebrow')}
            </span>
            <h1
              className="font-display"
              style={{
                color: '#FFFFFF',
                fontSize: 'clamp(2.1rem, 4.6vw, 3.6rem)',
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: '-0.012em',
                margin: '0 0 0.4em',
              }}
            >
              {t('mk.hero-h1-prefix')}{' '}
              <span style={{ color: '#ffd29b', fontStyle: 'italic' }}>
                {t('mk.hero-h1-accent')}
              </span>{' '}
              {t('mk.hero-h1-suffix')}
            </h1>
            <p
              className="text-[1.05rem] sm:text-[1.15rem] leading-relaxed max-w-xl mb-7"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              {t('mk.hero-lead')}
            </p>

            <div className="flex gap-3 flex-wrap">
              <Link href="/diensten" className="mk-btn-primary">
                {t('mk.hero-cta-primary')}
                <ArrowRight size={16} aria-hidden />
              </Link>
              <Link href="/contact" className="mk-btn-ghost">
                {t('mk.hero-cta-secondary')}
              </Link>
            </div>

            {/* Trust-row */}
            <div className="mt-9 flex flex-wrap gap-7 items-start">
              <div>
                <div style={{ color: '#ffc04d', letterSpacing: '2px', fontSize: '1.05rem' }}>★★★★★</div>
                <small className="block text-[0.82rem]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <strong style={{ color: '#fff' }}>{t('mk.hero-trust-rating')}</strong> · {t('mk.hero-trust-rating-sub')}
                </small>
              </div>
              <div>
                <strong className="block text-[0.95rem]" style={{ color: '#fff' }}>{t('mk.hero-trust-securitas')}</strong>
                <small className="block text-[0.82rem]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {t('mk.hero-trust-securitas-sub')}
                </small>
              </div>
              <div>
                <strong className="block text-[0.95rem]" style={{ color: '#fff' }}>{t('mk.hero-trust-team')}</strong>
                <small className="block text-[0.82rem]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {t('mk.hero-trust-team-sub')}
                </small>
              </div>
            </div>
          </div>

          {/* Foto-slot rechts (lg+). Tot URL geleverd: aspect-ratio bewaard. */}
          <div className="hidden lg:block">
            <PhotoSlot
              ratio="hero"
              ariaLabel="Caravanstalling Spanje terrein"
              className="rounded-[22px]"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow: '0 20px 60px rgba(8, 38, 56, 0.30)',
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// STATS-STRIP
// ──────────────────────────────────────────────────────────────
function StatsStrip({ t }: { t: (k: StringKey, ...a: (string | number)[]) => string }) {
  const stats = [
    { num: '650+',  labelKey: 'mk.stat-customers' as StringKey },
    { num: '15+',   labelKey: 'mk.stat-years'     as StringKey },
    { num: '100%',  labelKey: 'mk.stat-insured'   as StringKey },
    { num: '24/7',  labelKey: 'mk.stat-guarded'   as StringKey },
  ];
  return (
    <section
      className="border-t border-b"
      style={{ background: 'var(--color-sand)', borderColor: 'var(--color-marketing-line)' }}
    >
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-9 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.num} className="text-center">
            <div className="mk-stat-num">{s.num}</div>
            <div
              className="mt-1 text-[0.82rem] font-semibold uppercase"
              style={{ color: 'var(--color-marketing-ink-soft)', letterSpacing: '0.04em' }}
            >
              {t(s.labelKey)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// STORAGE OVERVIEW (zonder prijzen — gebruiker geeft die niet publiek)
// ──────────────────────────────────────────────────────────────
function StorageOverview({ t }: { t: (k: StringKey, ...a: (string | number)[]) => string }) {
  const tiers = [
    {
      titleKey: 'mk.storage-outdoor-title' as StringKey,
      descKey: 'mk.storage-outdoor-desc' as StringKey,
      featured: false,
      featureKeys: ['mk.storage-feat-securitas', 'mk.storage-feat-insurance', 'mk.storage-feat-check'] as StringKey[],
    },
    {
      titleKey: 'mk.storage-covered-title' as StringKey,
      descKey: 'mk.storage-covered-desc' as StringKey,
      featured: true,
      featureKeys: ['mk.storage-feat-securitas', 'mk.storage-feat-insurance', 'mk.storage-feat-uv', 'mk.storage-feat-tech', 'mk.storage-feat-priority'] as StringKey[],
    },
    {
      titleKey: 'mk.storage-indoor-title' as StringKey,
      descKey: 'mk.storage-indoor-desc' as StringKey,
      featured: false,
      featureKeys: ['mk.storage-feat-securitas', 'mk.storage-feat-insurance', 'mk.storage-feat-climate', 'mk.storage-feat-staff'] as StringKey[],
    },
  ];

  return (
    <section id="stalling" className="py-16 sm:py-20">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
        <div className="text-center max-w-[720px] mx-auto mb-12">
          <span className="mk-eyebrow mb-3 block">{t('mk.storage-eyebrow')}</span>
          <h2>{t('mk.storage-h2')}</h2>
          <p className="mt-3">{t('mk.storage-intro')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((tier) => (
            <div
              key={tier.titleKey}
              className="relative rounded-[22px] p-7 transition-all hover:-translate-y-1"
              style={{
                background: '#fff',
                border: tier.featured ? '2px solid var(--color-terracotta)' : '1px solid var(--color-marketing-line)',
                boxShadow: tier.featured ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              }}
            >
              {tier.featured && (
                <span
                  aria-hidden
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[0.72rem] font-bold uppercase tracking-[0.05em]"
                  style={{ background: 'var(--color-terracotta)', color: '#fff' }}
                >
                  {t('mk.storage-covered-badge')}
                </span>
              )}
              <h3
                className="font-sans"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1.05rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-terracotta-deep)',
                  fontWeight: 700,
                  margin: '0 0 0.4rem',
                }}
              >
                {t(tier.titleKey)}
              </h3>
              <p className="text-[0.92rem]" style={{ color: 'var(--color-marketing-ink-soft)' }}>
                {t(tier.descKey)}
              </p>
              <ul className="list-none p-0 mt-4 mb-6 space-y-2">
                {tier.featureKeys.map((fk) => (
                  <li
                    key={fk}
                    className="relative pl-7 text-[0.9rem]"
                    style={{ color: 'var(--color-marketing-ink)' }}
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-[0.55rem] block"
                      style={{
                        width: 14, height: 8,
                        borderLeft: '2px solid #3d6e4c',
                        borderBottom: '2px solid #3d6e4c',
                        transform: 'rotate(-45deg)',
                      }}
                    />
                    {t(fk)}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact?subject=Stalling-aanvraag"
                className={tier.featured ? 'mk-btn-primary w-full justify-center' : 'mk-btn-secondary w-full justify-center'}
                style={{ display: 'inline-flex', width: '100%' }}
              >
                {t('mk.storage-cta')}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center mt-6 text-[0.85rem]" style={{ color: 'var(--color-marketing-ink-soft)' }}>
          {t('mk.storage-note')}
        </p>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// SERVICES GRID
// ──────────────────────────────────────────────────────────────
function ServicesGrid({ t }: { t: (k: StringKey, ...a: (string | number)[]) => string }) {
  const services: Array<{ icon: typeof Wrench; titleKey: StringKey; descKey: StringKey; href: string }> = [
    { icon: Wrench, titleKey: 'mk.svc-repair-title', descKey: 'mk.svc-repair-desc', href: '/diensten/reparatie' },
    { icon: Truck,  titleKey: 'mk.svc-transport-title', descKey: 'mk.svc-transport-desc', href: '/diensten/transport' },
    { icon: Sparkles, titleKey: 'mk.svc-cleaning-title', descKey: 'mk.svc-cleaning-desc', href: '/diensten/service' },
    { icon: Wind, titleKey: 'mk.svc-airco-title', descKey: 'mk.svc-airco-desc', href: '/diensten/airco' },
    { icon: Refrigerator, titleKey: 'mk.svc-fridge-title', descKey: 'mk.svc-fridge-desc', href: '/koelkast' },
    { icon: ClipboardCheck, titleKey: 'mk.svc-inspection-title', descKey: 'mk.svc-inspection-desc', href: '/diensten/inspectie' },
  ];

  return (
    <section id="diensten" className="py-16 sm:py-20" style={{ background: 'var(--color-sand)' }}>
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
        <div className="text-center max-w-[720px] mx-auto mb-12">
          <span className="mk-eyebrow mb-3 block">{t('mk.svc-eyebrow')}</span>
          <h2>{t('mk.svc-h2')}</h2>
          <p className="mt-3">{t('mk.svc-intro')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.href}
                href={s.href}
                className="group block p-6 rounded-[14px] transition-transform hover:-translate-y-0.5"
                style={{
                  background: '#fff',
                  border: '1px solid var(--color-marketing-line)',
                }}
              >
                <div
                  className="w-13 h-13 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'var(--color-sand-2)', width: 52, height: 52 }}
                >
                  <Icon size={22} style={{ color: 'var(--color-navy)' }} aria-hidden />
                </div>
                <h3
                  className="font-sans text-[1.1rem] mb-1"
                  style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-navy)', margin: '0 0 0.3rem' }}
                >
                  {t(s.titleKey)}
                </h3>
                <p className="text-[0.92rem]" style={{ color: 'var(--color-marketing-ink-soft)', margin: 0 }}>
                  {t(s.descKey)}
                </p>
                <span
                  className="inline-flex items-center gap-1 mt-3 text-[0.9rem] font-semibold transition-transform group-hover:translate-x-0.5"
                  style={{ color: 'var(--color-terracotta-deep)' }}
                >
                  {t('mk.svc-link-more')} <ArrowRight size={14} aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// VACATION SERVICE
// ──────────────────────────────────────────────────────────────
function VacationService({ t }: { t: (k: StringKey, ...a: (string | number)[]) => string }) {
  const features: StringKey[] = [
    'mk.vac-feat-onsite',
    'mk.vac-feat-utilities',
    'mk.vac-feat-fridge',
    'mk.vac-feat-beds',
    'mk.vac-feat-tent',
    'mk.vac-feat-cleaning',
  ];

  return (
    <section
      id="vakantie"
      className="py-16 sm:py-20"
      style={{
        background: 'linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-deep) 100%)',
        color: '#fff',
      }}
    >
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
          <div>
            <span className="mk-eyebrow mb-3 block" style={{ color: '#ffd29b' }}>
              {t('mk.vac-eyebrow')}
            </span>
            <h2 style={{ color: '#fff' }}>{t('mk.vac-h2')}</h2>
            <p className="mt-3" style={{ color: 'rgba(255,255,255,0.82)' }}>
              {t('mk.vac-intro')}
            </p>
            <ul className="list-none p-0 mt-6 mb-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {features.map((fk) => (
                <li key={fk} className="relative pl-8 text-[0.95rem]" style={{ color: 'rgba(255,255,255,0.92)' }}>
                  <span
                    aria-hidden
                    className="absolute left-0 top-[-1px] inline-grid place-items-center text-[0.78rem] font-bold"
                    style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'var(--color-terracotta)', color: '#fff',
                    }}
                  >
                    ✓
                  </span>
                  {t(fk)}
                </li>
              ))}
            </ul>
            <Link href="/contact?subject=Vakantieservice" className="mk-btn-primary">
              {t('mk.vac-cta')}
            </Link>
          </div>

          <div
            className="rounded-[22px] p-7"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <PhotoSlot
              ratio="4/3"
              ariaLabel="Vakantieservice"
              className="rounded-[14px]"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// SECURITY
// ──────────────────────────────────────────────────────────────
function Security({ t }: { t: (k: StringKey, ...a: (string | number)[]) => string }) {
  const items: Array<{ icon: typeof Shield; titleKey: StringKey; descKey: StringKey }> = [
    { icon: Shield, titleKey: 'mk.sec-cam-title', descKey: 'mk.sec-cam-desc' },
    { icon: Lock, titleKey: 'mk.sec-fence-title', descKey: 'mk.sec-fence-desc' },
    { icon: FileCheck2, titleKey: 'mk.sec-insurance-title', descKey: 'mk.sec-insurance-desc' },
    { icon: Search, titleKey: 'mk.sec-check-title', descKey: 'mk.sec-check-desc' },
  ];

  return (
    <section
      className="relative overflow-hidden py-16 sm:py-20"
      style={{ background: 'var(--color-navy)', color: '#fff' }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(217,110,60,0.15), transparent 50%)',
        }}
      />
      <div className="relative max-w-[1180px] mx-auto px-5 sm:px-8">
        <div className="text-center max-w-[720px] mx-auto mb-12">
          <span className="mk-eyebrow mb-3 block" style={{ color: '#ffd29b' }}>
            {t('mk.sec-eyebrow')}
          </span>
          <h2 style={{ color: '#fff' }}>{t('mk.sec-h2')}</h2>
          <p className="mt-3" style={{ color: 'rgba(255,255,255,0.82)' }}>
            {t('mk.sec-intro')}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <div key={it.titleKey} className="text-center px-4 py-6">
                <div
                  className="mx-auto mb-4 grid place-items-center"
                  style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1.5px solid rgba(255,255,255,0.18)',
                  }}
                >
                  <Icon size={26} aria-hidden style={{ color: '#ffd29b' }} />
                </div>
                <h4
                  className="font-sans text-[1rem] mb-1"
                  style={{ fontFamily: 'var(--font-sans)', color: '#fff', margin: '0 0 0.3rem' }}
                >
                  {t(it.titleKey)}
                </h4>
                <p className="text-[0.88rem]" style={{ color: 'rgba(255,255,255,0.82)', margin: 0 }}>
                  {t(it.descKey)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// REVIEWS — placeholder met 3 quotes; later vervangen door echte
// Google review snippets als die er komen.
// ──────────────────────────────────────────────────────────────
function Reviews({ t }: { t: (k: StringKey, ...a: (string | number)[]) => string }) {
  // Placeholder testimonials — later vervangen door echte Google reviews.
  const reviews = [
    {
      stars: 5,
      text: '"Onze caravan stond perfect schoon en gerepareerd voor onze aankomst. Wat een service en wat fijne mensen. Bij aankomst zelfs een welkomstpakket. Echt top."',
      author: 'Martine V.',
      sub: 'Vaste klant sinds 2018',
      avatar: 'MV',
    },
    {
      stars: 5,
      text: '"Hagelschade aan ons dak in twee dagen onzichtbaar gerepareerd terwijl wij in Nederland waren. Alles in foto\'s gedocumenteerd. Dit is hoe je een bedrijf runt."',
      author: 'Jan D.',
      sub: 'Reparatie-klant',
      avatar: 'JD',
    },
    {
      stars: 5,
      text: '"Persoonlijk, betrouwbaar en altijd bereikbaar in het Nederlands. We laten onze camper hier al vier jaar staan en het voelt elke keer als thuiskomen."',
      author: 'Peter & Brigitte',
      sub: 'Camper-klant uit Hilversum',
      avatar: 'PB',
    },
  ];

  return (
    <section className="py-16 sm:py-20" style={{ background: 'var(--color-sand)' }}>
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
        <div className="flex justify-between items-end flex-wrap gap-6 mb-10">
          <div>
            <span className="mk-eyebrow mb-3 block">{t('mk.rev-eyebrow')}</span>
            <h2>{t('mk.rev-h2')}</h2>
          </div>
          <div
            className="flex items-center gap-4 px-5 py-4 rounded-[14px]"
            style={{
              background: '#fff',
              border: '1px solid var(--color-marketing-line)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div>
              <div className="mk-stat-num" style={{ fontSize: '2.4rem' }}>{t('mk.rev-score-num')}</div>
              <div style={{ color: '#f5b94a', fontSize: '0.9rem', letterSpacing: '1px' }}>★★★★★</div>
            </div>
            <div>
              <small className="block text-[0.8rem]" style={{ color: 'var(--color-marketing-ink-soft)' }}>
                {t('mk.rev-score-base')}
              </small>
              <strong className="block text-[1rem]" style={{ color: 'var(--color-navy)' }}>
                {t('mk.rev-score-count')}
              </strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="p-6 rounded-[14px]"
              style={{ background: '#fff', border: '1px solid var(--color-marketing-line)' }}
            >
              <div style={{ color: '#f5b94a', fontSize: '1rem', letterSpacing: '1px', marginBottom: '0.8rem' }}>
                {'★'.repeat(r.stars)}
              </div>
              <p className="italic text-[0.95rem] mb-4" style={{ color: 'var(--color-marketing-ink)' }}>
                {r.text}
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="grid place-items-center font-bold text-[0.9rem]"
                  style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'var(--color-terracotta)', color: '#fff',
                  }}
                >
                  {r.avatar}
                </div>
                <div>
                  <strong className="block text-[0.9rem]" style={{ color: 'var(--color-navy)' }}>{r.author}</strong>
                  <small className="text-[0.8rem]" style={{ color: 'var(--color-marketing-ink-soft)' }}>{r.sub}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// ABOUT
// ──────────────────────────────────────────────────────────────
function About({ t }: { t: (k: StringKey, ...a: (string | number)[]) => string }) {
  return (
    <section id="about" className="py-16 sm:py-20">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
          {/* Visual met overlay-quote */}
          <div
            className="relative rounded-[22px] overflow-hidden"
            style={{
              aspectRatio: '4 / 5',
              background:
                'linear-gradient(135deg, rgba(14,58,85,0.5), rgba(217,110,60,0.4)), linear-gradient(180deg, #4d8fb3 0%, #f0c89a 60%, #d96e3c 100%)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <PhotoSlot
              ratio="4/3"
              ariaLabel="Onze locatie"
              className="absolute inset-0"
              style={{ background: 'transparent' }}
            />
            <div
              className="absolute bottom-6 left-6 right-6 italic text-[1.05rem]"
              style={{
                color: '#fff',
                fontFamily: 'var(--font-display)',
                lineHeight: 1.4,
                textShadow: '0 2px 12px rgba(0,0,0,0.3)',
              }}
            >
              {t('mk.about-quote')}
            </div>
          </div>

          {/* Tekst */}
          <div>
            <span className="mk-eyebrow mb-3 block">{t('mk.about-eyebrow')}</span>
            <h2>{t('mk.about-h2')}</h2>
            <p className="mt-3">{t('mk.about-p1')}</p>
            <p>{t('mk.about-p2')}</p>
            <div className="flex gap-3 flex-wrap mt-6">
              <Link href="/contact" className="mk-btn-primary">
                {t('mk.about-cta-tour')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// FAQ
// ──────────────────────────────────────────────────────────────
function FaqSection({ t }: { t: (k: StringKey, ...a: (string | number)[]) => string }) {
  const items: Array<{ qKey: StringKey; aKey: StringKey }> = [
    { qKey: 'mk.faq-q1', aKey: 'mk.faq-a1' },
    { qKey: 'mk.faq-q2', aKey: 'mk.faq-a2' },
    { qKey: 'mk.faq-q3', aKey: 'mk.faq-a3' },
    { qKey: 'mk.faq-q4', aKey: 'mk.faq-a4' },
    { qKey: 'mk.faq-q5', aKey: 'mk.faq-a5' },
  ];
  return (
    <section className="py-16 sm:py-20" style={{ background: 'var(--color-sand)' }}>
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
        <div className="text-center max-w-[720px] mx-auto mb-12">
          <span className="mk-eyebrow mb-3 block">{t('mk.faq-eyebrow')}</span>
          <h2>{t('mk.faq-h2')}</h2>
        </div>
        <div className="max-w-[820px] mx-auto">
          {items.map((it) => (
            <details key={it.qKey} className="mk-faq-item">
              <summary>{t(it.qKey)}</summary>
              <div className="mk-faq-answer">{t(it.aKey)}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// CTA-STRIP (terracotta)
// ──────────────────────────────────────────────────────────────
function CtaStrip({ t }: { t: (k: StringKey, ...a: (string | number)[]) => string }) {
  return (
    <section
      id="contact"
      className="py-12 sm:py-14"
      style={{ background: 'var(--color-terracotta)', color: '#fff' }}
    >
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 flex justify-between items-center gap-6 flex-wrap">
        <div>
          <h2 className="font-display" style={{ color: '#fff', margin: 0, fontSize: 'clamp(1.4rem, 2.4vw, 2rem)' }}>
            {t('mk.cta-h2')}
          </h2>
          <p className="mt-1" style={{ color: 'rgba(255,255,255,0.92)', margin: 0 }}>
            {t('mk.cta-sub')}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <a
            href="tel:+34633778699"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-[0.95rem] font-semibold"
            style={{ background: '#fff', color: 'var(--color-terracotta-deep)' }}
          >
            <Phone size={16} aria-hidden /> {t('mk.cta-call')}
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-[0.95rem] font-semibold"
            style={{ background: 'var(--color-marketing-cream)', color: 'var(--color-terracotta-deep)' }}
          >
            {t('mk.cta-quote')}
          </Link>
        </div>
      </div>
    </section>
  );
}

