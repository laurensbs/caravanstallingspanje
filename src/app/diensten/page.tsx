'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Refrigerator, Wind, Warehouse, Truck, Wrench, ClipboardCheck, Sparkles, ArrowRight,
} from 'lucide-react';
import PublicHero from '@/components/PublicHero';
import PublicFooter from '@/components/PublicFooter';

const SERVICES = [
  {
    href: '/koelkast',
    title: 'Fridges',
    description: 'Rent a fridge or table fridge for your campsite — delivered to your spot.',
    icon: Refrigerator,
    accent: 'cyan' as const,
    cta: 'Book a fridge',
  },
  {
    href: '/diensten/airco',
    title: 'AC units',
    description: 'Stay cool during the summer heat — portable AC units delivered and installed.',
    icon: Wind,
    accent: 'violet' as const,
    cta: 'Book an AC',
  },
  {
    href: '/diensten/stalling',
    title: 'Storage',
    description: 'Indoor or outdoor caravan storage on the Costa Brava — secured 24/7.',
    icon: Warehouse,
    accent: 'amber' as const,
    cta: 'Request storage',
  },
  {
    href: '/diensten/transport',
    title: 'Transport',
    description: 'We pick up and drop off your caravan — or you swing by yourself.',
    icon: Truck,
    accent: 'cyan' as const,
    cta: 'Plan transport',
  },
  {
    href: '/diensten/service',
    title: 'Service',
    description: 'On-site service for fridges, AC, awnings — pick a job and we get to work.',
    icon: Sparkles,
    accent: 'amber' as const,
    cta: 'Pick a service',
  },
  {
    href: '/diensten/reparatie',
    title: 'Repair',
    description: 'Something broken? Submit a repair request and our workshop reviews it.',
    icon: Wrench,
    accent: 'violet' as const,
    cta: 'Request a repair',
  },
  {
    href: '/diensten/inspectie',
    title: 'Inspection',
    description: 'Full inspection of your caravan — bodywork, electrical, gas, brakes.',
    icon: ClipboardCheck,
    accent: 'cyan' as const,
    cta: 'Request inspection',
  },
];

const ACCENT_RING: Record<'cyan' | 'amber' | 'violet', string> = {
  cyan: 'rgba(126,168,255,0.35)',
  amber: 'rgba(255,180,80,0.35)',
  violet: 'rgba(180,140,255,0.35)',
};
const ACCENT_FILL: Record<'cyan' | 'amber' | 'violet', string> = {
  cyan: 'rgba(126,168,255,0.12)',
  amber: 'rgba(255,180,80,0.12)',
  violet: 'rgba(180,140,255,0.12)',
};

export default function DienstenIndex() {
  return (
    <main
      className="min-h-screen page-public page-public-dark flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0A1929 0%, #050D18 100%)' }}
    >
      <PublicHero
        back={{ href: '/', label: 'Home' }}
        title="Services"
        intro="Fridges, AC units, storage, transport, repair — pick what you need and we go from there."
        eyebrow="Costa Brava"
        accent="cyan"
      />

      <section className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={s.href}
                  className="block h-full p-5 sm:p-6 rounded-[var(--radius-2xl)] transition-all hover:-translate-y-0.5 group"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center mb-4"
                    style={{
                      background: ACCENT_FILL[s.accent],
                      border: `1px solid ${ACCENT_RING[s.accent]}`,
                      color: '#F1F5F9',
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <h2 className="text-[18px] sm:text-[19px] font-semibold mb-1.5 tracking-tight" style={{ color: '#FFFFFF' }}>
                    {s.title}
                  </h2>
                  <p className="text-[14px] leading-relaxed mb-5" style={{ color: 'rgba(241,245,249,0.65)' }}>
                    {s.description}
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors"
                    style={{ color: '#F1F5F9' }}
                  >
                    {s.cta}
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
