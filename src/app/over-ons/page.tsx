'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart, Eye, Users, ArrowRight, Phone, MapPin, ShieldCheck, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import MotionPageTransition from '@/components/motion/MotionPageTransition';
import { useLocale } from '@/components/LocaleProvider';
import type { StringKey } from '@/lib/i18n';

const EASE = [0.16, 1, 0.3, 1] as const;
type T = (k: StringKey, ...a: (string | number)[]) => string;

export default function OverOnsPage() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1">
        <MotionPageTransition>
          <Hero t={t} />
          <Approach t={t} />
          <Values t={t} />
          <CtaBand />
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
          <motion.span {...fade(0)} className="eyebrow-mk">{t('abo1.hero-eyebrow')}</motion.span>
          <motion.h1 {...fade(0.06)} className="h1-mk" style={{ marginTop: 4 }}>{t('abo1.hero-h1')}</motion.h1>
          <motion.p {...fade(0.14)} className="lead-mk" style={{ marginTop: 14, maxWidth: 700 }}>{t('abo1.hero-lead')}</motion.p>
        </div>
      </div>
    </section>
  );
}

function Approach({ t }: { t: T }) {
  void t;
  // Vier feitelijke claims die kloppen — eigen werkplaats, beveiliging,
  // Nederlandstalig, locatie. Geen team-namen of jaartallen die we niet
  // hard kunnen onderbouwen.
  const items: Array<{ icon: LucideIcon; t: string; d: string }> = [
    {
      icon: Wrench,
      t: 'Eigen werkplaats van 850 m²',
      d: 'Geen externe garages of vertaalpartners. Onze monteurs werken op locatie — alle reparaties, onderhoud en inspecties gebeuren in onze eigen hal.',
    },
    {
      icon: ShieldCheck,
      t: '24/7 Securitas Direct',
      d: 'Camera\'s, alarm en perimeter-controle elke nacht. Brand-, diefstal- en stormverzekering standaard inbegrepen.',
    },
    {
      icon: Users,
      t: 'Vast Nederlands-Spaans team',
      d: 'Geen wisselend personeel of call-center. Eén aanspreekpunt in jouw taal, vaste monteurs die je caravan kennen.',
    },
    {
      icon: MapPin,
      t: 'Costa Brava — rustig binnenland',
      d: 'Sant Climent de Peralta — 15 minuten van Palamós, 35 minuten van Girona Airport. Goed bereikbaar maar weg van de drukte.',
    },
  ];
  return (
    <section className="py-16 sm:py-20 section-bg-grey">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-12">
          <span className="eyebrow-mk">Onze werkwijze</span>
          <h2 className="h2-mk">Wat ons anders maakt</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {items.map(({ icon: Icon, t: title, d: desc }) => (
            <div key={title} className="card-mk" style={{ padding: 28 }}>
              <span
                aria-hidden
                style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'var(--sky-soft)', color: 'var(--navy)',
                  display: 'grid', placeItems: 'center', marginBottom: 16,
                }}
              >
                <Icon size={22} />
              </span>
              <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 17, color: 'var(--navy)', margin: '0 0 8px' }}>
                {title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Values({ t }: { t: T }) {
  const items: Array<{ icon: LucideIcon; tKey: StringKey; dKey: StringKey }> = [
    { icon: Eye, tKey: 'abo1.val-1-t', dKey: 'abo1.val-1-d' },
    { icon: Heart, tKey: 'abo1.val-2-t', dKey: 'abo1.val-2-d' },
    { icon: Users, tKey: 'abo1.val-3-t', dKey: 'abo1.val-3-d' },
  ];
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-12">
          <span className="eyebrow-mk">{t('abo1.val-eyebrow')}</span>
          <h2 className="h2-mk">{t('abo1.val-h2')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map(({ icon: Icon, tKey, dKey }) => (
            <div key={tKey} className="card-mk" style={{ padding: 28 }}>
              <span
                aria-hidden
                style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'var(--sky-soft)', color: 'var(--navy)',
                  display: 'grid', placeItems: 'center', marginBottom: 16,
                }}
              >
                <Icon size={22} />
              </span>
              <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 18, color: 'var(--navy)', margin: '0 0 8px' }}>
                {t(tKey)}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>
                {t(dKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="cta-band-mk">
          <div>
            <h2 className="h2-mk on-navy" style={{ margin: 0 }}>
              Kom een keer langs.
            </h2>
            <p style={{ marginTop: 8, color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.55 }}>
              Wij geven graag een rondleiding op afspraak. Kom kijken naar de werkplaats, de stalling en de plek waar je caravan zou staan.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              href="/contact?topic=storage&subject=Rondleiding"
              className="btn btn-primary"
            >
              Plan rondleiding <ArrowRight size={15} aria-hidden />
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
