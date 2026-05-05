'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Mail, Phone, ArrowRight } from 'lucide-react';
import Topbar from './marketing/Topbar';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
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
  const distance = 70 + (i % 3) * 10;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    size: 5 + (i % 3) * 2,
    delay: 0.2 + (i % 4) * 0.04,
    color: i % 3 === 0 ? 'var(--orange)' : 'var(--green)',
  };
});

export default function SuccessScreen({ title, body, reference }: SuccessScreenProps) {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1">
        <section className="section-bg-sky-soft">
          <div className="max-w-[820px] mx-auto px-5 sm:px-10 py-14 sm:py-20 text-center">
            {/* Big checkmark met confetti-vonken */}
            <div className="relative mx-auto mb-10" style={{ width: 120, height: 120 }}>
              {!reduce && SPARKS.map((s, i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], x: s.x, y: s.y, scale: [0, 1, 0.8] }}
                  transition={{ duration: 1.1, delay: s.delay, ease: 'easeOut' }}
                  className="absolute left-1/2 top-1/2 rounded-full"
                  style={{
                    width: s.size, height: s.size,
                    marginLeft: -s.size / 2, marginTop: -s.size / 2,
                    background: s.color,
                  }}
                />
              ))}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: [0.6, 1.4, 1.4], opacity: [0, 0.35, 0] }}
                transition={{ duration: 1.6, ease: 'easeOut', times: [0, 0.4, 1] }}
                className="absolute inset-0 rounded-full"
                style={{ background: 'var(--green)', opacity: 0.18 }}
              />
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
                className="absolute inset-3 rounded-full flex items-center justify-center"
                style={{
                  background: 'var(--green-soft)',
                  border: '2px solid var(--green)',
                }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.25, type: 'spring', stiffness: 380, damping: 20 }}
                  style={{ color: 'var(--green)' }}
                >
                  <Check size={48} strokeWidth={3} />
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4, ease: EASE }}
            >
              <span className="eyebrow-mk" style={{ justifyContent: 'center', display: 'inline-flex' }}>
                {t('thanks.payment-title')}
              </span>
              <h1 className="h1-mk" style={{ marginTop: 4, fontSize: 'clamp(1.8rem, 3.6vw, 2.6rem)' }}>
                {title}
              </h1>
              <p className="lead-mk" style={{ marginTop: 14 }}>{body}</p>

              {reference && (
                <div
                  style={{
                    marginTop: 28,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 22px',
                    borderRadius: 14,
                    background: '#fff',
                    border: '1px solid var(--line)',
                    boxShadow: 'var(--shadow-card-mk)',
                  }}
                >
                  <span style={{ fontSize: 11.5, fontFamily: 'var(--sora)', fontWeight: 600, color: 'var(--muted)', letterSpacing: 1 }}>
                    {t('common.reference')}
                  </span>
                  <span style={{ fontFamily: 'var(--sora)', fontWeight: 700, fontSize: 18, color: 'var(--navy)', letterSpacing: 0.5 }}>
                    {reference}
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: EASE }}
          className="py-14"
        >
          <div className="max-w-[820px] mx-auto px-5 sm:px-10">
            <div className="card-mk" style={{ padding: 28 }}>
              <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 16, color: 'var(--navy)', margin: '0 0 14px' }}>
                Vragen of toelichting?
              </h2>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <Mail size={15} aria-hidden style={{ color: 'var(--orange)' }} />
                  <a href="mailto:info@caravanstalling-spanje.com" style={{ color: 'var(--ink)', textDecoration: 'none' }}>
                    info@caravanstalling-spanje.com
                  </a>
                </li>
                <li style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <Phone size={15} aria-hidden style={{ color: 'var(--orange)' }} />
                  <a href="tel:+34633778699" style={{ color: 'var(--ink)', textDecoration: 'none' }}>
                    +34 633 77 86 99
                  </a>
                </li>
              </ul>
              <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
                <Link href="/" className="btn btn-ghost">
                  {t('common.back-to-website')} <ArrowRight size={14} aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
      <PublicFooter />
    </div>
  );
}
