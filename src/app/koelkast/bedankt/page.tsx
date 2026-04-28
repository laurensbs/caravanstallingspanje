'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Mail } from 'lucide-react';

export default function ThankYouPage() {
  return (
    <Suspense fallback={null}>
      <ThankYouContent />
    </Suspense>
  );
}

function ThankYouContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md text-center"
      >
        <div className="w-12 h-12 rounded-full bg-success-soft text-success flex items-center justify-center mx-auto mb-6">
          <Check size={20} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mb-3">Betaling ontvangen</h1>
        <p className="text-text-muted leading-relaxed">
          Bedankt! Je betaling is geregistreerd en je koelkasthuur staat klaar.
          Je krijgt zo een bevestiging per e-mail.
        </p>
        {sessionId && (
          <p className="text-[11px] text-text-subtle mt-6 font-mono">
            Referentie: {sessionId.slice(0, 16)}…
          </p>
        )}
        <div className="mt-10 pt-10 border-t border-border space-y-3">
          <p className="text-sm text-text-muted inline-flex items-center justify-center gap-1.5">
            <Mail size={13} />{' '}
            <a
              href="mailto:info@caravanstalling-spanje.com"
              className="text-text underline-offset-4 hover:underline"
            >
              info@caravanstalling-spanje.com
            </a>
          </p>
          <Link
            href="/"
            className="inline-block text-sm text-text-muted hover:text-text underline-offset-4 hover:underline"
          >
            Terug naar de website
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
