'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, LayoutGrid, Refrigerator } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 bg-bg">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <Image
            src="/images/logo.png"
            alt="Caravanstalling Spanje"
            width={300}
            height={68}
            priority
            className="mx-auto h-12 w-auto mb-8"
          />
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Stalling, service en transport aan de Costa Brava
          </h1>
          <p className="text-text-muted mt-4 leading-relaxed max-w-lg mx-auto">
            Reparatie, schoonmaak, transport, koelkast huren of stalling aanvragen — alles via één plek.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CtaCard
            href="/diensten"
            title="Diensten"
            description="Reparatie, service, inspectie, transport, stalling."
            icon={LayoutGrid}
            delay={0.1}
          />
          <CtaCard
            href="/koelkast"
            title="Koelkast huren"
            description="Bezorgd op je staanplaats. Vanaf één week."
            icon={Refrigerator}
            delay={0.15}
          />
        </div>

        <p className="text-xs text-text-muted text-center mt-12">
          Vragen?{' '}
          <a
            href="mailto:info@caravanstalling-spanje.com"
            className="text-text underline-offset-4 hover:underline"
          >
            info@caravanstalling-spanje.com
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={href}
        className="card-surface group hover-lift block p-6"
      >
        <div className="flex items-start justify-between mb-8">
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-surface-2 text-text flex items-center justify-center border border-border">
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
