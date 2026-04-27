'use client';

import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-bg">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-md"
      >
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-text-muted">
            Caravanstalling
          </span>
        </div>
        <h1 className="text-3xl font-medium text-text mb-3 tracking-tight">
          We zijn aan het verbouwen
        </h1>
        <p className="text-text-muted leading-relaxed">
          Onze website krijgt een nieuwe vorm. Binnenkort terug.
        </p>
        <div className="mt-10 pt-10 border-t border-border">
          <a
            href="mailto:info@caravanstalling-spanje.com"
            className="text-sm text-text underline-offset-4 hover:underline"
          >
            info@caravanstalling-spanje.com
          </a>
        </div>
      </motion.div>
    </main>
  );
}
