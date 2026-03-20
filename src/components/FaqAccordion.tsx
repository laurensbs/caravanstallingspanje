'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FaqItem({ q, a, children }: { q: string; a: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-300/[0.06] last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left group" aria-expanded={open}>
        <span className="font-bold text-sm pr-6">{q}</span>
        <ChevronDown size={18} className={`text-gray-500 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            {children || <p className="text-sm text-gray-500 leading-relaxed pb-5">{a}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
