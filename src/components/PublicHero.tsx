'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import LocaleSwitch from './LocaleSwitch';

const NAVY_GRAD =
  'radial-gradient(120% 90% at 50% 0%, #142F4D 0%, #0A1929 60%, #050D18 100%)';

const EASE = [0.16, 1, 0.3, 1] as const;

export type HeroAccent = 'cyan' | 'amber' | 'violet' | 'default';

const ACCENT_GLOW: Record<HeroAccent, string> = {
  default: 'rgba(126,168,255,0.18)',
  cyan:    'rgba(126,168,255,0.22)',
  amber:   'rgba(255,180,80,0.22)',
  violet:  'rgba(180,140,255,0.22)',
};

const ACCENT_TAG: Record<HeroAccent, { bg: string; border: string; text: string }> = {
  default: { bg: 'rgba(126,168,255,0.10)', border: 'rgba(126,168,255,0.25)', text: 'rgba(190,210,255,0.95)' },
  cyan:    { bg: 'rgba(126,168,255,0.10)', border: 'rgba(126,168,255,0.25)', text: 'rgba(190,210,255,0.95)' },
  amber:   { bg: 'rgba(255,180,80,0.12)',  border: 'rgba(255,180,80,0.25)',  text: 'rgba(255,210,140,0.95)' },
  violet:  { bg: 'rgba(180,140,255,0.12)', border: 'rgba(180,140,255,0.25)', text: 'rgba(220,200,255,0.95)' },
};

interface PublicHeroProps {
  /** Tonen als breadcrumb-style back-link bovenin (mobiel + desktop). */
  back?: { href: string; label: string };
  title: string;
  intro?: string;
  /** Klein blokje rechtsboven naast de LocaleSwitch (badge, etc). */
  rightSlot?: ReactNode;
  /** Eyebrow-tag boven de titel (bv. "Vanaf één week"). */
  eyebrow?: string;
  /** Icoon vóór de eyebrow-tag. */
  eyebrowIcon?: ReactNode;
  /** Kleur-accent dat de glow + eyebrow-tag-kleur bepaalt. */
  accent?: HeroAccent;
  /** Toon klein logo links bovenin (default: ja, voelt persoonlijk). */
  showLogo?: boolean;
}

export default function PublicHero({
  back, title, intro, rightSlot, eyebrow, eyebrowIcon, accent = 'default', showLogo = true,
}: PublicHeroProps) {
  const tag = ACCENT_TAG[accent];
  const glow = ACCENT_GLOW[accent];

  return (
    <header className="relative overflow-hidden" style={{ background: NAVY_GRAD, color: '#F1F5F9' }}>
      {/* Halo boven, in kind-accent kleur */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[340px] blur-3xl"
        style={{
          background: `radial-gradient(40% 60% at 50% 30%, ${glow} 0%, ${glow.replace(/[\d.]+\)$/, '0.06)')} 40%, transparent 75%)`,
        }}
      />
      {/* Zachte warme glow rechtsonder, alleen op accent ≠ default */}
      {accent !== 'default' && (
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -right-10 h-[300px] w-[300px] blur-3xl opacity-50"
          style={{
            background: `radial-gradient(50% 50% at 50% 50%, ${glow} 0%, transparent 70%)`,
          }}
        />
      )}

      <div className="relative max-w-3xl mx-auto px-5 sm:px-6 pt-5 pb-10 sm:pt-7 sm:pb-14">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-7 sm:mb-9 gap-3">
          <div className="flex items-center gap-3">
            {back ? (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <Link
                  href={back.href}
                  className="inline-flex items-center gap-1.5 text-[13px] transition-colors hover:opacity-100"
                  style={{ color: 'rgba(241,245,249,0.65)' }}
                >
                  <ArrowLeft size={14} /> {back.label}
                </Link>
              </motion.div>
            ) : (
              <span aria-hidden />
            )}
          </div>
          <div className="flex items-center gap-2">
            {rightSlot}
            <LocaleSwitch />
          </div>
        </div>

        {/* Logo + eyebrow + title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {showLogo && (
            <Image
              src="/images/logo-v2.png"
              alt="Caravanstalling Spanje"
              width={512}
              height={115}
              priority
              className="h-10 sm:h-12 w-auto mb-5 sm:mb-6"
              style={{
                filter:
                  'drop-shadow(0 0 18px rgba(255,255,255,0.14)) drop-shadow(0 1px 4px rgba(0,0,0,0.3))',
              }}
            />
          )}

          {eyebrow && (
            <div
              className="inline-flex items-center gap-1.5 mb-4 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.22em]"
              style={{
                background: tag.bg,
                border: `1px solid ${tag.border}`,
                color: tag.text,
              }}
            >
              {eyebrowIcon}
              {eyebrow}
            </div>
          )}

          <h1
            className="text-[28px] sm:text-[36px] leading-[1.12] font-semibold tracking-tight"
            style={{ color: '#FFFFFF' }}
          >
            {title}
          </h1>
          {intro && (
            <p
              className="mt-3 leading-relaxed text-[14px] sm:text-[16px] max-w-xl"
              style={{ color: 'rgba(241,245,249,0.72)' }}
            >
              {intro}
            </p>
          )}
        </motion.div>
      </div>

      {/* Geen body-overgang meer: de hele pagina is nu navy-blauw. */}
    </header>
  );
}
