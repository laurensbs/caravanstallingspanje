'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Wrench, Sparkles, Search, Truck, Warehouse, Refrigerator } from 'lucide-react';

const SERVICES = [
  {
    href: '/diensten/reparatie',
    title: 'Reparatie',
    description: 'Schade, beading, onderdelen of een ander probleem aan je caravan.',
    icon: Wrench,
  },
  {
    href: '/diensten/service',
    title: 'Service',
    description: 'Waxen, schoonmaak, ozonbehandeling en meer onderhoudsdiensten.',
    icon: Sparkles,
  },
  {
    href: '/diensten/inspectie',
    title: 'Inspectie',
    description: 'Technische keuring met rapport — vóór seizoen, of na schade.',
    icon: Search,
  },
  {
    href: '/diensten/transport',
    title: 'Transport',
    description: 'Ophalen of brengen tussen camping en stalling, of NL ↔ Spanje.',
    icon: Truck,
  },
  {
    href: '/diensten/stalling',
    title: 'Stalling',
    description: 'Caravan stallen op ons terrein — binnen overdekt of buiten op plek.',
    icon: Warehouse,
  },
  {
    href: '/koelkast',
    title: 'Koelkast huren',
    description: 'Bezorgd op je staanplaats. Vanaf één week.',
    icon: Refrigerator,
  },
];

export default function DienstenPage() {
  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-6 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-text-muted">
              Caravanstalling
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[40px] leading-[1.15] font-semibold tracking-tight">Onze diensten</h1>
          <p className="text-text-muted mt-3 text-[14px] sm:text-base leading-relaxed max-w-xl">
            Kies een dienst om aan te vragen. Online betalen waar mogelijk, anders nemen we contact op.
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
                  <h2 className="text-base font-semibold text-text">{s.title}</h2>
                  <p className="text-[13px] text-text-muted mt-1 leading-relaxed">{s.description}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <p className="text-xs text-text-muted text-center mt-12">
          Vragen?{' '}
          <a href="mailto:info@caravanstalling-spanje.com" className="text-text underline-offset-4 hover:underline">
            info@caravanstalling-spanje.com
          </a>
        </p>
      </div>
    </main>
  );
}
