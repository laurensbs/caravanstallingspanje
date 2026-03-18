'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, ArrowRight, Shield, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY <= 5 && !show) {
      const dismissed = sessionStorage.getItem('exit-popup-dismissed');
      if (!dismissed) {
        setShow(true);
      }
    }
  }, [show]);

  useEffect(() => {
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [handleMouseLeave]);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem('exit-popup-dismissed', '1');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface flex items-center justify-center text-warm-gray hover:text-primary transition-colors"
              aria-label="Sluiten"
            >
              <X size={16} />
            </button>

            <div className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Gift size={24} className="text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-2">Wacht even!</h3>
              <p className="text-warm-gray text-sm leading-relaxed mb-6">
                Vraag vandaag nog een <strong className="text-surface-dark">gratis vrijblijvende offerte</strong> aan en ontvang een overzicht van onze tarieven op maat. Inclusief alle mogelijkheden voor stalling, onderhoud en transport.
              </p>

              <div className="flex items-center gap-3 justify-center mb-6">
                <div className="flex items-center gap-1.5 text-xs text-warm-gray">
                  <Shield size={12} className="text-success" /> Geen verplichtingen
                </div>
                <div className="flex items-center gap-1.5 text-xs text-warm-gray">
                  <Shield size={12} className="text-success" /> Reactie binnen 24 uur
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="/contact"
                  onClick={dismiss}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all inline-flex items-center justify-center gap-2 shadow-sm"
                >
                  Gratis offerte aanvragen <ArrowRight size={14} />
                </Link>
                <button
                  onClick={dismiss}
                  className="text-sm text-warm-gray hover:text-primary transition-colors font-medium py-2"
                >
                  Nee bedankt, ik kijk nog even rond
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
