'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X } from 'lucide-react';
import Link from 'next/link';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4 sm:p-6"
        >
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-sand-dark/10 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Shield size={20} className="text-accent shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-warm-gray leading-relaxed">
              Wij gebruiken cookies om uw ervaring te verbeteren en onze website te analyseren.
              Lees ons <Link href="/privacy" className="text-primary hover:underline font-medium">privacybeleid</Link> voor meer informatie.
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={decline} className="text-sm text-warm-gray hover:text-surface-dark font-medium transition-colors">
                Weigeren
              </button>
              <button onClick={accept} className="bg-accent hover:bg-accent-dark text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all">
                Accepteren
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
