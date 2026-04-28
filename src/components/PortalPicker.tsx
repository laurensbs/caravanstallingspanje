'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Refrigerator, Wrench, ExternalLink } from 'lucide-react';

const REPAIR_URL = process.env.NEXT_PUBLIC_REPAIR_URL || 'https://caravanreparatiespanje.vercel.app';

export default function PortalPicker() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-text-muted">
              Beheerportaal
            </span>
          </div>
          <h1 className="text-2xl font-medium text-text tracking-tight">Caravanstalling</h1>
          <p className="text-sm text-text-muted mt-2">Welk portaal wil je openen?</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PortalCard
            href="/admin/dashboard"
            external={false}
            icon={Refrigerator}
            title="Stalling beheer"
            description="Koelkasten, periodes, wachtlijst en stallingaanvragen."
            delay={0.05}
          />
          <PortalCard
            href={REPAIR_URL}
            external
            icon={Wrench}
            title="Reparatie & Work Orders"
            description="Werkbonnen, services, transporten en onderdelen."
            delay={0.1}
          />
        </div>
      </div>
    </main>
  );
}

interface PortalCardProps {
  href: string;
  external: boolean;
  icon: typeof Refrigerator;
  title: string;
  description: string;
  delay: number;
}

function PortalCard({ href, external, icon: Icon, title, description, delay }: PortalCardProps) {
  const Wrapper = ({ children, className }: { children: React.ReactNode; className?: string }) =>
    external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    ) : (
      <a href={href} className={className}>
        {children}
      </a>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <Wrapper className="block group p-6 bg-surface border border-border rounded-[var(--radius-xl)] hover:border-border-strong hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-8">
          <div className="w-10 h-10 rounded-full bg-surface-2 text-text flex items-center justify-center border border-border">
            <Icon size={18} />
          </div>
          {external ? (
            <ExternalLink size={14} className="text-text-subtle group-hover:text-text transition-colors" />
          ) : (
            <ArrowRight size={14} className="text-text-subtle group-hover:text-text transition-colors" />
          )}
        </div>
        <h2 className="text-base font-medium text-text">{title}</h2>
        <p className="text-sm text-text-muted mt-1 leading-relaxed">{description}</p>
      </Wrapper>
    </motion.div>
  );
}
