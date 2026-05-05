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

// Wrapper voor publieke dienst- en formulier-pages: nieuwe mockup-chrome
// (Topbar + nav + footer) + sky-soft hero in mockup-stijl.
//
// De variant-prop blijft accepted voor backwards-compat met oude callers,
// maar wordt nu visueel genegeerd — er is één unified mockup-look.

const EASE = [0.16, 1, 0.3, 1] as const;

type HeroProps = {
  title: ReactNode;
  intro?: ReactNode;
  eyebrow?: string;
  eyebrowKey?: StringKey;
  back?: { href: string; label: string };
  /** Optioneel sfeer-icoon — verschijnt rechts in een sky-disc. */
  icon?: LucideIcon;
  /** Hero-variant blijft accepted maar wordt nu visueel genegeerd. */
  variant?: 'rich' | 'compact';
};

interface MarketingPageProps {
  hero?: HeroProps;
  /** Background-variant. Default white per mockup-look. */
  variant?: 'cream' | 'sand' | 'white';
  children: ReactNode;
  hideFooter?: boolean;
}

export default function MarketingPage({
  hero,
  variant = 'white',
  children,
  hideFooter = false,
}: MarketingPageProps) {
  const bg = variant === 'sand' ? 'var(--bg-2)' : '#FFFFFF';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: bg }}>
      <Topbar />
      <PublicHeader />

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

  const fade = (delay = 0) =>
    reduceMotion
      ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, ease: EASE, delay },
        };

  return (
    <section className="section-bg-sky-soft">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-12 sm:py-16">
        {back && (
          <motion.div {...fade(0)} className="mb-6">
            <Link
              href={back.href}
              className="inline-flex items-center gap-1.5 text-[13px] transition-opacity hover:opacity-70"
              style={{ color: 'var(--muted)', fontFamily: 'var(--inter)' }}
            >
              <ArrowLeft size={14} aria-hidden /> {back.label}
            </Link>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-center">
          <div className="max-w-2xl">
            {eyebrowText && (
              <motion.span {...fade(0.04)} className="eyebrow-mk">
                {eyebrowText}
              </motion.span>
            )}
            <motion.h1 {...fade(0.1)} className="h1-mk" style={{ marginTop: 4 }}>
              {title}
            </motion.h1>
            {intro && (
              <motion.p {...fade(0.18)} className="lead-mk" style={{ marginTop: 14 }}>
                {intro}
              </motion.p>
            )}
          </div>

          {Icon && (
            <motion.div
              {...fade(0.16)}
              className="hidden lg:block"
              aria-hidden
            >
              <span
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 22,
                  background: 'linear-gradient(135deg, var(--sky) 0%, #BFE7FD 100%)',
                  color: 'var(--navy)',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: 'var(--shadow-card-mk), 0 18px 40px -18px rgba(31,42,54,0.25)',
                  border: '1px solid rgba(31,42,54,0.06)',
                }}
              >
                <Icon size={48} strokeWidth={1.6} aria-hidden />
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
