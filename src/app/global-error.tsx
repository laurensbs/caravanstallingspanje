'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="nl">
      <body className="bg-surface min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Er ging iets mis</h2>
          <p className="text-gray-500 mb-6">Onze excuses voor het ongemak. Het probleem is automatisch gemeld.</p>
          <button onClick={reset} className="bg-primary hover:bg-primary-light text-white font-bold px-6 py-3 rounded-xl transition-colors">
            Opnieuw proberen
          </button>
        </div>
      </body>
    </html>
  );
}
