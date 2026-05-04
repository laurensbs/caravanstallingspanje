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
  const bg = (() => {
    if (variant === 'sand') return 'var(--color-sand)';
    if (variant === 'white') return '#FFFFFF';
    return 'var(--color-marketing-cream)';
  })();

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

function PageHero({ title, intro, eyebrow, eyebrowKey, back, icon: Icon }: HeroProps) {
  const { t } = useLocale();
  const reduceMotion = useReducedMotion();
  const eyebrowText = eyebrowKey ? t(eyebrowKey) : eyebrow;

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
      {/* Decoratieve orb-glow rechtsboven — zelfde sfeer als de IdeasHero
          en VacationTagline. Geeft hero's een warme anchor. */}
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(217,110,60,0.16) 0%, transparent 60%)',
          filter: 'blur(8px)',
        }}
      />
      {/* Subtiele tweede orb linksonder voor diepte */}
      <div
        aria-hidden
        className="absolute -bottom-24 -left-24 w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(14,58,85,0.08) 0%, transparent 65%)',
          filter: 'blur(8px)',
        }}
      />

      <div className="relative max-w-[1180px] mx-auto px-5 sm:px-8 py-12 sm:py-20">
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
            {eyebrowText && (
              <motion.div {...fadeUp(0.05)} className="mb-4 inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className="cs-orb-pulse w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--color-terracotta)' }}
                />
                <span className="mk-eyebrow">{eyebrowText}</span>
              </motion.div>
            )}
            <motion.h1
              {...fadeUp(0.12)}
              className="font-display"
              style={{
                color: 'var(--color-navy)',
                fontSize: 'clamp(2.1rem, 4.4vw, 3.4rem)',
                fontWeight: 700,
                lineHeight: 1.06,
                letterSpacing: '-0.014em',
                margin: '0 0 0.45em',
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
            {/* Subtle accent-rule onder hero-content — zelfde terracotta */}
            <motion.div
              {...fadeUp(0.28)}
              aria-hidden
              className="mt-7 h-[2px] rounded-full"
              style={{
                width: 64,
                background: 'linear-gradient(90deg, var(--color-terracotta), transparent)',
              }}
            />
          </div>

          {/* Sfeer-icoon rechts — alleen op lg+ en als icon is meegegeven.
              Cream-disc met dubbele soft glow + zachte float-animatie. */}
          {Icon && (
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
                style={{ width: 160, height: 160 }}
              >
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-full blur-2xl"
                  style={{ background: 'var(--color-terracotta)', opacity: 0.18 }}
                />
                <div
                  className="cs-orb-pulse relative w-full h-full rounded-full flex items-center justify-center"
                  style={{
                    background: '#fff',
                    border: '1px solid var(--color-terracotta-soft)',
                    boxShadow:
                      '0 0 0 10px rgba(217,110,60,0.05), inset 0 0 40px rgba(217,110,60,0.10)',
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
