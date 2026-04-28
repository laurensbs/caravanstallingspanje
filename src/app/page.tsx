'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight, LayoutGrid, Refrigerator, ShieldCheck, Wrench, Star,
} from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 sm:py-20 bg-bg">
      <div className="w-full max-w-3xl">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-center mb-10 sm:mb-12"
        >
          <Image
            src="/images/logo.png"
            alt="Caravanstalling Spanje"
            width={300}
            height={68}
            priority
            className="mx-auto h-12 sm:h-14 w-auto mb-7 sm:mb-9"
          />
          <h1 className="text-[28px] sm:text-[40px] leading-[1.15] font-semibold tracking-tight">
            Meer dan een caravanstalling
          </h1>
          <p className="text-text-muted mt-4 leading-relaxed max-w-lg mx-auto text-[14px] sm:text-base">
            Stalling, reparatie, transport en service aan de Costa Brava — alles via één plek, met vast personeel dat om je tweede huis geeft.
          </p>

          {/* Reviews badge */}
          <motion.a
            href="https://g.co/kgs/caravanstalling"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: EASE }}
            className="press-spring inline-flex items-center gap-2 mt-5 px-3 py-1.5 rounded-full border border-border bg-surface hover:border-border-strong transition-colors"
          >
            <span className="flex items-center gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  size={11}
                  fill="currentColor"
                  style={{ color: 'var(--color-ring)' }}
                />
              ))}
            </span>
            <span className="text-[11px] font-medium tabular-nums">4.9</span>
            <span className="text-[11px] text-text-muted">· 25 Google reviews</span>
          </motion.a>
        </motion.div>

        {/* CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 sm:mb-12">
          <CtaCard
            href="/diensten"
            title="Diensten"
            description="Reparatie, service, inspectie, transport, stalling."
            icon={LayoutGrid}
            delay={0.12}
          />
          <CtaCard
            href="/koelkast"
            title="Koelkast huren"
            description="Bezorgd op je staanplaats. Vanaf één week."
            icon={Refrigerator}
            delay={0.18}
          />
        </div>

        {/* USPs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4, ease: EASE }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-3"
        >
          <Usp icon={ShieldCheck} title="24/7 beveiligd">
            Camera's, alarm + verzekering inbegrepen
          </Usp>
          <Usp icon={Wrench} title="Eigen werkplaats">
            Reparatie en onderhoud op locatie
          </Usp>
          <Usp icon={Star} title="4.9 op Google">
            Vast personeel, vaste klanten
          </Usp>
        </motion.div>

        {/* Footer */}
        <p className="text-xs text-text-muted text-center mt-12 sm:mt-16">
          Vragen?{' '}
          <a
            href="mailto:info@caravanstalling-spanje.com"
            className="text-text underline-offset-4 hover:underline"
          >
            info@caravanstalling-spanje.com
          </a>
          {' · '}
          <a
            href="tel:+34633778699"
            className="text-text underline-offset-4 hover:underline"
          >
            +34 633 778 699
          </a>
        </p>
      </div>
    </main>
  );
}

function CtaCard({
  href, title, description, icon: Icon, delay,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof Refrigerator;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: EASE }}
    >
      <Link
        href={href}
        className="card-surface group hover-lift press-spring block p-6"
      >
        <div className="flex items-start justify-between mb-8">
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-surface-2 text-text flex items-center justify-center border border-border transition-transform group-hover:scale-105">
            <Icon size={18} />
          </div>
          <ArrowRight
            size={14}
            className="text-text-subtle group-hover:text-text transition-transform group-hover:translate-x-0.5"
          />
        </div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-[13px] text-text-muted mt-1 leading-relaxed">{description}</p>
      </Link>
    </motion.div>
  );
}

function Usp({
  icon: Icon, title, children,
}: {
  icon: typeof ShieldCheck;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex sm:flex-col items-start gap-3 sm:gap-2 px-4 py-3 sm:py-0 sm:px-0">
      <div className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center border border-border shrink-0">
        <Icon size={15} className="text-text" />
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-text">{title}</div>
        <div className="text-[12px] text-text-muted leading-relaxed mt-0.5">{children}</div>
      </div>
    </div>
  );
}
