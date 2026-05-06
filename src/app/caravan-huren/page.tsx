'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ExternalLink, ShieldCheck, Calendar, Truck, Heart, MapPin } from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import MotionPageTransition from '@/components/motion/MotionPageTransition';

const EASE = [0.16, 1, 0.3, 1] as const;

const VERHUUR_URL = 'https://caravanverhuurspanje.com';
const VERHUUR_LOGO = 'https://u.cubeupload.com/laurensbos/12aCaravanverhuur2.png';

export default function CaravanHurenPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1">
        <MotionPageTransition>
          <Hero />
          <Features />
          <CtaBand />
        </MotionPageTransition>
      </main>
      <PublicFooter />
    </div>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const fade = (delay = 0) =>
    reduce
      ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: EASE, delay } };

  return (
    <section className="section-bg-sky-soft">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-10 lg:gap-14 items-center">
          <div>
            <motion.div
              {...fade(0)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 14px',
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: 999,
                marginBottom: 18,
                boxShadow: 'var(--shadow-card-mk)',
              }}
            >
              <Image
                src={VERHUUR_LOGO}
                alt="Caravanverhuur Spanje logo"
                width={180}
                height={40}
                style={{ height: 22, width: 'auto', objectFit: 'contain' }}
              />
              <span style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 12, color: 'var(--muted)', letterSpacing: 0.4 }}>
                ZUSTERSITE
              </span>
            </motion.div>

            <motion.span {...fade(0.05)} className="eyebrow-mk">Caravan huren</motion.span>
            <motion.h1 {...fade(0.1)} className="h1-mk" style={{ marginTop: 4 }}>
              Geen eigen caravan? Huur er een aan de Costa Brava.
            </motion.h1>
            <motion.p {...fade(0.16)} className="lead-mk" style={{ marginTop: 14, maxWidth: 600 }}>
              Onze zusterbedrijf <strong>Caravanverhuur Spanje</strong> levert caravans
              op alle aangesloten campings — bezorgd, opgesteld en klaar voor je vakantie.
              Geen gesleep met eigen caravan.
            </motion.p>

            <motion.div {...fade(0.22)} className="mt-7 flex flex-wrap gap-3">
              <a
                href={VERHUUR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Bekijk aanbod <ExternalLink size={15} aria-hidden />
              </a>
              <Link href="/aangesloten-campings" className="btn btn-ghost">
                <MapPin size={14} aria-hidden /> Bekijk campings
              </Link>
            </motion.div>

            <motion.div {...fade(0.3)} style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <span className="spec-chip">
                <span className="v">50+</span>
                <span className="l">Campings</span>
              </span>
              <span className="spec-chip">
                <span className="v">All-in</span>
                <span className="l">Bezorgd + opgesteld</span>
              </span>
              <span className="spec-chip">
                <span className="v">NL/EN</span>
                <span className="l">Eigen team</span>
              </span>
            </motion.div>
          </div>

          {/* Hero image */}
          <motion.div {...fade(0.18)} className="hidden lg:block">
            <div
              style={{
                position: 'relative',
                aspectRatio: '5 / 4',
                borderRadius: 22,
                overflow: 'hidden',
                boxShadow: 'var(--shadow-card-mk), 0 32px 64px -24px rgba(31, 42, 54, 0.30)',
                border: '1px solid rgba(255, 255, 255, 0.40)',
              }}
            >
              <Image
                src="/images/caravanverhuur/hero.jpg"
                alt="Caravan aan de Costa Brava"
                fill
                priority
                sizes="(max-width: 1024px) 0px, 540px"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: ShieldCheck,
      title: 'All-in service',
      desc: 'Caravan staat klaar bij aankomst — wij bezorgen, stellen op, en halen op aan het eind.',
    },
    {
      icon: MapPin,
      title: 'Op je gewenste camping',
      desc: '50+ aangesloten campings aan de Costa Brava — kies de plek die jij wilt.',
    },
    {
      icon: Calendar,
      title: 'Flexibele periodes',
      desc: 'Van een weekend tot een hele zomer. Online boeken, online betalen.',
    },
    {
      icon: Truck,
      title: 'Eigen vrachtwagens',
      desc: 'Wij rijden zelf met onze trucks van stalling naar je camping en terug.',
    },
    {
      icon: Heart,
      title: 'Familiebedrijf',
      desc: 'Zelfde Nederlandse team als de stalling — één aanspreekpunt voor alles.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 section-bg-grey">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-10 sm:mb-12">
          <span className="eyebrow-mk">Wat we doen</span>
          <h2 className="h2-mk">Volledig verzorgde caravan-vakanties</h2>
          <p className="lead-mk" style={{ marginTop: 10 }}>
            Caravanverhuur Spanje is sinds 2019 onze verhuurtak — zelfde team, zelfde locatie, een nieuwe service.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card-mk" style={{ padding: 24 }}>
              <span
                aria-hidden
                style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'var(--sky-soft)', color: 'var(--navy)',
                  display: 'grid', placeItems: 'center', marginBottom: 14,
                }}
              >
                <Icon size={20} />
              </span>
              <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 16, color: 'var(--navy)', margin: '0 0 6px' }}>
                {title}
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: 0, lineHeight: 1.55 }}>
                {desc}
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
              Klaar om te boeken?
            </h2>
            <p style={{ marginTop: 8, color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.55 }}>
              Onze volledige caravan-collectie, prijzen, foto&apos;s en boekform vind je op caravanverhuurspanje.com.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a
              href={VERHUUR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Naar Caravanverhuur Spanje <ArrowRight size={15} aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
