'use client';
import { Gift, CheckCircle, Copy } from 'lucide-react';
import type { CustomerData } from './types';

interface Props { customer: CustomerData; }

export default function DoorverwijzenTab({ customer }: Props) {
  return (
    <div className="max-w-2xl">
      <div className="bg-surface rounded-2xl border border-sand-dark/20 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Gift size={22} className="text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-surface-dark text-lg">Vrienden uitnodigen</h2>
            <p className="text-sm text-warm-gray">Verdien korting op uw stalling</p>
          </div>
        </div>

        <div className="bg-sand/50 rounded-xl p-6 mb-6 border border-sand-dark/20">
          <h3 className="font-bold text-sm mb-3">Zo werkt het:</h3>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Deel uw persoonlijke doorverwijslink met vrienden of kennissen' },
              { step: '2', text: 'Uw vriend sluit een stallingscontract af bij ons' },
              { step: '3', text: 'U ontvangt 1 maand gratis stalling als bedankje' },
              { step: '4', text: 'Uw vriend krijgt 10% korting op de eerste 3 maanden' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary text-white rounded-full text-xs font-bold flex items-center justify-center shrink-0">{s.step}</span>
                <p className="text-sm text-warm-gray">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-xs font-semibold text-warm-gray/70 block mb-2">Uw doorverwijslink</label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={`https://caravanstalling-spanje.com/reserveren?ref=${customer?.referral_token || customer?.customer_number || 'XXXXX'}`}
              className="flex-1 border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://caravanstalling-spanje.com/reserveren?ref=${customer?.referral_token || customer?.customer_number || ''}`);
              }}
              className="bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-2"
            >
              <Copy size={14} /> Kopiëren
            </button>
          </div>
        </div>

        <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-accent" />
            <span className="text-sm font-bold text-accent-dark">Geen limiet</span>
          </div>
          <p className="text-xs text-warm-gray">Er is geen limiet aan het aantal vrienden dat u kunt doorverwijzen. Hoe meer doorverwijzingen, hoe meer gratis maanden stalling!</p>
        </div>
      </div>
    </div>
  );
}
