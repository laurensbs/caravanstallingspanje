'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-danger/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-danger" />
        </div>
        <h2 className="text-3xl font-black mb-3">Er ging iets mis</h2>
        <p className="text-warm-gray mb-8 leading-relaxed">
          Er is een onverwachte fout opgetreden. Probeer het opnieuw of ga terug naar de homepage.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all duration-200"
          >
            <RefreshCw size={15} /> Opnieuw proberen
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-warm-gray hover:text-surface-dark font-medium px-6 py-3.5 rounded-xl text-sm transition-colors border border-sand-dark/30 hover:border-sand-dark/50"
          >
            Naar homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
