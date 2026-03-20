'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ArrowRight, Shield, Gift, CheckCircle, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'exit-intent', interest: 'offerte' }),
      });
      setSubmitted(true);
      setTimeout(dismiss, 3000);
    } catch {
      setSubmitted(true);
      setTimeout(dismiss, 3000);
    }
    setSubmitting(false);
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
            className="relative bg-card rounded-2xl max-w-md w-full p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
              aria-label="Sluiten"
            >
              <X size={16} />
            </button>

            {submitted ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-accent/15 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={24} className="text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">Bedankt!</h3>
                <p className="text-sm text-gray-500">Wij sturen u binnen 24 uur een persoonlijke offerte op maat.</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Gift size={24} className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Gratis offerte op maat</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  Laat uw e-mailadres achter en ontvang binnen 24 uur een <strong className="text-gray-900">persoonlijk aanbod</strong> met onze tarieven voor stalling, onderhoud en transport.
                </p>

                <form onSubmit={handleSubmit} className="mb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500/40" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300/40 rounded-xl text-sm focus:ring-2 focus:ring-primary/15 focus:border-primary/30 outline-none transition-all"
                        placeholder="uw@email.com"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-primary hover:bg-primary-light text-white font-bold px-5 py-3 rounded-xl text-sm transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-sm shrink-0"
                    >
                      {submitting ? '...' : <><span className="hidden sm:inline">Verstuur</span> <ArrowRight size={14} /></>}
                    </button>
                  </div>
                </form>

                <div className="flex items-center gap-3 justify-center mb-5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Shield size={12} className="text-success" /> Geen spam
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Shield size={12} className="text-success" /> Reactie binnen 24 uur
                  </div>
                </div>

                <button
                  onClick={dismiss}
                  className="text-sm text-gray-500 hover:text-primary transition-colors font-medium py-2"
                >
                  Nee bedankt, ik kijk nog even rond
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
