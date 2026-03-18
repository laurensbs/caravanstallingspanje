'use client';

import { Phone, ArrowUp, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex flex-col items-end gap-3">
      {/* Scroll to top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-11 h-11 rounded-full bg-card shadow-lg shadow-warm-gray/10 border border-sand-dark flex items-center justify-center text-warm-gray hover:text-primary hover:border-primary/30 transition-all duration-300 hover:shadow-xl"
            aria-label="Scroll naar boven"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Contact options */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="flex flex-col gap-2 mb-1"
          >
            <a
              href="https://wa.me/34650036755?text=Hallo%2C%20ik%20heb%20een%20vraag%20over%20caravanstalling%20aan%20de%20Costa%20Brava."
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/20 flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
              aria-label="WhatsApp"
            >
              <MessageCircle size={20} />
            </a>
            <a
              href="tel:+34650036755"
              className="w-12 h-12 rounded-full bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
              aria-label="Bel ons"
            >
              <Phone size={20} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 ${
          expanded
            ? 'bg-hero shadow-surface-dark/20 rotate-45'
            : 'bg-primary shadow-primary/30 animate-pulse-glow'
        }`}
        aria-label="Contact opties"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
