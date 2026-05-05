'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import Topbar from './Topbar';
import PublicHeader from '../PublicHeader';
import PublicFooter from '../PublicFooter';
import { useLocale } from '../LocaleProvider';
import type { StringKey } from '@/lib/i18n';

// Wrapper voor alle publieke dienst- en formulier-pages: cream canvas
// (mk-page), Topbar + PublicHeader (light variant), optionele hero met
// serif h1 + back-link, en footer.
//
// Gebruik:
//   <MarketingPage hero={{ title, intro, eyebrow, back: { href: '/', label: 'Home' } }}>
//     <FormSection ... />
//   </MarketingPage>

const EASE = [0.16, 1, 0.3, 1] as const;

type HeroProps = {
  title: ReactNode;
  intro?: ReactNode;
  eyebrow?: string;
  eyebrowKey?: StringKey;
  back?: { href: string; label: string };
  /** Optioneel sfeer-icoon — verschijnt rechts in een cream-disc met
   *  zachte terracotta-glow. Geeft elke hero een visueel anker. */
  icon?: LucideIcon;
  /** Hero-stijl. 'rich' (default) = sfeerrijke marketing-hero met
   *  drie orbs, ribbon en float-disc — voor /diensten, /contact,
   *  showcase-pagina's. 'compact' = rustige form-hero (één subtiele
   *  orb, geen disc, kleinere titel) — voor boekflows zoals /koelkast,
   *  /diensten/airco etc. waar de form-content de focus is. */
  variant?: 'rich' | 'compact';
};

interface MarketingPageProps {
  /** Hero content. Optioneel — sommige pages willen direct content zonder hero-banner. */
  hero?: HeroProps;
  /** Background-variant voor de body-content. Default 'cream'. */
  variant?: 'cream' | 'sand' | 'white';
  children: ReactNode;
  /** Verberg footer (bv. voor success-states die volledig in zichzelf bestaan). */
  hideFooter?: boolean;
}

export default function MarketingPage({
  hero,
  variant = 'cream',
  children,
  hideFooter = false,
}: MarketingPageProps) {
  // Mockup-look: alle content-pages staan op een wit/grey canvas. De legacy
  // 'sand'/'cream' varianten worden voorlopig genegeerd zodat we niet per
  // page een tussenstijl krijgen — slice 1+ rebuilden de pages alsnog.
  const bg = variant === 'sand' ? 'var(--bg-2)' : '#FFFFFF';

  return (
    <div className="mk-page min-h-screen flex flex-col" style={{ background: bg }}>
      <Topbar />
      <PublicHeader variant="marketing-cream" />

      <main id="main" className="flex-1">
        {hero && <PageHero {...hero} />}
        {children}
      </main>

      {!hideFooter && <PublicFooter />}
    </div>
  );
}

function PageHero({ title, intro, eyebrow, eyebrowKey, back, icon: Icon, variant = 'rich' }: HeroProps) {
  const { t } = useLocale();
  const reduceMotion = useReducedMotion();
  const eyebrowText = eyebrowKey ? t(eyebrowKey) : eyebrow;
  const isCompact = variant === 'compact';

  // Stagger zodat eyebrow → title → intro één voor één binnenkomen.
  // Bij reduced-motion zet alles onmiddellijk zichtbaar zonder delay.
  const fadeUp = (delay = 0) =>
    reduceMotion
      ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, ease: EASE, delay },
        };

  return (
    <header
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #fff 0%, var(--color-marketing-cream) 100%)',
      }}
    >
      {/* Compact: één subtiele orb. Rich: drie orbs (terracotta rechts-
          boven warmte, navy linksonder verankering, amber rechts-onder
          sfeer-twinkel) plus ribbon-line. */}
      <div
        aria-hidden
        className={`absolute -top-32 -right-32 rounded-full pointer-events-none ${isCompact ? 'w-[360px] h-[360px]' : 'w-[520px] h-[520px]'}`}
        style={{
          background: `radial-gradient(circle, rgba(217,110,60,${isCompact ? '0.10' : '0.18'}) 0%, transparent 60%)`,
          filter: 'blur(8px)',
        }}
      />
      {!isCompact && (
        <>
          <div
            aria-hidden
            className="absolute -bottom-28 -left-28 w-[360px] h-[360px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(14,58,85,0.09) 0%, transparent 65%)',
              filter: 'blur(8px)',
            }}
          />
          <div
            aria-hidden
            className="hidden lg:block absolute bottom-12 right-24 w-[160px] h-[160px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,180,80,0.18) 0%, transparent 70%)',
              filter: 'blur(4px)',
            }}
          />
          {Icon && <div aria-hidden className="mk-hero-ribbon hidden lg:block" />}
        </>
      )}

      <div className={`relative max-w-[1180px] mx-auto px-5 sm:px-8 ${isCompact ? 'py-9 sm:py-12' : 'py-12 sm:py-20'}`}>
        {back && (
          <motion.div {...fadeUp(0)} className="mb-7">
            <Link
              href={back.href}
              className="inline-flex items-center gap-1.5 text-[13px] transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-marketing-ink-soft)' }}
            >
              <ArrowLeft size={14} aria-hidden /> {back.label}
            </Link>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-14 items-center">
          <div className="max-w-2xl">
            <motion.div {...fadeUp(0.05)} className="mb-4 inline-flex items-center gap-2.5">
              {/* Mobile-only icon-chip — ipv het te grote desktop-disc dat
                  op mobile zou wegvallen, krijg je hier een klein
                  terracotta-tinted chip vóór de eyebrow. */}
              {Icon && (
                <span
                  aria-hidden
                  className="lg:hidden inline-flex items-center justify-center w-7 h-7 rounded-full"
                  style={{
                    background: 'var(--color-terracotta-soft)',
                    border: '1px solid rgba(217,110,60,0.28)',
                  }}
                >
                  <Icon size={14} strokeWidth={2} style={{ color: 'var(--color-terracotta-deep)' }} />
                </span>
              )}
              {eyebrowText && (
                <>
                  <span
                    aria-hidden
                    className="cs-orb-pulse w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--color-terracotta)' }}
                  />
                  <span className="mk-eyebrow">{eyebrowText}</span>
                </>
              )}
            </motion.div>

            <motion.h1
              {...fadeUp(0.12)}
              className="font-display"
              style={{
                color: 'var(--color-navy)',
                fontSize: isCompact
                  ? 'clamp(1.7rem, 3.4vw, 2.4rem)'
                  : 'clamp(2.1rem, 4.4vw, 3.4rem)',
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: '-0.014em',
                margin: '0 0 0.4em',
              }}
            >
              {title}
            </motion.h1>
            {intro && (
              <motion.p
                {...fadeUp(0.2)}
                className="text-[1.02rem] sm:text-[1.12rem] leading-relaxed max-w-xl"
                style={{ color: 'var(--color-marketing-ink-soft)' }}
              >
                {intro}
              </motion.p>
            )}
            {/* Subtle accent-rule met terracotta gradient. In rich-mode
                + tweede pulse-orb voor "live"-gevoel. */}
            <motion.div
              {...fadeUp(0.28)}
              aria-hidden
              className={`${isCompact ? 'mt-6' : 'mt-8'} inline-flex items-center gap-2.5`}
            >
              <span
                className="block h-[2px] rounded-full"
                style={{
                  width: isCompact ? 56 : 88,
                  background: 'linear-gradient(90deg, var(--color-terracotta), transparent)',
                }}
              />
              {!isCompact && (
                <span
                  className="cs-orb-pulse w-1 h-1 rounded-full"
                  style={{ background: 'var(--color-terracotta)', opacity: 0.5 }}
                />
              )}
            </motion.div>
          </div>

          {/* Sfeer-icoon rechts — desktop only, cream-disc met dubbele
              ring-glow + float-animatie. Niet getoond in compact mode. */}
          {Icon && !isCompact && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.85, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { delay: 0.18, type: 'spring', stiffness: 110, damping: 16 }
              }
              className="hidden lg:block relative"
              aria-hidden
            >
              <motion.div
                animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
                transition={
                  reduceMotion
                    ? undefined
                    : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
                }
                className="relative"
                style={{ width: 168, height: 168 }}
              >
                {/* Outer wide soft glow */}
                <div
                  aria-hidden
                  className="absolute inset-[-20px] rounded-full blur-2xl"
                  style={{ background: 'var(--color-terracotta)', opacity: 0.16 }}
                />
                {/* Mid ring with subtle gradient */}
                <div
                  aria-hidden
                  className="absolute inset-[-6px] rounded-full"
                  style={{
                    background:
                      'conic-gradient(from 140deg, rgba(217,110,60,0.0) 0%, rgba(217,110,60,0.22) 25%, rgba(217,110,60,0.0) 60%, rgba(255,180,80,0.18) 80%, rgba(217,110,60,0.0) 100%)',
                    filter: 'blur(2px)',
                    opacity: 0.85,
                  }}
                />
                {/* Disc */}
                <div
                  className="cs-orb-pulse relative w-full h-full rounded-full flex items-center justify-center"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 25%, #fff 0%, #fff 50%, var(--color-marketing-cream) 100%)',
                    border: '1px solid rgba(217,110,60,0.30)',
                    boxShadow:
                      '0 0 0 10px rgba(217,110,60,0.05), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 0 40px rgba(217,110,60,0.12)',
                  }}
                >
                  <Icon size={64} strokeWidth={1.6} style={{ color: 'var(--color-terracotta-deep)' }} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
