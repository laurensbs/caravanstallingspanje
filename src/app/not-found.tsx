'use client';

import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Search size={32} className="text-primary" />
        </div>
        <h1 className="text-4xl font-black mb-3">Pagina niet gevonden</h1>
        <p className="text-warm-gray mb-8 leading-relaxed">
          De pagina die u zoekt bestaat niet of is verplaatst. Controleer het adres of ga terug naar de homepage.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-sm"
        >
          <Home size={15} /> Naar homepage
        </Link>
      </motion.div>
    </div>
  );
}
