'use client';

import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <WifiOff size={36} className="text-gray-500/70" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Geen verbinding</h1>
        <p className="text-gray-500 text-sm mb-8">
          U bent momenteel offline. Controleer uw internetverbinding en probeer het opnieuw.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-primary hover:bg-primary-light text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all"
        >
          Opnieuw proberen
        </button>
        <p className="text-xs text-gray-500/70 mt-6">
          Eerder bezochte pagina&apos;s zijn mogelijk nog beschikbaar vanuit cache.
        </p>
      </div>
    </div>
  );
}
