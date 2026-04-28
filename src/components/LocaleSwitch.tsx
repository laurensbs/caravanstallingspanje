'use client';

import { motion } from 'framer-motion';
import { useLocale } from './LocaleProvider';
import type { Locale } from '@/lib/i18n';

const OPTIONS: { value: Locale; label: string }[] = [
  { value: 'nl', label: 'NL' },
  { value: 'en', label: 'EN' },
];

export default function LocaleSwitch({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={`inline-flex items-center rounded-full border border-border bg-surface p-0.5 text-[11px] font-medium ${className}`}
      role="group"
      aria-label="Taal"
    >
      {OPTIONS.map((opt) => {
        const active = locale === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLocale(opt.value)}
            className="relative px-2.5 h-6 inline-flex items-center justify-center rounded-full transition-colors press-spring"
            aria-pressed={active}
          >
            {active && (
              <motion.span
                layoutId="locale-pill"
                className="absolute inset-0 rounded-full bg-text"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className="relative z-10"
              style={{ color: active ? 'var(--color-accent-fg)' : 'var(--color-text-muted)' }}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
