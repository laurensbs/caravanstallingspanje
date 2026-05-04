'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, Mail, type LucideIcon } from 'lucide-react';
import MarketingPage from './marketing/MarketingPage';
import { useLocale } from './LocaleProvider';
import type { StringKey } from '@/lib/i18n';

// Lichtgewicht info-pagina voor diensten die (nog) niet online te boeken zijn.
// Wordt gebruikt door /diensten/{reparatie,inspectie,stalling} terwijl die
// flows handmatig via contact verlopen.
//
// "Vraag offerte aan" CTA → /contact?subject=…  zodat de klant direct context
// kan geven. Telefoonnummer staat ook prominent — doelgroep belt liever.

type Props = {
  titleKey: StringKey;
  introKey: StringKey;
  eyebrowKey: StringKey;
  bullets: StringKey[];
  /** Pre-fill subject voor contact-link, e.g. "Reparatie-aanvraag". */
  subjectKey: StringKey;
  /** Verlaten — accent-prop wordt nu niet meer gebruikt op cream-canvas. */
  icon?: LucideIcon;
  accent?: 'cyan' | 'amber' | 'violet';
};

export default function ServiceInfoPage({
  titleKey, introKey, eyebrowKey, bullets, subjectKey, icon, accent,
}: Props) {
  const { t } = useLocale();
  void icon;
  void accent;
  const subject = t(subjectKey);

  return (
    <MarketingPage
      hero={{
        title: t(titleKey),
        intro: t(introKey),
        eyebrowKey,
        back: { href: '/', label: t('common.brand') },
      }}
    >
      <section className="max-w-2xl w-full mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <motion.ul
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-3 mb-10"
        >
          {bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-3 px-4 py-3 rounded-[var(--radius-lg)]"
              style={{
                background: '#fff',
                border: '1px solid var(--color-marketing-line)',
              }}
            >
              <span
                aria-hidden
                className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: 'var(--color-terracotta)' }}
              />
              <span className="text-[14px] leading-relaxed" style={{ color: 'var(--color-marketing-ink)' }}>
                {t(b)}
              </span>
            </li>
          ))}
        </motion.ul>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[var(--radius-2xl)] p-6 sm:p-7"
          style={{
            background: 'var(--color-sand)',
            border: '1px solid var(--color-marketing-line)',
          }}
        >
          <h2
            className="font-display"
            style={{
              color: 'var(--color-navy)',
              fontSize: '1.4rem',
              fontWeight: 700,
              letterSpacing: '-0.012em',
              margin: '0 0 0.4rem',
            }}
          >
            {t('service-info.cta-title')}
          </h2>
          <p className="text-[14px] leading-relaxed mb-5" style={{ color: 'var(--color-marketing-ink-soft)' }}>
            {t('service-info.cta-body')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/contact?subject=${encodeURIComponent(subject)}`}
              className="mk-btn-primary justify-center flex-1"
            >
              <Mail size={15} aria-hidden /> {t('service-info.cta-form')}
              <ArrowRight size={14} aria-hidden />
            </Link>
            <a href="tel:+34633778699" className="mk-btn-secondary justify-center flex-1">
              <Phone size={15} aria-hidden /> +34 633 77 86 99
            </a>
          </div>
        </motion.div>
      </section>
    </MarketingPage>
  );
}
