'use client';
import { Gift, CheckCircle, Copy, Sparkles, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { CustomerData } from './types';

interface Props { customer: CustomerData; }

export default function DoorverwijzenTab({ customer }: Props) {
  const [copied, setCopied] = useState(false);
  const referralUrl = `https://caravanstalling-spanje.com/reserveren?ref=${customer?.referral_token || customer?.customer_number || ''}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="icon-premium w-14 h-14">
            <Gift size={24} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-xl">Vrienden uitnodigen</h2>
            <p className="text-sm text-gray-500/70">Verdien korting op uw stalling</p>
          </div>
        </div>

        {/* How it works */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Sparkles size={14} className="text-primary" /> Zo werkt het:
          </h3>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Deel uw persoonlijke doorverwijslink met vrienden of kennissen', icon: '🔗' },
              { step: '2', text: 'Uw vriend sluit een stallingscontract af bij ons', icon: '✍️' },
              { step: '3', text: 'U ontvangt 1 maand gratis stalling als bedankje', icon: '🎁' },
              { step: '4', text: 'Uw vriend krijgt 10% korting op de eerste 3 maanden', icon: '💰' },
            ].map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }}
                className="flex items-start gap-3">
                <span className="w-7 h-7 bg-gradient-to-br from-primary to-primary-light text-white rounded-lg text-xs font-bold flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">{s.step}</span>
                <p className="text-sm text-gray-500 pt-0.5">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Referral link */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <label className="text-xs font-bold text-gray-500/60 uppercase tracking-wider block mb-2">Uw doorverwijslink</label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={referralUrl}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-gray-50 focus:outline-none font-mono text-gray-500/80"
            />
            <button
              onClick={handleCopy}
              className={`font-bold px-5 py-3.5 rounded-xl text-sm transition-all flex items-center gap-2 shadow-lg hover:-translate-y-0.5 ${
                copied
                  ? 'bg-accent text-white shadow-accent/20'
                  : 'bg-gradient-to-r from-primary to-primary-light text-white shadow-primary/20'
              }`}
            >
              {copied ? <><CheckCircle size={14} /> Gekopieerd!</> : <><Copy size={14} /> Kopiëren</>}
            </button>
          </div>
        </motion.div>

        {/* No limit badge */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-4 bg-gradient-to-br from-accent/[0.06] to-accent/[0.02] rounded-xl border border-accent/20">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-accent" />
            <span className="text-sm font-bold text-accent-dark">Geen limiet</span>
          </div>
          <p className="text-xs text-gray-500">Er is geen limiet aan het aantal vrienden dat u kunt doorverwijzen. Hoe meer doorverwijzingen, hoe meer gratis maanden stalling!</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
