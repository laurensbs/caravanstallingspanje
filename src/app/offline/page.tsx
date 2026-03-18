'use client';

import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-sand rounded-3xl flex items-center justify-center mx-auto mb-6">
          <WifiOff size={36} className="text-warm-gray/70" />
        </div>
        <h1 className="text-2xl font-black text-surface-dark mb-3">Geen verbinding</h1>
        <p className="text-warm-gray text-sm mb-8">
          U bent momenteel offline. Controleer uw internetverbinding en probeer het opnieuw.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all"
        >
          Opnieuw proberen
        </button>
        <p className="text-xs text-warm-gray/70 mt-6">
          Eerder bezochte pagina&apos;s zijn mogelijk nog beschikbaar vanuit cache.
        </p>
      </div>
    </div>
  );
}
