'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import LocaleSwitch from './LocaleSwitch';

const NAVY_GRAD =
  'radial-gradient(120% 90% at 50% 0%, #142F4D 0%, #0A1929 60%, #050D18 100%)';

const EASE = [0.16, 1, 0.3, 1] as const;

interface PublicHeroProps {
  /** Tonen als breadcrumb-style back-link bovenin (mobiel + desktop). */
  back?: { href: string; label: string };
  title: string;
  intro?: string;
  /** Klein blokje rechtsboven naast de LocaleSwitch (badge, etc). */
  rightSlot?: ReactNode;
}

export default function PublicHero({ back, title, intro, rightSlot }: PublicHeroProps) {
  return (
    <header className="relative overflow-hidden" style={{ background: NAVY_GRAD, color: '#F1F5F9' }}>
      {/* zachte halo bovenin */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[300px] blur-3xl"
        style={{
          background: `radial-gradient(40% 60% at 50% 30%, rgba(126,168,255,0.18) 0%, rgba(126,168,255,0.06) 40%, transparent 75%)`,
        }}
      />
      <div className="relative max-w-3xl mx-auto px-6 pt-6 pb-10 sm:pt-8 sm:pb-14">
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
          {back ? (
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <Link
                href={back.href}
                className="inline-flex items-center gap-1 text-[13px] transition-colors"
                style={{ color: 'rgba(241,245,249,0.7)' }}
              >
                <ArrowLeft size={14} /> {back.label}
              </Link>
            </motion.div>
          ) : (
            <span aria-hidden />
          )}
          <div className="flex items-center gap-2">
            {rightSlot}
            <LocaleSwitch />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <h1
            className="text-[28px] sm:text-[36px] leading-[1.15] font-semibold tracking-tight"
            style={{ color: '#FFFFFF' }}
          >
            {title}
          </h1>
          {intro && (
            <p
              className="mt-3 leading-relaxed text-[14px] sm:text-base max-w-xl"
              style={{ color: 'rgba(241,245,249,0.72)' }}
            >
              {intro}
            </p>
          )}
        </motion.div>
      </div>
    </header>
  );
}
