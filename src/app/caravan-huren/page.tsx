'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, ExternalLink, Tent, Package, Camera, Wallet, Shield, Truck,
  CheckCircle, ChevronDown, Sun, MapPin,
  Armchair, UtensilsCrossed, Wine, Utensils, Trash2, BedDouble,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import MotionPageTransition from '@/components/motion/MotionPageTransition';

const EASE = [0.16, 1, 0.3, 1] as const;

const VERHUUR_URL = 'https://caravanverhuurspanje.com';
const VERHUUR_LOGO = 'https://u.cubeupload.com/laurensbos/12aCaravanverhuur2.png';

// Hero-video uit caravanverhuurspanje.com homepage. HLS voor mobile (native
// <video>), iframe voor desktop (zelfde Gumlet stream maar met betere
// controls + autoplay). Poster fallback voor de eerste paint.
const VIDEO_HLS = 'https://video.gumlet.io/69b470b7bf83f6c336bc88cc/69b49548dc37184fc78c660f/main.m3u8';
const VIDEO_IFRAME = 'https://play.gumlet.io/embed/69b49548dc37184fc78c660f?background=true&disable_player_controls=true&preload=true&subtitles=off&resolution=1080p&t=30';
const VIDEO_POSTER = 'https://video.gumlet.io/69b470b7bf83f6c336bc88cc/69b49548dc37184fc78c660f/thumbnail-1-0.png?format=auto&ar=1920:1080&mode=crop&w=1600';

export default function CaravanHurenPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1">
        <MotionPageTransition>
          <Hero />
          <Usps />
          <HowItWorks />
          <InventoryBlock />
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
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: EASE, delay } };

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: 'min(640px, 80vh)', display: 'flex', alignItems: 'flex-end' }}
    >
      {/* Video achtergrond */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        {/* Poster fallback (instant paint) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={VIDEO_POSTER}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'cover' }}
        />
        {/* Mobile native video — autoplays met poster, HLS bron */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full sm:hidden"
          style={{ objectFit: 'cover' }}
          poster={VIDEO_POSTER}
        >
          <source src={VIDEO_HLS} type="application/x-mpegURL" />
        </video>
        {/* Desktop iframe — zelfde stream, betere quality */}
        <iframe
          src={VIDEO_IFRAME}
          title="Costa Brava video"
          allow="autoplay; fullscreen"
          loading="eager"
          className="absolute inset-0 w-full h-full hidden sm:block"
          style={{ border: 0, transform: 'scale(1.4)', pointerEvents: 'none' }}
        />
        {/* Donkere gradient voor leesbaarheid */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(15,23,32,0.85) 0%, rgba(15,23,32,0.50) 50%, rgba(15,23,32,0.20) 100%)',
          }}
        />
      </div>

      {/* Hero-content */}
      <div className="relative max-w-[1200px] mx-auto px-5 sm:px-10 py-12 sm:py-20 w-full" style={{ zIndex: 1 }}>
        <div className="max-w-[720px]">
          <motion.div
            {...fade(0)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 14px',
              background: 'rgba(255, 255, 255, 0.92)',
              borderRadius: 999,
              marginBottom: 18,
              boxShadow: '0 8px 24px -10px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={VERHUUR_LOGO}
              alt="Caravanverhuur Spanje logo"
              style={{ height: 22, width: 'auto', objectFit: 'contain' }}
            />
            <span style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, color: 'var(--muted)', letterSpacing: 0.6 }}>
              ZUSTERSITE
            </span>
          </motion.div>

          <motion.span {...fade(0.06)} className="eyebrow-mk on-navy">
            <Sun size={12} aria-hidden style={{ display: 'inline', marginRight: 6 }} /> Vakantie zonder gedoe
          </motion.span>
          <motion.h1
            {...fade(0.12)}
            style={{
              fontFamily: 'var(--sora)', fontWeight: 800, color: '#fff',
              fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.05, marginTop: 6,
              textShadow: '0 2px 24px rgba(0,0,0,0.4)', letterSpacing: '-0.02em',
            }}
          >
            Geen eigen caravan? Huur er een.
          </motion.h1>
          <motion.p
            {...fade(0.18)}
            style={{
              color: 'rgba(255,255,255,0.92)', fontSize: 'clamp(15px, 2.2vw, 18px)',
              lineHeight: 1.55, maxWidth: 580, marginTop: 16,
              textShadow: '0 1px 16px rgba(0,0,0,0.4)',
            }}
          >
            Onze zustersite <strong>Caravanverhuur Spanje</strong> levert volledig
            uitgeruste caravans op partner-campings aan de Costa Brava — bezorgd,
            opgesteld en klaar voor jouw vakantie.
          </motion.p>

          <motion.div {...fade(0.24)} className="mt-7 flex flex-wrap gap-3">
            <a
              href={VERHUUR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Bekijk aanbod <ExternalLink size={15} aria-hidden />
            </a>
            <Link
              href="/aangesloten-campings"
              className="btn btn-ghost-light"
            >
              <MapPin size={14} aria-hidden /> Bekijk campings
            </Link>
          </motion.div>

          <motion.div {...fade(0.32)} style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <span className="spec-chip" style={{ background: 'rgba(255,255,255,0.92)' }}>
              <span className="v">50+</span>
              <span className="l">Campings</span>
            </span>
            <span className="spec-chip" style={{ background: 'rgba(255,255,255,0.92)' }}>
              <span className="v">All-in</span>
              <span className="l">Bezorgd + opgesteld</span>
            </span>
            <span className="spec-chip" style={{ background: 'rgba(255,255,255,0.92)' }}>
              <span className="v">25%</span>
              <span className="l">Aanbetaling</span>
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// USPs uit verhuur-site i18n (NL): klaar/inventaris/foto's/betaling/borg/transport.
const USPS: Array<{ icon: LucideIcon; title: string; desc: string }> = [
  {
    icon: Tent,
    title: 'Klaar op de camping',
    desc: 'Wij zetten de caravan neer op jouw staanplaats en bouwen de luifel op. Na je vakantie breken wij alles weer af en halen de caravan op. Verder niets — jij hoeft alleen te genieten.',
  },
  {
    icon: Package,
    title: 'Volledige inventaris',
    desc: 'Kookgerei, servies, handdoeken en meer — alles zit erin. Alleen beddengoed neem je zelf mee, of huur het bij ons.',
  },
  {
    icon: Camera,
    title: 'Foto’s vooraf',
    desc: 'Bekijk vooraf foto’s en video’s van jouw caravan. Zo weet je precies wat je kunt verwachten.',
  },
  {
    icon: Wallet,
    title: 'Flexibel betalen',
    desc: 'Betaal slechts 25% aanbetaling bij boeking. Veilig via iDEAL, Wero of bankoverschrijving.',
  },
  {
    icon: Shield,
    title: 'Borg-bescherming',
    desc: 'Transparante borgvoorwaarden. Na een positieve uitcheck-inspectie ontvang je de volledige borg retour.',
  },
  {
    icon: Truck,
    title: 'Transport mogelijk',
    desc: 'Heb je een eigen caravan? Via Caravanstalling Spanje kun je transport naar Costa Brava boeken.',
  },
];

function Usps() {
  return (
    <section className="py-16 sm:py-20 section-bg-grey">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-10 sm:mb-12">
          <span className="eyebrow-mk">Waarom verhuur via ons</span>
          <h2 className="h2-mk">Volledig ontzorgd op vakantie</h2>
          <p className="lead-mk" style={{ marginTop: 10 }}>
            Wij regelen alles zodat jij alleen maar hoeft te genieten van de zon, zee en strand op de Costa Brava.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {USPS.map(({ icon: Icon, title, desc }) => (
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

function HowItWorks() {
  const steps: Array<{ n: string; title: string; desc: string }> = [
    {
      n: '01',
      title: 'Kies een caravan',
      desc: 'Bekijk online de beschikbare caravans, foto’s, plek en periode op caravanverhuurspanje.com.',
    },
    {
      n: '02',
      title: 'Boek + 25% aanbetaling',
      desc: 'Reserveer je periode online, betaal 25% aan om je plek vast te zetten. Rest 6 weken vóór aankomst.',
    },
    {
      n: '03',
      title: 'Wij zetten ‘m klaar',
      desc: 'Bij aankomst staat je caravan op de afgesproken plek, opgebouwd, schoon en gevuld. Sleutel ligt klaar.',
    },
    {
      n: '04',
      title: 'Genieten + uitchecken',
      desc: 'Na je vakantie checkt ons team de caravan, breken alles op en halen ‘m op. Borg retour binnen 14 dagen.',
    },
  ];
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-10 sm:mb-12">
          <span className="eyebrow-mk">Zo werkt het</span>
          <h2 className="h2-mk">In 4 stappen op vakantie</h2>
        </div>
        <div className="timeline-mk" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 14 }}>
          {steps.map((s, i) => (
            <div className="timeline-step" key={s.n} style={{ borderLeft: i === 0 ? 'none' : '1px solid var(--line)' }}>
              <span className="n">{s.n}</span>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Inventaris-blok: gekopieerd uit verhuur-site (zelfde categorieën +
// items). Collapsible per categorie zodat de pagina niet overweldigt.
const INVENTORY: Array<{ label: string; Icon: LucideIcon; items: string[] }> = [
  {
    label: 'Buiten',
    Icon: Armchair,
    items: ['4 tuinstoelen', '1 tuintafel'],
  },
  {
    label: 'Keuken',
    Icon: UtensilsCrossed,
    items: ['Koffiezetapparaat (Senseo)', 'Waterkoker', '2 koekenpannen', '2 kookpannen', 'Snijplanken', '3 pannenonderzetters', 'Vergiet', 'Maatbeker', 'Rasp', 'Gasfles'],
  },
  {
    label: 'Servies & glazen',
    Icon: Wine,
    items: ['6 grote borden', '6 ontbijtborden', '6 soepkommen', '6 theeglazen', '6 koffiemokken', '6 longdrink-glazen', '6 bierglazen', '6 wijnglazen'],
  },
  {
    label: 'Bestek & keukengerief',
    Icon: Utensils,
    items: ['6 lepels', '6 vorken', '6 messen', '6 theelepels', '2 schilmessen', '2 opscheplepels', 'Snijmes', 'Schaar', 'Flessenopener', 'Kaasschaaf', 'Blikopener'],
  },
  {
    label: 'Schoonmaak',
    Icon: Trash2,
    items: ['Pedaalemmer', 'Stoffer + blik', 'Afwasbak', 'Emmer', 'Vloerveger', 'Droogrek', 'Wasknijpers'],
  },
  {
    label: 'Slaapkamers',
    Icon: BedDouble,
    items: ['4 slaapplekken (2 kamers)', '10 kledinghangers', 'Lampje'],
  },
];

function InventoryBlock() {
  const [openCat, setOpenCat] = useState<number | null>(0);
  const totalItems = INVENTORY.reduce((sum, c) => sum + c.items.length, 0);
  return (
    <section className="py-16 sm:py-20 section-bg-grey">
      <div className="max-w-[820px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-10">
          <span className="eyebrow-mk">Wat zit erbij</span>
          <h2 className="h2-mk">Volledige inventaris inbegrepen</h2>
          <p className="lead-mk" style={{ marginTop: 10 }}>
            {totalItems}+ items, klaar om te gebruiken. Alleen beddengoed neem je zelf mee — of huur het bij ons.
          </p>
        </div>
        <div className="card-mk" style={{ padding: 0, overflow: 'hidden' }}>
          {INVENTORY.map((cat, i) => {
            const isOpen = openCat === i;
            const Icon = cat.Icon;
            return (
              <div key={cat.label} style={{ borderBottom: i < INVENTORY.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <button
                  type="button"
                  onClick={() => setOpenCat(isOpen ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 22px', background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  aria-expanded={isOpen}
                >
                  <span style={{ color: 'var(--orange-d)', display: 'inline-flex' }}>
                    <Icon size={18} />
                  </span>
                  <span style={{ flex: 1, fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 15, color: 'var(--navy)' }}>
                    {cat.label}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--muted)', marginRight: 4 }}>
                    {cat.items.length}
                  </span>
                  <ChevronDown
                    size={16}
                    style={{
                      color: 'var(--muted)',
                      transition: 'transform 0.18s',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>
                {isOpen && (
                  <div style={{ padding: '4px 22px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 6 }}>
                    {cat.items.map((it) => (
                      <span
                        key={it}
                        style={{
                          fontSize: 12.5, color: 'var(--ink-2)',
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '6px 10px', background: 'var(--bg)', borderRadius: 8,
                        }}
                      >
                        <CheckCircle size={11} aria-hidden style={{ color: 'var(--orange-d)', flexShrink: 0 }} />
                        {it}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
