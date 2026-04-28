'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Mail, Phone } from 'lucide-react';

interface SuccessScreenProps {
  title: string;
  body: string;
  reference?: string | null;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export default function SuccessScreen({ title, body, reference }: SuccessScreenProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-6 py-12">
      <div className="max-w-md text-center">
        {/* Animated success badge with concentric pulse */}
        <div className="relative w-20 h-20 mx-auto mb-7">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.4, 1.4], opacity: [0, 0.4, 0] }}
            transition={{ duration: 1.6, ease: 'easeOut', times: [0, 0.4, 1] }}
            className="absolute inset-0 rounded-full"
            style={{ background: 'var(--color-success)', opacity: 0.15 }}
          />
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
            className="absolute inset-2 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-success-soft)' }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 380, damping: 20 }}
              style={{ color: 'var(--color-success)' }}
            >
              <Check size={28} strokeWidth={3} />
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4, ease: EASE }}
        >
          <h1 className="text-2xl font-semibold tracking-tight mb-3">{title}</h1>
          <p className="text-text-muted leading-relaxed">{body}</p>
          {reference && (
            <p className="text-[11px] text-text-subtle mt-6 font-mono break-all">
              Referentie: {reference}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: EASE }}
          className="mt-10 pt-8 border-t border-border space-y-2.5"
        >
          <p className="text-sm text-text-muted inline-flex items-center justify-center gap-1.5">
            <Mail size={13} />
            <a
              href="mailto:info@caravanstalling-spanje.com"
              className="text-text underline-offset-4 hover:underline"
            >
              info@caravanstalling-spanje.com
            </a>
          </p>
          <p className="text-sm text-text-muted inline-flex items-center justify-center gap-1.5">
            <Phone size={13} />
            <a href="tel:+34633778699" className="text-text underline-offset-4 hover:underline">
              +34 633 778 699
            </a>
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-block text-sm text-text-muted hover:text-text underline-offset-4 hover:underline transition-colors"
            >
              Terug naar de website
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
