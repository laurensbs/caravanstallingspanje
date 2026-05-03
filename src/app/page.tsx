'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Refrigerator, Wind, Truck, Sun, Sparkles, Star, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocale } from '@/components/LocaleProvider';
import LocaleSwitch from '@/components/LocaleSwitch';
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
  const { locale } = useLocale();
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
      {/* Glow boven */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] blur-3xl"
        style={{
          background:
            'radial-gradient(40% 55% at 50% 28%, rgba(126,168,255,0.22) 0%, rgba(126,168,255,0.08) 40%, transparent 75%)',
        }}
      />
      {/* Warme zomer-glow rechts onder */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-20 h-[480px] w-[480px] blur-3xl opacity-50"
        style={{
          background: 'radial-gradient(50% 50% at 50% 50%, rgba(255,180,80,0.18) 0%, transparent 70%)',
        }}
      />

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <LocaleSwitch />
      </div>

      <div className="relative max-w-3xl mx-auto px-5 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-center mb-10 sm:mb-14"
        >
          <Image
            src="/images/logo.png"
            alt="Caravanstalling Spanje"
            width={420}
            height={95}
            priority
            className="mx-auto h-14 sm:h-20 w-auto mb-7 sm:mb-9"
            style={{
              filter:
                'drop-shadow(0 0 28px rgba(255,255,255,0.18)) drop-shadow(0 2px 6px rgba(0,0,0,0.35))',
            }}
          />
          <div
            className="inline-flex items-center gap-1.5 mb-5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.22em]"
            style={{
              background: 'rgba(255,180,80,0.12)',
              color: 'rgba(255,210,140,0.95)',
              border: '1px solid rgba(255,180,80,0.25)',
            }}
          >
            <Sun size={12} /> Klaar voor de zomer
          </div>
          <h1
            className="text-[30px] sm:text-[44px] leading-[1.1] font-semibold tracking-tight"
            style={{ color: '#FFFFFF' }}
          >
            Maak het op je staanplaats
            <br className="hidden sm:block" /> meteen comfortabel
          </h1>
          <p
            className="mt-4 leading-relaxed max-w-lg mx-auto text-[15px] sm:text-[17px]"
            style={{ color: 'rgba(241,245,249,0.72)' }}
          >
            Koelkast, airco of transport van/naar de camping — wij regelen het.
            Direct online bestellen, betalen en wij staan voor je klaar.
          </p>

          {/* Trust-triplet — geïntegreerd onder de hero-CTA. Behoudt de
              click-naar-Google review als primaire tegel; voegt 25 jaar +
              eigen werkplaats toe als visuele bekrachtiging. */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            <a
              href="https://g.co/kgs/caravanstalling"
              target="_blank"
              rel="noopener noreferrer"
              className="press-spring inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: '#F1F5F9',
              }}
              aria-label="4.9 sterren op 25 Google reviews"
            >
              <span aria-hidden className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={11} fill="currentColor" style={{ color: 'var(--color-amber)' }} />
                ))}
              </span>
              <span className="text-[11px] font-medium tabular-nums">4.9</span>
              <span className="text-[11px]" style={{ color: 'rgba(241,245,249,0.6)' }}>
                · 25 reviews
              </span>
            </a>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(241,245,249,0.85)',
              }}
            >
              <Sparkles size={11} aria-hidden style={{ color: 'var(--color-amber)' }} />
              25 jaar ervaring
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(241,245,249,0.85)',
              }}
            >
              <Wrench size={11} aria-hidden style={{ color: 'rgba(241,245,249,0.7)' }} />
              Eigen werkplaats
            </span>
          </motion.div>
        </motion.div>

        {/* CTA cards */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <ServiceCard
            href="/koelkast"
            icon={Refrigerator}
            tag="Vanaf één week"
            title="Koelkast huren"
            desc="Bezorgd op je staanplaats — koel bier, verse boodschappen, geen gedoe."
            price={`vanaf ${fmt(prices.fridgeTable)}/wk`}
            delay={0.05}
            accent="cyan"
          />
          <ServiceCard
            href="/diensten/airco"
            icon={Wind}
            tag="Direct verkoeling"
            title="Airco huren"
            desc="Verkoeling op je staanplaats — bezorgd, geïnstalleerd en weer opgehaald."
            price={`${fmt(prices.airco)}/wk`}
            delay={0.12}
            accent="amber"
          />
          <ServiceCard
            href="/diensten/transport"
            icon={Truck}
            tag="Stalling ↔ camping"
            title="Transport"
            desc="Wij brengen je caravan van de stalling naar de camping en weer terug."
            price={`${fmt(prices.transportZelf)} – ${fmt(prices.transportWij)}`}
            delay={0.19}
            accent="violet"
          />
          <ServiceCard
            href="/diensten/service"
            icon={Sparkles}
            tag="Onderhoud & verzorging"
            title="Service & onderhoud"
            desc="Waxen, schoonmaak, ozon-behandeling en meer — onze werkplaats pakt het op."
            price="op aanvraag"
            delay={0.26}
            accent="cyan"
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
              <Sparkles size={11} /> Beveiligde betaling
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={11} /> Bevestiging in je inbox
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={11} /> Vast team aan de Costa Brava
            </span>
          </div>
          <Link
            href="/contact"
            className="inline-block mt-6 text-[13px] underline-offset-4 hover:underline transition-colors"
            style={{ color: 'rgba(241,245,249,0.7)' }}
          >
            Vragen? Stuur ons een bericht →
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

function ServiceCard({
  href, icon: Icon, tag, title, desc, price, delay, accent,
}: {
  href: string;
  icon: typeof Refrigerator;
  tag: string;
  title: string;
  desc: string;
  price: string;
  delay: number;
  accent: 'cyan' | 'amber' | 'violet';
}) {
  const accentMap = {
    cyan:   { glow: 'rgba(126,168,255,0.18)', text: 'rgba(190,210,255,0.95)' },
    amber:  { glow: 'rgba(255,180,80,0.18)',  text: 'rgba(255,210,140,0.95)' },
    violet: { glow: 'rgba(180,140,255,0.18)', text: 'rgba(220,200,255,0.95)' },
  } as const;
  const a = accentMap[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: EASE }}
    >
      <Link
        href={href}
        className="cs-service-card group block p-5 sm:p-6 rounded-[20px] relative overflow-hidden transition-all hover:-translate-y-0.5"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.10)',
          backdropFilter: 'blur(6px)',
          // CSS-variable per accent — class-rule in globals leest 'm voor outer-glow.
          ['--cs-card-glow' as string]: a.glow,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(60% 60% at 25% 20%, ${a.glow} 0%, transparent 70%)`,
          }}
        />
        <div className="relative flex items-start gap-4">
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-[14px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            <Icon size={22} style={{ color: '#F1F5F9' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] font-medium mb-1"
              style={{ color: a.text }}
            >
              {tag}
            </div>
            <h2 className="text-[18px] sm:text-[20px] font-semibold leading-tight" style={{ color: '#FFFFFF' }}>
              {title}
            </h2>
            <p
              className="mt-1.5 text-[13px] sm:text-[14px] leading-relaxed"
              style={{ color: 'rgba(241,245,249,0.65)' }}
            >
              {desc}
            </p>
          </div>
        </div>

        <div className="relative mt-5 flex items-center justify-between gap-2">
          <span className="text-[14px] sm:text-[15px] font-semibold tabular-nums" style={{ color: '#FFFFFF' }}>
            {price}
          </span>
          <span
            className="inline-flex items-center gap-1.5 text-[13px] sm:text-[14px] font-medium transition-transform group-hover:translate-x-0.5"
            style={{ color: a.text }}
          >
            Bestellen <ArrowRight size={15} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
