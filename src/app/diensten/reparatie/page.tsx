'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, Phone, Droplet, Hammer, Settings, Zap, Flame, AppWindow, Refrigerator, CircleDot,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import { useLocale } from '@/components/LocaleProvider';
import type { StringKey } from '@/lib/i18n';

const EASE = [0.16, 1, 0.3, 1] as const;
type T = (k: StringKey, ...a: (string | number)[]) => string;

export default function ReparatiePage() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1">
        <Hero t={t} />
        <Specialties t={t} />
        <Process t={t} />
        <UrgentBand t={t} />
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
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
          <div>
            <motion.span {...fade(0)} className="eyebrow-mk">{t('rep1.hero-eyebrow')}</motion.span>
            <motion.h1 {...fade(0.06)} className="h1-mk" style={{ marginTop: 4 }}>{t('rep1.hero-h1')}</motion.h1>
            <motion.p {...fade(0.14)} className="lead-mk" style={{ marginTop: 14, maxWidth: 600 }}>{t('rep1.hero-lead')}</motion.p>
          </div>
          <motion.div {...fade(0.2)} className="hidden lg:block" aria-hidden>
            <WorkshopHeroSvg />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function WorkshopHeroSvg() {
  return (
    <svg viewBox="0 0 480 320" width="100%" height="auto" role="img" aria-label="Werkplaats-illustratie">
      <defs>
        <linearGradient id="repFloor" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#E5F3FB" />
          <stop offset="1" stopColor="#CDE7F6" />
        </linearGradient>
      </defs>
      <rect x="0" y="240" width="480" height="80" fill="url(#repFloor)" />
      {/* hangar */}
      <path d="M30 80 L240 30 L450 80 L450 250 L30 250 Z" fill="#FFFFFF" stroke="#2F4254" strokeWidth="2.5" />
      <path d="M30 80 L240 30 L450 80" stroke="#2F4254" strokeWidth="2.5" fill="none" />
      {/* large door */}
      <rect x="180" y="130" width="120" height="120" fill="#F8FBFD" stroke="#2F4254" strokeWidth="2" />
      <path d="M180 150 H300 M180 170 H300 M180 190 H300 M180 210 H300 M180 230 H300" stroke="#95D8FD" strokeWidth="1" />
      {/* tools wall */}
      <g transform="translate(60,140)">
        <rect width="80" height="60" fill="#F8FBFD" stroke="#2F4254" strokeWidth="1.5" rx="4" />
        <path d="M16 14 L16 34 M14 16 H30 M16 38 L16 50" stroke="#2F4254" strokeWidth="2" />
        <circle cx="50" cy="22" r="6" fill="none" stroke="#2F4254" strokeWidth="2" />
        <path d="M50 28 L50 46" stroke="#2F4254" strokeWidth="2" />
        <rect x="40" y="48" width="20" height="6" fill="#F9AD36" stroke="#2F4254" strokeWidth="1.5" />
      </g>
      {/* caravan being repaired */}
      <g transform="translate(330,160)">
        <rect width="90" height="50" rx="6" fill="#FFFFFF" stroke="#2F4254" strokeWidth="2" />
        <rect x="8" y="8" width="30" height="20" rx="3" fill="#95D8FD" stroke="#2F4254" strokeWidth="1.5" />
        <rect x="50" y="8" width="20" height="32" rx="2" fill="#F9AD36" stroke="#2F4254" strokeWidth="1.5" />
        <circle cx="20" cy="55" r="7" fill="#2F4254" />
        <circle cx="70" cy="55" r="7" fill="#2F4254" />
      </g>
      {/* spark */}
      <g transform="translate(420,150)">
        <path d="M0 0 L4 -8 L0 -4 L-6 -8 L-2 0 L-8 4 L-2 2 Z" fill="#F9AD36" />
      </g>
      {/* light */}
      <circle cx="240" cy="60" r="4" fill="#F9AD36" />
      <path d="M240 64 V90" stroke="#F9AD36" strokeWidth="1" strokeDasharray="2 3" />
    </svg>
  );
}

function Specialties({ t }: { t: T }) {
  const items: Array<{ icon: LucideIcon; titleKey: StringKey; descKey: StringKey }> = [
    { icon: Droplet, titleKey: 'rep1.spec-1-title', descKey: 'rep1.spec-1-desc' },
    { icon: Hammer, titleKey: 'rep1.spec-2-title', descKey: 'rep1.spec-2-desc' },
    { icon: Settings, titleKey: 'rep1.spec-3-title', descKey: 'rep1.spec-3-desc' },
    { icon: Zap, titleKey: 'rep1.spec-4-title', descKey: 'rep1.spec-4-desc' },
    { icon: Flame, titleKey: 'rep1.spec-5-title', descKey: 'rep1.spec-5-desc' },
    { icon: AppWindow, titleKey: 'rep1.spec-6-title', descKey: 'rep1.spec-6-desc' },
    { icon: Refrigerator, titleKey: 'rep1.spec-7-title', descKey: 'rep1.spec-7-desc' },
    { icon: CircleDot, titleKey: 'rep1.spec-8-title', descKey: 'rep1.spec-8-desc' },
  ];
  return (
    <section className="py-16 sm:py-20 section-bg-grey">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-12">
          <span className="eyebrow-mk">{t('rep1.spec-eyebrow')}</span>
          <h2 className="h2-mk">{t('rep1.spec-h2')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map(({ icon: Icon, titleKey, descKey }) => (
            <div key={titleKey} className="service-card-mk">
              <div className="ic"><Icon size={20} aria-hidden /></div>
              <h3>{t(titleKey)}</h3>
              <p>{t(descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process({ t }: { t: T }) {
  const steps: Array<{ titleKey: StringKey; descKey: StringKey }> = [
    { titleKey: 'rep1.proc-1-title', descKey: 'rep1.proc-1-desc' },
    { titleKey: 'rep1.proc-2-title', descKey: 'rep1.proc-2-desc' },
    { titleKey: 'rep1.proc-3-title', descKey: 'rep1.proc-3-desc' },
    { titleKey: 'rep1.proc-4-title', descKey: 'rep1.proc-4-desc' },
  ];
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-10 sm:mb-12">
          <span className="eyebrow-mk">{t('rep1.proc-eyebrow')}</span>
          <h2 className="h2-mk">{t('rep1.proc-h2')}</h2>
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

function UrgentBand({ t }: { t: T }) {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="cta-band-mk" style={{ background: 'var(--orange)', color: 'var(--navy)' }}>
          <div>
            <h2 className="h2-mk" style={{ margin: 0, color: 'var(--navy)' }}>{t('rep1.urg-h2')}</h2>
            <p style={{ marginTop: 8, color: 'rgba(31,42,54,0.78)', fontSize: 15, lineHeight: 1.55 }}>{t('rep1.urg-sub')}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="tel:+34633778699" className="btn" style={{ background: 'var(--navy)', color: '#fff' }}>
              <Phone size={15} aria-hidden /> Bel direct
            </a>
            <Link href="/contact?subject=Reparatie-aanvraag" className="btn" style={{ background: 'rgba(31,42,54,0.10)', color: 'var(--navy)' }}>
              Stuur bericht <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
