'use client';

import { motion } from 'framer-motion';
import { useLocale } from './LocaleProvider';
import type { Locale } from '@/lib/i18n';

const OPTIONS: { value: Locale; label: string }[] = [
  { value: 'nl', label: 'NL' },
  { value: 'en', label: 'EN' },
];

export default function LocaleSwitch({
  className = '',
  variant = 'light',
}: {
  className?: string;
  /** 'light' = standaard (publieke pagina's). 'dark' = navy admin-sidebar. */
  variant?: 'light' | 'dark';
}) {
  const { locale, setLocale } = useLocale();
  const isDark = variant === 'dark';

  return (
    <div
      className={`inline-flex items-center rounded-full p-0.5 text-[11px] font-medium ${
        isDark ? '' : 'border border-border bg-surface'
      } ${className}`}
      role="group"
      aria-label="Language"
      style={
        isDark
          ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }
          : undefined
      }
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
                layoutId={isDark ? 'locale-pill-dark' : 'locale-pill'}
                className="absolute inset-0 rounded-full"
                style={{ background: isDark ? '#FFFFFF' : 'var(--color-text)' }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className="relative z-10"
              style={{
                color: active
                  ? isDark ? '#0A1929' : 'var(--color-accent-fg)'
                  : isDark ? 'rgba(241,245,249,0.7)' : 'var(--color-text-muted)',
              }}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
