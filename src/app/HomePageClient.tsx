'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Phone, ArrowRight, ShieldCheck, Wrench as WrenchIcon, Truck, Sparkles,
  Snowflake, ClipboardCheck, Tag, Heart, Users, Lock, MapPin, MessageSquare,
} from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import MotionPageTransition from '@/components/motion/MotionPageTransition';
import type { StringKey } from '@/lib/i18n';
import type { LucideIcon } from 'lucide-react';
import type { Camping } from '@/lib/campings-data';

const EASE = [0.16, 1, 0.3, 1] as const;

type T = (k: StringKey, ...a: (string | number)[]) => string;

export default function HomePageClient({ campings }: { campings: Camping[] }) {
  const { t } = useLocale();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />

      <main id="main" className="flex-1">
        <MotionPageTransition>
          <Hero t={t} />
          <Stats t={t} />
          <Services t={t} />
          <Certainties t={t} />
          <Steps t={t} />
          <Security t={t} />
          <Workshop t={t} />
          <Campings campings={campings} />
          <Location t={t} />
          <CtaBand t={t} />
        </MotionPageTransition>
      </main>

      <PublicFooter />
    </div>
  );
}

// ───────────────────────────────────────────────────
// HERO — sky gradient, links tekst + dubbele CTA, rechts SVG-illustratie
// (caravan onder palm) zoals mockup p01.
// ───────────────────────────────────────────────────
function Hero({ t }: { t: T }) {
  const reduce = useReducedMotion();
  const fade = (delay = 0) =>
    reduce
      ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, ease: EASE, delay } };

  return (
    <section
      className="relative overflow-hidden"
      style={{
        minHeight: 'min(720px, 88vh)',
        display: 'flex',
        alignItems: 'center',
        background: '#0F1B24',
      }}
    >
      {/* Vimeo full-bleed achtergrond. Vimeo player serveert geen scaled
          versie via iframe, dus we vergroten 'm zodat hij het frame vult
          ongeacht aspect-ratio (object-fit cover-equivalent).
          background=1 = autoplay + loop + muted + geen controls.
          playsinline + muted = autoplay werkt op iOS/Android. */}
      <div className="absolute inset-0" style={{ zIndex: 0, overflow: 'hidden' }}>
        <iframe
          src="https://player.vimeo.com/video/1190126706?h=dae28da598&autoplay=1&loop=1&muted=1&background=1&playsinline=1&dnt=1"
          title="Caravan Storage Spain — Costa Brava"
          allow="autoplay; fullscreen; picture-in-picture"
          loading="eager"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            // 16:9 video schalen we naar minimum 100vw én 100% height; de
            // grootste van de twee wint zodat we cover-gedrag krijgen.
            width: 'max(100%, calc(100vh * 16 / 9))',
            height: 'max(100%, calc(100vw * 9 / 16))',
            border: 0,
            pointerEvents: 'none',
          }}
        />
        {/* Twee-laagse overlay:
            1) Side-gradient (links donker → rechts transparant) zodat tekst
               leesbaar is en de rechterkant van de video volledig zichtbaar.
            2) Subtiele bottom-fade zodat de overgang naar de stat-row
               (volgende sectie) zachter wordt — geen harde lijn.
            Mobile: overlay is iets gelijkmatiger (geen side-gradient,
            wel een algemene donkere wash) omdat tekst gewoon centraal staat. */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(15,27,36,0.78) 0%, rgba(15,27,36,0.55) 45%, rgba(15,27,36,0.25) 100%)',
          }}
        />
        <div
          className="absolute inset-0 sm:hidden"
          style={{
            background: 'rgba(15,27,36,0.45)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative max-w-[1200px] mx-auto px-5 sm:px-10 py-14 sm:py-20 w-full" style={{ zIndex: 1 }}>
        <div className="max-w-[760px]">
          <motion.span {...fade(0)} className="eyebrow-mk on-navy">
            {t('home1.hero-eyebrow')}
          </motion.span>
          <motion.h1
            {...fade(0.08)}
            className="h1-mk on-navy"
            style={{ marginTop: 4, textShadow: '0 2px 32px rgba(0,0,0,0.65), 0 1px 2px rgba(0,0,0,0.4)' }}
          >
            {t('home1.hero-h1-prefix')}{' '}
            <em
              style={{
                fontStyle: 'italic',
                // Warmere logo-oranje gradient zodat het accent meer pop't tegen
                // de donkere video-achtergrond. Drop-shadow met dezelfde tint
                // geeft een subtiele glow zonder overdreven te worden.
                background: 'linear-gradient(120deg, #FFB347 0%, #F9AD36 50%, #E8951C 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: '#F9AD36',
                filter: 'drop-shadow(0 2px 12px rgba(249, 173, 54, 0.45))',
              }}
            >
              {t('home1.hero-h1-accent')}
            </em>{' '}
            {t('home1.hero-h1-suffix')}
          </motion.h1>
          <motion.p
            {...fade(0.16)}
            className="lead-mk"
            style={{
              marginTop: 14,
              color: '#fff',
              textShadow: '0 2px 20px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.4)',
              maxWidth: 600,
            }}
          >
            {t('home1.hero-lead')}
          </motion.p>

          <motion.div {...fade(0.24)} className="mt-7 flex flex-wrap gap-3">
            <Link href="/reserveren/configurator" className="btn btn-primary">
              {t('home1.hero-cta-primary')} <ArrowRight size={16} aria-hidden />
            </Link>
            <Link href="/diensten" className="btn btn-ghost-light">
              {t('home1.hero-cta-secondary')}
            </Link>
          </motion.div>

          <motion.div
            {...fade(0.32)}
            className="mt-8 inline-flex items-center gap-3 px-4 py-2 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.20)',
              backdropFilter: 'blur(4px)',
              fontFamily: 'var(--sora)',
              fontSize: 13,
              color: '#fff',
              fontWeight: 600,
            }}
          >
            <span aria-hidden style={{ color: '#F9AD36', letterSpacing: 1 }}>★★★★★</span>
            {t('home1.hero-trust')}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────
// STATS — 4-cell stat-row-mk
// ───────────────────────────────────────────────────
function Stats({ t }: { t: T }) {
  const reduce = useReducedMotion();
  const stats: Array<{ vKey: StringKey; lKey: StringKey }> = [
    { vKey: 'home1.stat-1-v', lKey: 'home1.stat-1-l' },
    { vKey: 'home1.stat-2-v', lKey: 'home1.stat-2-l' },
    { vKey: 'home1.stat-3-v', lKey: 'home1.stat-3-l' },
    { vKey: 'home1.stat-4-v', lKey: 'home1.stat-4-l' },
  ];
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <motion.div
          className="stat-row-mk"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {stats.map((s, i) => (
            <motion.div
              className="stat-mk"
              key={s.vKey}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.05 + i * 0.06 }}
            >
              <div className="v">{t(s.vKey)}</div>
              <div className="l">{t(s.lKey)}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────
// SERVICES — 4x2 grid van .service-card-mk
// ───────────────────────────────────────────────────
function Services({ t }: { t: T }) {
  const items: Array<{ icon: LucideIcon; titleKey: StringKey; descKey: StringKey; href: string }> = [
    { icon: ShieldCheck, titleKey: 'home1.svc-1-title', descKey: 'home1.svc-1-desc', href: '/diensten/stalling' },
    { icon: WrenchIcon, titleKey: 'home1.svc-2-title', descKey: 'home1.svc-2-desc', href: '/diensten/reparatie' },
    { icon: Sparkles, titleKey: 'home1.svc-3-title', descKey: 'home1.svc-3-desc', href: '/diensten/service' },
    { icon: ClipboardCheck, titleKey: 'home1.svc-4-title', descKey: 'home1.svc-4-desc', href: '/diensten/inspectie' },
    { icon: Truck, titleKey: 'home1.svc-5-title', descKey: 'home1.svc-5-desc', href: '/diensten/transport' },
    { icon: Snowflake, titleKey: 'home1.svc-6-title', descKey: 'home1.svc-6-desc', href: '/koelkast' },
    { icon: Tag, titleKey: 'home1.svc-7-title', descKey: 'home1.svc-7-desc', href: '/verkoop' },
    { icon: Heart, titleKey: 'home1.svc-9-title', descKey: 'home1.svc-9-desc', href: '/caravan-huren' },
  ];
  return (
    <section className="py-16 sm:py-20 section-bg-grey">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-10 sm:mb-12">
          <span className="eyebrow-mk">{t('home1.svc-eyebrow')}</span>
          <h2 className="h2-mk">{t('home1.svc-h2')}</h2>
          <p className="lead-mk" style={{ marginTop: 10 }}>{t('home1.svc-intro')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map(({ icon: Icon, titleKey, descKey, href }, i) => (
            <motion.div
              key={href}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
            >
              <Link href={href} className="service-card-mk block" style={{ textDecoration: 'none' }}>
                <div className="ic"><Icon size={20} aria-hidden /></div>
                <h3>{t(titleKey)}</h3>
                <p>{t(descKey)}</p>
                <span className="more">{t('home1.svc-more')}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────
// CERTAINTIES — 4-koloms checklist op wit
// ───────────────────────────────────────────────────
function Certainties({ t }: { t: T }) {
  const items: Array<{ icon: LucideIcon; titleKey: StringKey; descKey: StringKey }> = [
    { icon: Users, titleKey: 'home1.cert-1-title', descKey: 'home1.cert-1-desc' },
    { icon: ShieldCheck, titleKey: 'home1.cert-2-title', descKey: 'home1.cert-2-desc' },
    { icon: WrenchIcon, titleKey: 'home1.cert-3-title', descKey: 'home1.cert-3-desc' },
    { icon: MessageSquare, titleKey: 'home1.cert-4-title', descKey: 'home1.cert-4-desc' },
  ];
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-10 sm:mb-12">
          <span className="eyebrow-mk">{t('home1.cert-eyebrow')}</span>
          <h2 className="h2-mk">{t('home1.cert-h2')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ icon: Icon, titleKey, descKey }, i) => (
            <motion.div
              key={titleKey}
              className="card-mk card-tight"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
            >
              <div
                aria-hidden
                style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'var(--sky-soft)', color: 'var(--navy)',
                  display: 'grid', placeItems: 'center', marginBottom: 14,
                }}
              >
                <Icon size={20} />
              </div>
              <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 16, color: 'var(--navy)', margin: '0 0 6px' }}>
                {t(titleKey)}
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: 0, lineHeight: 1.55 }}>
                {t(descKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────
// STEPS — timeline-mk 3 stappen
// ───────────────────────────────────────────────────
function Steps({ t }: { t: T }) {
  const steps: Array<{ titleKey: StringKey; descKey: StringKey }> = [
    { titleKey: 'home1.steps-1-title', descKey: 'home1.steps-1-desc' },
    { titleKey: 'home1.steps-2-title', descKey: 'home1.steps-2-desc' },
    { titleKey: 'home1.steps-3-title', descKey: 'home1.steps-3-desc' },
  ];
  return (
    <section className="py-16 sm:py-20 section-bg-grey">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-10 sm:mb-12">
          <span className="eyebrow-mk">{t('home1.steps-eyebrow')}</span>
          <h2 className="h2-mk">{t('home1.steps-h2')}</h2>
        </div>
        <div className="timeline-mk" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 14 }}>
          {steps.map((s, i) => (
            <div className="timeline-step" key={s.titleKey} style={{ borderLeft: i === 0 ? 'none' : '1px solid var(--line)' }}>
              <span className="n">{String(i + 1).padStart(2, '0')}</span>
              <h4>{t(s.titleKey)}</h4>
              <p>{t(s.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────
// SECURITY — navy section, checklist + foto-slot
// ───────────────────────────────────────────────────
function Security({ t }: { t: T }) {
  const bullets: StringKey[] = [
    'home1.sec-bullet-1',
    'home1.sec-bullet-2',
    'home1.sec-bullet-3',
    'home1.sec-bullet-4',
  ];
  return (
    <section className="py-16 sm:py-20 section-bg-navy">
      <div className="relative max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-14 items-center">
          <div>
            <span className="eyebrow-mk on-navy">{t('home1.sec-eyebrow')}</span>
            <h2 className="h2-mk on-navy">{t('home1.sec-h2')}</h2>
            <ul className="checklist-mk" style={{ marginTop: 24 }}>
              {bullets.map((k) => (
                <li key={k} style={{ color: '#E5EFF7' }}>
                  <span className="v" />
                  {t(k)}
                </li>
              ))}
            </ul>
          </div>
          <div
            className="relative rounded-[18px] overflow-hidden"
            style={{
              aspectRatio: '4 / 3',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
              border: '1px solid rgba(255,255,255,0.18)',
              padding: 24,
              display: 'grid',
              placeItems: 'center',
            }}
            aria-hidden
          >
            <div style={{ display: 'grid', gap: 14, width: '100%', maxWidth: 320 }}>
              <SecurityBadge label="SECURITAS DIRECT" sub="24/7 alarm-monitoring" icon={Lock} />
              <SecurityBadge label="VERZEKERD" sub="Brand · diefstal · storm" icon={ShieldCheck} />
              <SecurityBadge label="PERIMETER" sub="Hek + camera's + patrouilles" icon={ClipboardCheck} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SecurityBadge({ label, sub, icon: Icon }: { label: string; sub: string; icon: LucideIcon }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.16)',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <span
        style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'var(--sky)', color: 'var(--navy)',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}
      >
        <Icon size={20} aria-hidden />
      </span>
      <div>
        <div style={{ fontFamily: 'var(--sora)', fontWeight: 700, fontSize: 12.5, letterSpacing: 1, color: '#fff' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{sub}</div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────
// WORKSHOP — peek met SVG mock + 3 spec-chips
// ───────────────────────────────────────────────────
function Workshop({ t }: { t: T }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1fr] gap-10 lg:gap-14 items-center">
          <div
            aria-hidden
            style={{
              position: 'relative',
              aspectRatio: '5 / 4',
              borderRadius: 22,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card-mk), 0 32px 64px -24px rgba(31, 42, 54, 0.30)',
              border: '1px solid rgba(31, 42, 54, 0.10)',
              background: '#0F1B24',
            }}
          >
            {/* Vimeo background-mode iframe — schaalt cover binnen de container
                via de transform/max-trick zodat geen zwarte randen verschijnen
                bij brede of smalle viewports. */}
            <iframe
              src="https://player.vimeo.com/video/1190126706?h=dae28da598&autoplay=1&loop=1&muted=1&background=1&playsinline=1&dnt=1"
              title="Caravan Storage Spain — werkplaats"
              allow="autoplay; fullscreen; picture-in-picture"
              loading="lazy"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'max(100%, calc(100% * 16 / 9 * 4 / 5))',
                height: 'max(100%, calc(100% * 9 / 16 * 5 / 4))',
                border: 0,
                pointerEvents: 'none',
              }}
            />
          </div>
          <div>
            <span className="eyebrow-mk">{t('home1.shop-eyebrow')}</span>
            <h2 className="h2-mk">{t('home1.shop-h2')}</h2>
            <p className="lead-mk" style={{ marginTop: 10 }}>{t('home1.shop-intro')}</p>
            <div className="flex flex-wrap gap-3 mt-6">
              <span className="spec-chip">
                <span className="v">{t('home1.shop-spec-1-v')}</span>
                <span className="l">{t('home1.shop-spec-1-l')}</span>
              </span>
              <span className="spec-chip">
                <span className="v">{t('home1.shop-spec-2-v')}</span>
                <span className="l">{t('home1.shop-spec-2-l')}</span>
              </span>
              <span className="spec-chip">
                <span className="v">{t('home1.shop-spec-3-v')}</span>
                <span className="l">{t('home1.shop-spec-3-l')}</span>
              </span>
            </div>
            <div className="mt-7">
              <Link href="/diensten/reparatie" className="btn btn-ghost">
                {t('home1.svc-more')} <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkshopSvg() {
  return (
    <svg viewBox="0 0 480 280" width="100%" height="auto" role="img" aria-label="Werkplaats">
      <defs>
        <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#E5F3FB" />
          <stop offset="1" stopColor="#CDE7F6" />
        </linearGradient>
      </defs>
      <rect x="0" y="200" width="480" height="80" fill="url(#floor)" />
      {/* hall outline */}
      <path d="M30 60 L240 24 L450 60 L450 220 L30 220 Z" fill="#F8FBFD" stroke="#2F4254" strokeWidth="2.5" />
      {/* roof beams */}
      <path d="M30 60 L240 24 L450 60" stroke="#2F4254" strokeWidth="2.5" fill="none" />
      <path d="M240 24 V220" stroke="#95D8FD" strokeWidth="1.5" strokeDasharray="4 4" />
      {/* hangar door */}
      <rect x="180" y="120" width="120" height="100" fill="#FFFFFF" stroke="#2F4254" strokeWidth="2" />
      <path d="M180 140 H300 M180 160 H300 M180 180 H300 M180 200 H300" stroke="#2F4254" strokeWidth="1" />
      {/* caravan inside on left */}
      <g transform="translate(56,150)">
        <rect width="100" height="46" rx="6" fill="#FFFFFF" stroke="#2F4254" strokeWidth="2" />
        <rect x="10" y="8" width="34" height="20" rx="3" fill="#95D8FD" stroke="#2F4254" strokeWidth="1.5" />
        <rect x="56" y="8" width="20" height="28" rx="2" fill="#F9AD36" stroke="#2F4254" strokeWidth="1.5" />
        <circle cx="22" cy="50" r="7" fill="#2F4254" />
        <circle cx="78" cy="50" r="7" fill="#2F4254" />
      </g>
      {/* ladder */}
      <path d="M340 80 V210 M360 80 V210 M340 100 H360 M340 130 H360 M340 160 H360 M340 190 H360" stroke="#2F4254" strokeWidth="2" fill="none" />
      {/* light */}
      <circle cx="240" cy="40" r="4" fill="#F9AD36" />
      <path d="M240 44 V60" stroke="#F9AD36" strokeWidth="1" strokeDasharray="2 3" />
    </svg>
  );
}

// ───────────────────────────────────────────────────
// CAMPINGS — strip met aangesloten campings (live uit hub)
// ───────────────────────────────────────────────────
function Campings({ campings }: { campings: Camping[] }) {
  // Toon max 8 campings met foto, willekeurige (deterministisch — eerste 8).
  const items = campings.filter((c) => c.photos && c.photos.length > 0).slice(0, 8);
  if (items.length === 0) return null;
  return (
    <section className="py-16 sm:py-20 section-bg-grey">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="max-w-[640px]">
            <span className="eyebrow-mk">Aangesloten campings</span>
            <h2 className="h2-mk">Wij leveren op {campings.length}+ campings aan de Costa Brava</h2>
            <p className="lead-mk" style={{ marginTop: 10 }}>
              Koelkasten, airco-units en transport tot aan jouw plek — op vaste partner-campings van Empuriabrava tot Blanes.
            </p>
          </div>
          <Link href="/aangesloten-campings" className="btn btn-ghost" style={{ alignSelf: 'flex-start' }}>
            Bekijk alle campings <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((c) => (
            <Link
              key={c.id}
              href={`/aangesloten-campings/${c.slug}`}
              className="card-mk card-lift block"
              style={{ padding: 0, overflow: 'hidden', textDecoration: 'none' }}
            >
              <div style={{ position: 'relative', aspectRatio: '4 / 3', background: 'var(--surface-2)', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.photos[0]}
                  alt={c.name}
                  loading="lazy"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '12px 14px 14px' }}>
                <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 14, color: 'var(--navy)', margin: '0 0 2px' }}>
                  {c.name}
                </h3>
                <p style={{ fontSize: 12.5, color: 'var(--ink-2)', margin: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} aria-hidden /> {c.location}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────
// LOCATION — kaart-strip met dot-pattern
// ───────────────────────────────────────────────────
function Location({ t }: { t: T }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-14 items-center">
          <div>
            <span className="eyebrow-mk">{t('home1.loc-eyebrow')}</span>
            <h2 className="h2-mk">{t('home1.loc-h2')}</h2>
            <p className="lead-mk" style={{ marginTop: 10 }}>{t('home1.loc-intro')}</p>
            <p style={{ fontFamily: 'var(--sora)', fontWeight: 600, color: 'var(--navy)', marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={16} aria-hidden /> {t('home1.loc-address')}
            </p>
            <div className="mt-5">
              <a
                href="https://maps.google.com/?q=Ctra+de+Palamos+9,+17110+Sant+Climent+de+Peralta,+Girona,+Spain"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                {t('home1.loc-cta')}
              </a>
            </div>
          </div>
          <div
            className="relative rounded-[18px] overflow-hidden"
            style={{
              aspectRatio: '5 / 4',
              boxShadow: 'var(--shadow-card-mk), 0 32px 64px -24px rgba(31, 42, 54, 0.30)',
              border: '1px solid rgba(31, 42, 54, 0.10)',
              background: '#0F1B24',
            }}
            aria-hidden
          >
            <iframe
              src="https://player.vimeo.com/video/1190144902?autoplay=1&loop=1&muted=1&background=1&playsinline=1&dnt=1"
              title="Caravan Storage Spain — locatie Sant Climent de Peralta"
              allow="autoplay; fullscreen; picture-in-picture"
              loading="lazy"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'max(100%, calc(100% * 16 / 9 * 4 / 5))',
                height: 'max(100%, calc(100% * 9 / 16 * 5 / 4))',
                border: 0,
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function LocationMapSvg() {
  return (
    <svg viewBox="0 0 480 380" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="presentation">
      {/* coastline curve */}
      <path d="M0 240 Q120 180 220 220 T480 200" stroke="#2F4254" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M0 250 Q120 195 220 230 T480 215 L480 380 L0 380 Z" fill="#95D8FD" opacity="0.5" />
      {/* roads */}
      <path d="M50 80 Q180 120 220 200 T410 320" stroke="#FFFFFF" strokeWidth="3" fill="none" />
      <path d="M50 80 Q180 120 220 200 T410 320" stroke="#2F4254" strokeWidth="1" fill="none" strokeDasharray="6 6" />
      {/* pin at our location */}
      <g transform="translate(220,200)">
        <circle r="22" fill="#F9AD36" opacity="0.25" />
        <circle r="12" fill="#F9AD36" stroke="#2F4254" strokeWidth="2" />
        <circle r="4" fill="#2F4254" />
      </g>
      {/* labels */}
      <text x="120" y="80" fontFamily="var(--sora)" fontSize="12" fontWeight="600" fill="#2F4254" opacity="0.7">Girona</text>
      <text x="370" y="335" fontFamily="var(--sora)" fontSize="12" fontWeight="600" fill="#2F4254" opacity="0.7">Palamós</text>
      <text x="240" y="194" fontFamily="var(--sora)" fontSize="12" fontWeight="700" fill="#2F4254">Wij</text>
    </svg>
  );
}

// ───────────────────────────────────────────────────
// CTA-BAND — navy met grain
// ───────────────────────────────────────────────────
function CtaBand({ t }: { t: T }) {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="cta-band-mk">
          <div>
            <h2 className="h2-mk on-navy" style={{ margin: 0 }}>
              {t('home1.cta-h2')}
            </h2>
            <p style={{ marginTop: 8, color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.55 }}>
              {t('home1.cta-sub')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/reserveren/configurator" className="btn btn-primary">
              {t('home1.cta-primary')} <ArrowRight size={16} aria-hidden />
            </Link>
            <a href="tel:+34633778699" className="btn btn-ghost-light">
              <Phone size={15} aria-hidden /> {t('home1.cta-secondary')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
