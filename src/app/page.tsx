'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Refrigerator, Wind, Truck, Sun, Sparkles, Star, Wrench, Warehouse, ClipboardCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocale } from '@/components/LocaleProvider';
import LocaleSwitch from '@/components/LocaleSwitch';
import PhotoSlot from '@/components/PhotoSlot';
import { PRICES } from '@/lib/pricing';
import { formatEur } from '@/lib/format';

// Mollie-meets-Stripe deep navy met subtiele warme glow voor zomer-vibe.
const NAVY_GRAD =
  'radial-gradient(120% 80% at 50% 0%, #142F4D 0%, #0A1929 60%, #050D18 100%)';

const EASE = [0.16, 1, 0.3, 1] as const;

type LivePrices = {
  fridgeLarge: number;
  fridgeTable: number;
  airco: number;
  transportWij: number;
  transportZelf: number;
};

const FALLBACK: LivePrices = {
  fridgeLarge: PRICES['Grote koelkast'],
  fridgeTable: PRICES['Tafelmodel koelkast'],
  airco: PRICES.Airco,
  transportWij: 100,
  transportZelf: 50,
};

export default function LandingPage() {
  const { locale, t } = useLocale();
  const [prices, setPrices] = useState<LivePrices>(FALLBACK);

  useEffect(() => {
    fetch('/api/order/prices')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d?.fridge) return;
        setPrices({
          fridgeLarge: Number(d.fridge['Grote koelkast'] ?? FALLBACK.fridgeLarge),
          fridgeTable: Number(d.fridge['Tafelmodel koelkast'] ?? FALLBACK.fridgeTable),
          airco: Number(d.fridge['Airco'] ?? FALLBACK.airco),
          transportWij: Number(d.transport_price_wij_rijden ?? FALLBACK.transportWij),
          transportZelf: Number(d.transport_price_zelf ?? FALLBACK.transportZelf),
        });
      })
      .catch(() => { /* fallback blijft */ });
  }, []);

  const fmt = (eur: number) => formatEur(eur, locale);

  return (
    <main
      id="main"
      className="min-h-screen relative overflow-hidden"
      style={{ background: NAVY_GRAD, color: '#F1F5F9' }}
    >
      {/* Ambient orbs — drie floating glows die samen een Costa Brava-vibe
          ademen: cyaan zee bovenaan, amber zon rechtsonder, lavender
          zonsondergang linksboven. Performance: alleen translate3d. */}
      <div
        aria-hidden
        className="cs-orb-cyan pointer-events-none absolute inset-x-0 top-0 h-[520px] blur-3xl"
        style={{ background: 'var(--gradient-hero-glow-cyan)' }}
      />
      <div
        aria-hidden
        className="cs-orb-amber pointer-events-none absolute -bottom-32 -right-20 h-[520px] w-[520px] blur-3xl"
        style={{ background: 'var(--gradient-hero-glow-amber)' }}
      />
      <div
        aria-hidden
        className="cs-orb-pulse pointer-events-none absolute -top-10 -left-32 h-[360px] w-[360px] blur-3xl opacity-50"
        style={{
          background: 'radial-gradient(50% 50% at 50% 50%, rgba(180,154,232,0.18) 0%, transparent 70%)',
        }}
      />

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <LocaleSwitch />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-12 sm:pb-20">
        {/* Hero — 12-kolom grid op lg+. Tekst links (col-span-7), PhotoSlot
            rechts (col-span-5). Op md- centered single-column zonder slot. */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-10 sm:mb-14"
        >
          <div className="lg:col-span-7 text-center lg:text-left">
            <Image
              src="/images/logo.png"
              alt="Caravanstalling Spanje"
              width={420}
              height={95}
              priority
              className="mx-auto lg:mx-0 h-14 sm:h-20 w-auto mb-7 sm:mb-9"
              style={{
                filter:
                  'drop-shadow(0 0 32px rgba(242,169,59,0.22)) drop-shadow(0 2px 6px rgba(0,0,0,0.35))',
              }}
            />
            <div className="cs-brand-eyebrow mb-5">
              <Sun size={12} aria-hidden /> {t('home.eyebrow')}
            </div>
            <h1
              className="font-semibold tracking-tight"
              style={{
                color: '#FFFFFF',
                fontSize: 'clamp(2rem, 4vw + 1rem, 3.5rem)',
                lineHeight: 1.08,
                letterSpacing: '-0.022em',
              }}
            >
              {t('home.h1-line1')}
              <br className="hidden sm:block" />{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #FBF5EC 60%, #FFC25A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t('home.h1-line2')}
              </span>
            </h1>
            <p
              className="mt-4 leading-relaxed max-w-lg mx-auto lg:mx-0 text-[15px] sm:text-[17px]"
              style={{ color: 'rgba(251,245,236,0.78)' }}
            >
              {t('home.intro')}
            </p>

            {/* Trust-triplet met accent-tints per pill */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2"
            >
              <a
                href="https://g.co/kgs/caravanstalling"
                target="_blank"
                rel="noopener noreferrer"
                className="press-spring inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors"
                style={{
                  background: 'rgba(242,169,59,0.10)',
                  border: '1px solid rgba(242,169,59,0.28)',
                  color: '#F1F5F9',
                }}
                aria-label={t('home.trust-aria')}
              >
                <span aria-hidden className="flex items-center gap-0.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={11} fill="currentColor" style={{ color: 'var(--color-amber-bright)' }} />
                  ))}
                </span>
                <span className="text-[11px] font-medium tabular-nums">4.9</span>
                <span className="text-[11px]" style={{ color: 'rgba(241,245,249,0.65)' }}>
                  {t('home.trust-reviews')}
                </span>
              </a>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
                style={{
                  background: 'rgba(232,132,94,0.10)',
                  border: '1px solid rgba(232,132,94,0.24)',
                  color: 'rgba(255,220,205,0.95)',
                }}
              >
                <Sparkles size={11} aria-hidden style={{ color: 'var(--color-coral)' }} />
                {t('home.trust-experience')}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
                style={{
                  background: 'rgba(79,168,184,0.10)',
                  border: '1px solid rgba(79,168,184,0.26)',
                  color: 'rgba(200,230,238,0.95)',
                }}
              >
                <Wrench size={11} aria-hidden style={{ color: 'var(--color-sea)' }} />
                {t('home.trust-workshop')}
              </span>
            </motion.div>
          </div>

          {/* Foto-slot rechts — alleen op lg+. Onzichtbare placeholder
              tot src wordt ingevuld; dan vervang met:
              <PhotoSlot ratio="hero" src="/brand/hero.jpg" alt="..." priority /> */}
          <div className="hidden lg:block lg:col-span-5">
            <PhotoSlot
              ratio="hero"
              src="https://u.cubeupload.com/laurensbos/IMG3797.jpg"
              alt="Onze caravanstalling aan de Costa Brava"
              priority
              className="rounded-[var(--radius-2xl)]"
              style={{
                border: '1px solid rgba(255,255,255,0.10)',
                boxShadow: '0 24px 56px -12px rgba(0,0,0,0.5)',
              }}
            />
          </div>
        </motion.div>

        {/* Scroll-indicator — leidt naar service-cards. Decoratief, op
            mobiel verborgen want daar staan de cards al direct onder. */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="hidden sm:flex flex-col items-center gap-1 mb-8 sm:mb-12"
          style={{ color: 'rgba(241,245,249,0.5)' }}
        >
          <span className="text-[10px] uppercase tracking-[0.22em] font-medium">Bekijk diensten</span>
          <ChevronDown size={16} className="animate-bounce" />
        </motion.div>

        {/* Sectie-koptekst — context vóór de service-grid. */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="mb-6 sm:mb-8 text-center lg:text-left"
        >
          <span aria-hidden className="cs-accent-stripe mb-3 lg:hidden" style={{ display: 'block', margin: '0 auto 12px' }} />
          <span aria-hidden className="cs-accent-stripe mb-3 hidden lg:inline-block" />
          <h2
            className="font-semibold tracking-tight"
            style={{
              color: '#FFFFFF',
              fontSize: 'clamp(1.5rem, 2vw + 0.75rem, 2.125rem)',
              letterSpacing: '-0.018em',
              lineHeight: 1.15,
            }}
          >
            {t('home.section-services')}
          </h2>
          <p
            className="mt-2 max-w-xl mx-auto lg:mx-0 text-[14px] sm:text-[15px] leading-relaxed"
            style={{ color: 'rgba(251,245,236,0.62)' }}
          >
            {t('home.section-services-intro')}
          </p>
        </motion.div>

        {/* Service-grid — featured-card span 3 cols op lg, anderen 1.
            Mobile: stacked. md: 2 cols. lg: 3 cols. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <ServiceCard
            href="/koelkast"
            icon={Refrigerator}
            tag={t('home.svc-fridge-tag')}
            title={t('home.svc-fridge-title')}
            desc={t('home.svc-fridge-desc')}
            price={t('home.svc-fridge-price', fmt(prices.fridgeTable))}
            cta={t('home.svc-cta-order')}
            delay={0.05}
            accent="sea"
            featured
          />
          <ServiceCard
            href="/diensten/airco"
            icon={Wind}
            tag={t('home.svc-airco-tag')}
            title={t('home.svc-airco-title')}
            desc={t('home.svc-airco-desc')}
            price={t('home.svc-airco-price', fmt(prices.airco))}
            cta={t('home.svc-cta-order')}
            delay={0.12}
            accent="amber"
          />
          <ServiceCard
            href="/diensten/transport"
            icon={Truck}
            tag={t('home.svc-transport-tag')}
            title={t('home.svc-transport-title')}
            desc={t('home.svc-transport-desc')}
            price={`${fmt(prices.transportZelf)} – ${fmt(prices.transportWij)}`}
            cta={t('home.svc-cta-order')}
            delay={0.19}
            accent="lavender"
          />
          <ServiceCard
            href="/diensten/service"
            icon={Sparkles}
            tag={t('home.svc-service-tag')}
            title={t('home.svc-service-title')}
            desc={t('home.svc-service-desc')}
            price={t('home.svc-service-price')}
            cta={t('home.svc-cta-order')}
            delay={0.26}
            accent="coral"
          />
          <ServiceCard
            href="/diensten/stalling"
            icon={Warehouse}
            tag={t('home.svc-storage-tag')}
            title={t('home.svc-storage-title')}
            desc={t('home.svc-storage-desc')}
            price={t('home.svc-storage-price')}
            cta={t('home.svc-cta-info')}
            delay={0.33}
            accent="amber"
          />
          <ServiceCard
            href="/diensten/reparatie"
            icon={Wrench}
            tag={t('home.svc-repair-tag')}
            title={t('home.svc-repair-title')}
            desc={t('home.svc-repair-desc')}
            price={t('home.svc-repair-price')}
            cta={t('home.svc-cta-info')}
            delay={0.40}
            accent="lavender"
          />
          <ServiceCard
            href="/diensten/inspectie"
            icon={ClipboardCheck}
            tag={t('home.svc-inspection-tag')}
            title={t('home.svc-inspection-title')}
            desc={t('home.svc-inspection-desc')}
            price={t('home.svc-inspection-price')}
            cta={t('home.svc-cta-info')}
            delay={0.47}
            accent="sea"
          />
        </div>

        {/* Reassurance + contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-10 sm:mt-14 text-center"
        >
          <div
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] sm:text-[13px]"
            style={{ color: 'rgba(241,245,249,0.55)' }}
          >
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={11} aria-hidden /> {t('home.reassure-payment')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={11} aria-hidden /> {t('home.reassure-confirm')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={11} aria-hidden /> {t('home.reassure-team')}
            </span>
          </div>
          <Link
            href="/contact"
            className="inline-block mt-6 text-[13px] underline-offset-4 hover:underline transition-colors"
            style={{ color: 'rgba(241,245,249,0.7)' }}
          >
            {t('home.contact-link')}
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

// Costa Brava paleet per kaart-accent. Glow voor outer hover, stripe-
// gradient voor top-bar, text-tint voor eyebrow-tag, icon-bg voor icoon-
// container.
type Accent = 'amber' | 'sea' | 'coral' | 'lavender';

const ACCENT_MAP: Record<Accent, {
  glow: string;
  stripe: string;
  text: string;
  iconBg: string;
}> = {
  amber: {
    glow: 'rgba(242,169,59,0.20)',
    stripe: 'linear-gradient(90deg, #F2A93B 0%, #FFC25A 100%)',
    text: 'rgba(255,210,140,0.95)',
    iconBg: 'rgba(242,169,59,0.14)',
  },
  sea: {
    glow: 'rgba(79,168,184,0.22)',
    stripe: 'linear-gradient(90deg, #4FA8B8 0%, #7FCFD9 100%)',
    text: 'rgba(180,225,235,0.95)',
    iconBg: 'rgba(79,168,184,0.14)',
  },
  coral: {
    glow: 'rgba(232,132,94,0.20)',
    stripe: 'linear-gradient(90deg, #E8845E 0%, #F5A57E 100%)',
    text: 'rgba(255,210,190,0.95)',
    iconBg: 'rgba(232,132,94,0.14)',
  },
  lavender: {
    glow: 'rgba(180,154,232,0.20)',
    stripe: 'linear-gradient(90deg, #B49AE8 0%, #D5C2F2 100%)',
    text: 'rgba(220,205,250,0.95)',
    iconBg: 'rgba(180,154,232,0.14)',
  },
};

function ServiceCard({
  href, icon: Icon, tag, title, desc, price, cta, delay, accent,
  featured = false,
}: {
  href: string;
  icon: typeof Refrigerator;
  tag: string;
  title: string;
  desc: string;
  price: string;
  cta: string;
  delay: number;
  accent: Accent;
  /** Featured = grotere card, span 2 cols op md+. */
  featured?: boolean;
}) {
  const a = ACCENT_MAP[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: EASE }}
      className={featured ? 'md:col-span-2 lg:col-span-3' : ''}
    >
      <Link
        href={href}
        className="cs-service-card group block h-full p-5 sm:p-6 rounded-[var(--radius-2xl)] relative overflow-hidden transition-all hover:-translate-y-0.5"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.10)',
          backdropFilter: 'blur(8px)',
          ['--cs-card-glow' as string]: a.glow,
          ['--cs-card-accent' as string]: a.stripe,
        }}
      >
        {/* Top accent-stripe (cs-card-stripe class staat in globals.css) */}
        <span aria-hidden className="cs-card-stripe" />

        {/* Inner hover-glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(60% 60% at 25% 0%, ${a.glow} 0%, transparent 70%)`,
          }}
        />

        <div className="relative flex flex-col h-full">
          {/* Icon + tag */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
              style={{
                background: a.iconBg,
                border: `1px solid ${a.glow}`,
                color: '#F1F5F9',
              }}
            >
              <Icon size={22} aria-hidden />
            </div>
            <div
              className="text-[10px] uppercase tracking-[0.18em] font-medium pt-1.5 text-right"
              style={{ color: a.text }}
            >
              {tag}
            </div>
          </div>

          {/* Title + desc — beslaat de flex-grow zodat price/cta bottom-aligned. */}
          <div className="flex-1 mb-5">
            <h2
              className="font-semibold leading-tight"
              style={{
                color: '#FFFFFF',
                fontSize: featured ? 'clamp(1.25rem, 1.5vw + 0.6rem, 1.625rem)' : 'clamp(1.05rem, 0.6vw + 0.85rem, 1.25rem)',
                letterSpacing: '-0.014em',
              }}
            >
              {title}
            </h2>
            <p
              className="mt-2 text-[13px] sm:text-[14px] leading-relaxed"
              style={{ color: 'rgba(251,245,236,0.68)' }}
            >
              {desc}
            </p>
          </div>

          {/* Price + CTA-pijl — bottom-bar */}
          <div className="relative flex items-end justify-between gap-3 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="min-w-0">
              <div
                className="text-[10px] uppercase tracking-[0.18em] font-medium mb-0.5"
                style={{ color: 'rgba(251,245,236,0.5)' }}
              >
                {price.startsWith('vanaf ') ? 'Vanaf' : 'Prijs'}
              </div>
              <div
                className="text-[16px] sm:text-[17px] font-semibold tabular-nums truncate"
                style={{ color: '#FFFFFF' }}
              >
                {price.replace(/^vanaf /, '')}
              </div>
            </div>
            <span
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-transform group-hover:translate-x-1 shrink-0"
              style={{
                background: 'var(--gradient-sunset)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {cta}
              <ArrowRight
                size={15}
                aria-hidden
                style={{ color: 'var(--color-amber-bright)' }}
              />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
