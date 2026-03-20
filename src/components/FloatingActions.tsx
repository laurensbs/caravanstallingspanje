'use client';

import { Phone, MessageCircle, FileText } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuizModal from './QuizModal';

export default function FloatingActions() {
  const [expanded, setExpanded] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex flex-col items-end gap-3">
      {/* Contact options */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="flex flex-col gap-2 mb-1"
          >
            <button
              onClick={() => { setQuizOpen(true); setExpanded(false); }}
              className="w-12 h-12 rounded-full bg-accent shadow-lg shadow-accent/20 flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
              aria-label="Offerte aanvragen"
            >
              <FileText size={20} />
            </button>
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
            ? 'bg-primary shadow-surface-dark/20 rotate-45'
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
    <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} source="floating-action" />
    </>
  );
}
