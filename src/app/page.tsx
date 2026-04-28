'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight, LayoutGrid, Refrigerator, ShieldCheck, Wrench, Star,
} from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';
import LocaleSwitch from '@/components/LocaleSwitch';

const EASE = [0.16, 1, 0.3, 1] as const;

// Mollie-meets-Stripe deep navy. Used only on landing.
const NAVY_GRAD =
  'radial-gradient(120% 80% at 50% 0%, #142F4D 0%, #0A1929 60%, #050D18 100%)';

export default function LandingPage() {
  const { t } = useLocale();
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-12 sm:py-20 relative overflow-hidden"
      style={{ background: NAVY_GRAD, color: '#F1F5F9' }}
    >
      {/* Sterkere ambient glow achter logo zodat het echt 'pop't tegen het navy */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] blur-3xl"
        style={{
          background: `radial-gradient(40% 55% at 50% 28%, rgba(126,168,255,0.22) 0%, rgba(126,168,255,0.08) 40%, transparent 75%)`,
        }}
      />
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
        <LocaleSwitch />
      </div>

      <div className="w-full max-w-3xl relative">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-center mb-10 sm:mb-12"
        >
          <Image
            src="/images/logo.png"
            alt="Caravanstalling Spanje"
            width={420}
            height={95}
            priority
            className="mx-auto h-14 sm:h-20 w-auto mb-7 sm:mb-9"
            style={{
              // Logo op originele kleur (illustratie + oranje wordmark) — die popt
              // vanzelf tegen het navy. Alleen een zachte halo voor "lift".
              filter: `
                drop-shadow(0 0 28px rgba(255,255,255,0.18))
                drop-shadow(0 2px 6px rgba(0,0,0,0.35))
              `,
            }}
          />
          <h1
            className="text-[28px] sm:text-[40px] leading-[1.15] font-semibold tracking-tight"
            style={{ color: '#FFFFFF' }}
          >
            {t('landing.tagline')}
          </h1>
          <p
            className="mt-4 leading-relaxed max-w-lg mx-auto text-[14px] sm:text-base"
            style={{ color: 'rgba(241,245,249,0.72)' }}
          >
            {t('landing.intro')}
          </p>

          {/* Reviews badge */}
          <motion.a
            href="https://g.co/kgs/caravanstalling"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: EASE }}
            className="press-spring inline-flex items-center gap-2 mt-5 px-3 py-1.5 rounded-full transition-colors"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: '#F1F5F9',
            }}
          >
            <span className="flex items-center gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  size={11}
                  fill="currentColor"
                  style={{ color: '#F4B942' }}
                />
              ))}
            </span>
            <span className="text-[11px] font-medium tabular-nums">4.9</span>
            <span className="text-[11px]" style={{ color: 'rgba(241,245,249,0.6)' }}>
              {t('landing.reviews-count')}
            </span>
          </motion.a>
        </motion.div>

        {/* CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 sm:mb-12">
          <CtaCard
            href="/diensten"
            title={t('landing.cta-services-title')}
            description={t('landing.cta-services-desc')}
            icon={LayoutGrid}
            delay={0.12}
          />
          <CtaCard
            href="/koelkast"
            title={t('landing.cta-fridge-title')}
            description={t('landing.cta-fridge-desc')}
            icon={Refrigerator}
            delay={0.18}
          />
        </div>

        {/* USPs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4, ease: EASE }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-3"
        >
          <Usp icon={ShieldCheck} title={t('landing.usp-secure-title')}>
            {t('landing.usp-secure-body')}
          </Usp>
          <Usp icon={Wrench} title={t('landing.usp-workshop-title')}>
            {t('landing.usp-workshop-body')}
          </Usp>
          <Usp icon={Star} title={t('landing.usp-rating-title')}>
            {t('landing.usp-rating-body')}
          </Usp>
        </motion.div>

        {/* Footer */}
        <p
          className="text-xs text-center mt-12 sm:mt-16"
          style={{ color: 'rgba(241,245,249,0.55)' }}
        >
          {t('common.questions')}{' '}
          <a
            href="mailto:info@caravanstalling-spanje.com"
            className="underline-offset-4 hover:underline"
            style={{ color: '#F1F5F9' }}
          >
            info@caravanstalling-spanje.com
          </a>
          {' · '}
          <a
            href="tel:+34633778699"
            className="underline-offset-4 hover:underline"
            style={{ color: '#F1F5F9' }}
          >
            +34 633 778 699
          </a>
        </p>
      </div>

    </main>
  );
}

function CtaCard({
  href, title, description, icon: Icon, delay,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof Refrigerator;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: EASE }}
      className="h-full"
    >
      <Link
        href={href}
        className="press-spring h-full flex flex-col p-6 rounded-[var(--radius-2xl)] transition-all hover:-translate-y-px"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <div className="flex items-start justify-between mb-8">
          <div
            className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center transition-transform group-hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: '#F1F5F9',
            }}
          >
            <Icon size={18} />
          </div>
          <ArrowRight size={14} style={{ color: 'rgba(241,245,249,0.5)' }} />
        </div>
        <h2 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>{title}</h2>
        <p
          className="text-[13px] mt-1 leading-relaxed"
          style={{ color: 'rgba(241,245,249,0.7)' }}
        >
          {description}
        </p>
      </Link>
    </motion.div>
  );
}

function Usp({
  icon: Icon, title, children,
}: {
  icon: typeof ShieldCheck;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex sm:flex-col items-start gap-3 sm:gap-2 px-4 py-3 sm:py-0 sm:px-0">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.10)',
          color: '#F1F5F9',
        }}
      >
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold" style={{ color: '#FFFFFF' }}>{title}</div>
        <div
          className="text-[12px] leading-relaxed mt-0.5"
          style={{ color: 'rgba(241,245,249,0.65)' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
