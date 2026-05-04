'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
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
      <PublicHeader variant="light" />

      <main id="main" className="flex-1">
        {hero && <PageHero {...hero} />}
        {children}
      </main>

      {!hideFooter && <PublicFooter />}
    </div>
  );
}

function PageHero({ title, intro, eyebrow, eyebrowKey, back }: HeroProps) {
  const { t } = useLocale();
  const eyebrowText = eyebrowKey ? t(eyebrowKey) : eyebrow;

  return (
    <header
      className="relative border-b"
      style={{
        background: 'linear-gradient(180deg, #fff 0%, var(--color-marketing-cream) 100%)',
        borderColor: 'var(--color-marketing-line)',
      }}
    >
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {back && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mb-6"
          >
            <Link
              href={back.href}
              className="inline-flex items-center gap-1.5 text-[13px] transition-opacity hover:opacity-100"
              style={{ color: 'var(--color-marketing-ink-soft)' }}
            >
              <ArrowLeft size={14} aria-hidden /> {back.label}
            </Link>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="max-w-2xl"
        >
          {eyebrowText && (
            <span className="mk-eyebrow mb-3 block">{eyebrowText}</span>
          )}
          <h1
            className="font-display"
            style={{
              color: 'var(--color-navy)',
              fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)',
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: '-0.012em',
              margin: '0 0 0.5em',
            }}
          >
            {title}
          </h1>
          {intro && (
            <p
              className="text-[1rem] sm:text-[1.05rem] leading-relaxed max-w-xl"
              style={{ color: 'var(--color-marketing-ink-soft)' }}
            >
              {intro}
            </p>
          )}
        </motion.div>
      </div>
    </header>
  );
}
