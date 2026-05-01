'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Mail, Phone, Sparkles } from 'lucide-react';
import { useLocale } from './LocaleProvider';

interface SuccessScreenProps {
  title: string;
  body: string;
  reference?: string | null;
}

const EASE = [0.16, 1, 0.3, 1] as const;

// Twaalf "vonken" rondom het check-vinkje. Deterministisch zodat SSR/CSR
// dezelfde output geven (geen Math.random in render).
const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const distance = 60 + (i % 3) * 8;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    size: 4 + (i % 3) * 2,
    delay: 0.2 + (i % 4) * 0.04,
    color: i % 3 === 0 ? 'var(--color-warning)' : 'var(--color-success)',
  };
});

export default function SuccessScreen({ title, body, reference }: SuccessScreenProps) {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  return (
    <main
      className="min-h-screen flex items-center justify-center page-public page-public-dark px-6 py-12"
      style={{ background: 'linear-gradient(180deg, #0A1929 0%, #050D18 100%)' }}
    >
      <div className="max-w-md text-center w-full">
        {/* Success badge met confetti-vonken */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          {!reduce && SPARKS.map((s, i) => (
            <motion.span
              key={i}
              aria-hidden
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], x: s.x, y: s.y, scale: [0, 1, 0.8] }}
              transition={{ duration: 1.1, delay: s.delay, ease: 'easeOut' }}
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: s.size,
                height: s.size,
                marginLeft: -s.size / 2,
                marginTop: -s.size / 2,
                background: s.color,
              }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.5, 1.5], opacity: [0, 0.45, 0] }}
            transition={{ duration: 1.6, ease: 'easeOut', times: [0, 0.4, 1] }}
            className="absolute inset-0 rounded-full"
            style={{ background: 'var(--color-success)', opacity: 0.18 }}
          />
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
            className="absolute inset-2 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-success-soft)' }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 380, damping: 20 }}
              style={{ color: 'var(--color-success)' }}
            >
              <Check size={32} strokeWidth={3} />
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4, ease: EASE }}
        >
          <div className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
            <Sparkles size={11} /> {t('thanks.payment-title')}
          </div>
          <h1 className="text-[28px] sm:text-3xl font-semibold tracking-tight mb-3 leading-tight">{title}</h1>
          <p className="text-text-muted leading-relaxed text-[15px]">{body}</p>
          {reference && (
            <p className="text-[11px] text-text-subtle mt-6 font-mono break-all">
              {t('common.reference')} {reference}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: EASE }}
          className="mt-10 pt-8 border-t border-border space-y-2.5"
        >
          <p className="text-[14px] text-text-muted inline-flex items-center justify-center gap-1.5">
            <Mail size={13} />
            <a href="mailto:info@caravanstalling-spanje.com" className="text-text underline-offset-4 hover:underline">
              info@caravanstalling-spanje.com
            </a>
          </p>
          <p className="text-[14px] text-text-muted inline-flex items-center justify-center gap-1.5">
            <Phone size={13} />
            <a href="tel:+34633778699" className="text-text underline-offset-4 hover:underline">
              +34 633 778 699
            </a>
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-block text-[14px] text-text-muted hover:text-text underline-offset-4 hover:underline transition-colors"
            >
              {t('common.back-to-website')}
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
