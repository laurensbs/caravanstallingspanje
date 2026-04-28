'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Wrench, Sparkles, Search, Truck, Warehouse, Refrigerator } from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';
import LocaleSwitch from '@/components/LocaleSwitch';
import type { StringKey } from '@/lib/i18n';

const SERVICES: { href: string; titleKey: StringKey; descKey: StringKey; icon: typeof Wrench }[] = [
  { href: '/diensten/reparatie',  titleKey: 'services.repair-title',     descKey: 'services.repair-desc',     icon: Wrench },
  { href: '/diensten/service',    titleKey: 'services.service-title',    descKey: 'services.service-desc',    icon: Sparkles },
  { href: '/diensten/inspectie',  titleKey: 'services.inspection-title', descKey: 'services.inspection-desc', icon: Search },
  { href: '/diensten/transport',  titleKey: 'services.transport-title',  descKey: 'services.transport-desc',  icon: Truck },
  { href: '/diensten/stalling',   titleKey: 'services.storage-title',    descKey: 'services.storage-desc',    icon: Warehouse },
  { href: '/koelkast',            titleKey: 'services.fridge-title',     descKey: 'services.fridge-desc',     icon: Refrigerator },
];

export default function DienstenPage() {
  const { t } = useLocale();
  return (
    <main className="min-h-screen bg-bg relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
        <LocaleSwitch />
      </div>
      <div className="max-w-4xl mx-auto px-6 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-text-muted">
              {t('common.brand')}
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[40px] leading-[1.15] font-semibold tracking-tight">
            {t('services.heading')}
          </h1>
          <p className="text-text-muted mt-3 text-[14px] sm:text-base leading-relaxed max-w-xl">
            {t('services.intro')}
          </p>
        </motion.div>

        <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={s.href}
                  className="card-surface group hover-lift press-spring block p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between mb-6 sm:mb-7">
                    <div className="w-10 h-10 rounded-[var(--radius-md)] bg-surface-2 text-text flex items-center justify-center border border-border transition-transform group-hover:scale-105">
                      <Icon size={18} />
                    </div>
                    <ArrowRight size={14} className="text-text-subtle group-hover:text-text transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <h2 className="text-base font-semibold text-text">{t(s.titleKey)}</h2>
                  <p className="text-[13px] text-text-muted mt-1 leading-relaxed">{t(s.descKey)}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <p className="text-xs text-text-muted text-center mt-12">
          {t('common.questions')}{' '}
          <a href="mailto:info@caravanstalling-spanje.com" className="text-text underline-offset-4 hover:underline">
            info@caravanstalling-spanje.com
          </a>
        </p>
      </div>
    </main>
  );
}
