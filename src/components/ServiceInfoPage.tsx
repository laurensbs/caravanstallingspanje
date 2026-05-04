'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, Mail, type LucideIcon } from 'lucide-react';
import PublicHero from './PublicHero';
import PublicFooter from './PublicFooter';
import { useLocale } from './LocaleProvider';
import type { StringKey } from '@/lib/i18n';

// Lichtgewicht info-pagina voor diensten die (nog) niet online te boeken zijn.
// Wordt gebruikt door /diensten/{reparatie,inspectie,stalling} terwijl die
// flows tijdelijk handmatig via contact verlopen.
//
// Bewuste keuze: "Vraag offerte aan" CTA → /contact?subject=…  zodat de
// klant niet via een formulier hoeft te navigeren maar direct context kan
// geven. Telefoonnummer staat ook prominent — onze doelgroep belt liever.

type Props = {
  titleKey: StringKey;
  introKey: StringKey;
  eyebrowKey: StringKey;
  bullets: StringKey[];
  /** Pre-fill subject voor contact-link, e.g. "Reparatie-aanvraag". */
  subjectKey: StringKey;
  icon: LucideIcon;
  accent?: 'cyan' | 'amber' | 'violet';
};

export default function ServiceInfoPage({
  titleKey, introKey, eyebrowKey, bullets, subjectKey, icon: Icon, accent = 'cyan',
}: Props) {
  const { t } = useLocale();
  const subject = t(subjectKey);
  return (
    <main
      id="main"
      className="min-h-screen page-public page-public-dark flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0A1929 0%, #050D18 100%)' }}
    >
      <PublicHero
        back={{ href: '/', label: t('common.brand') }}
        title={t(titleKey)}
        intro={t(introKey)}
        eyebrow={t(eyebrowKey)}
        eyebrowIcon={<Icon size={11} aria-hidden />}
        accent={accent}
      />

      <section className="flex-1 max-w-2xl w-full mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <motion.ul
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-3 mb-10"
          style={{ color: 'rgba(241,245,249,0.85)' }}
        >
          {bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-3 px-4 py-3 rounded-[var(--radius-lg)]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span
                aria-hidden
                className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: 'var(--color-amber)' }}
              />
              <span className="text-[14px] leading-relaxed">{t(b)}</span>
            </li>
          ))}
        </motion.ul>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[var(--radius-2xl)] p-6 sm:p-7"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.10)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <h2 className="text-[18px] sm:text-[20px] font-semibold mb-2" style={{ color: '#FFFFFF' }}>
            {t('service-info.cta-title')}
          </h2>
          <p className="text-[14px] leading-relaxed mb-5" style={{ color: 'rgba(241,245,249,0.7)' }}>
            {t('service-info.cta-body')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/contact?subject=${encodeURIComponent(subject)}`}
              className="press-spring inline-flex items-center justify-center gap-2 h-12 px-5 rounded-[var(--radius-md)] text-[14px] font-semibold transition-colors flex-1"
              style={{ background: '#FFFFFF', color: '#0A1929' }}
            >
              <Mail size={15} aria-hidden /> {t('service-info.cta-form')}
              <ArrowRight size={14} aria-hidden />
            </Link>
            <a
              href="tel:+34633778699"
              className="press-spring inline-flex items-center justify-center gap-2 h-12 px-5 rounded-[var(--radius-md)] text-[14px] font-medium transition-colors flex-1"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: '#F1F5F9',
              }}
            >
              <Phone size={15} aria-hidden /> +34 633 77 86 99
            </a>
          </div>
        </motion.div>
      </section>

      <PublicFooter />
    </main>
  );
}
