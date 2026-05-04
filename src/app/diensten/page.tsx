'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Refrigerator, Wind, Warehouse, Truck, Wrench, ClipboardCheck, Sparkles, ArrowRight, Compass,
} from 'lucide-react';
import MarketingPage from '@/components/marketing/MarketingPage';
import { useLocale } from '@/components/LocaleProvider';
import type { StringKey } from '@/lib/i18n';

type Accent = 'cyan' | 'amber' | 'violet';

type Service = {
  href: string;
  titleKey: StringKey;
  descKey: StringKey;
  ctaKey: StringKey;
  icon: typeof Refrigerator;
  accent: Accent;
};

const SERVICES: Service[] = [
  { href: '/koelkast',           titleKey: 'services.fridge-title',     descKey: 'services.fridge-desc',     ctaKey: 'services.cta.fridge',     icon: Refrigerator,    accent: 'cyan'   },
  { href: '/diensten/airco',     titleKey: 'services.ac-title',         descKey: 'services.ac-desc',         ctaKey: 'services.cta.ac',         icon: Wind,            accent: 'violet' },
  { href: '/diensten/stalling',  titleKey: 'services.storage-title',    descKey: 'services.storage-desc',    ctaKey: 'services.cta.storage',    icon: Warehouse,       accent: 'amber'  },
  { href: '/diensten/transport', titleKey: 'services.transport-title',  descKey: 'services.transport-desc',  ctaKey: 'services.cta.transport',  icon: Truck,           accent: 'cyan'   },
  { href: '/diensten/service',   titleKey: 'services.service-title',    descKey: 'services.service-desc',    ctaKey: 'services.cta.service',    icon: Sparkles,        accent: 'amber'  },
  { href: '/diensten/reparatie', titleKey: 'services.repair-title',     descKey: 'services.repair-desc',     ctaKey: 'services.cta.repair',     icon: Wrench,          accent: 'violet' },
  { href: '/diensten/inspectie', titleKey: 'services.inspection-title', descKey: 'services.inspection-desc', ctaKey: 'services.cta.inspection', icon: ClipboardCheck,  accent: 'cyan'   },
];

export default function DienstenIndex() {
  const { t } = useLocale();
  return (
    <MarketingPage
      hero={{
        title: t('services.index-title'),
        intro: t('services.index-intro'),
        eyebrow: t('services.eyebrow'),
        back: { href: '/', label: t('common.brand') },
        icon: Compass,
      }}
    >
      <section className="max-w-[1180px] w-full mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            const num = String(i + 1).padStart(2, '0');
            return (
              <motion.div
                key={s.href}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={s.href}
                  className="mk-card mk-card-hover group block h-full p-6 sm:p-7"
                >
                  <span aria-hidden className="mk-card-num">{num} / {String(SERVICES.length).padStart(2, '0')}</span>
                  <div className="mk-icon-disc mk-icon-disc-lg mb-5">
                    <Icon size={24} strokeWidth={1.7} aria-hidden />
                  </div>
                  <h2
                    className="font-display"
                    style={{
                      color: 'var(--color-navy)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      letterSpacing: '-0.012em',
                      margin: '0 0 0.45rem',
                    }}
                  >
                    {t(s.titleKey)}
                  </h2>
                  <p className="text-[14px] leading-relaxed mb-6" style={{ color: 'var(--color-marketing-ink-soft)' }}>
                    {t(s.descKey)}
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-all group-hover:gap-2.5"
                    style={{ color: 'var(--color-terracotta-deep)' }}
                  >
                    {t(s.ctaKey)}
                    <ArrowRight size={14} aria-hidden />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </MarketingPage>
  );
}
