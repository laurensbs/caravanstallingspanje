'use client';

import Link from 'next/link';
import { Home, Search, MapPin, Phone, Euro, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const popularPages = [
  { href: '/stalling', label: 'Stalling bekijken', icon: Home },
  { href: '/tarieven', label: 'Tarieven & prijzen', icon: Euro },
  { href: '/locaties', label: 'Onze locatie', icon: MapPin },
  { href: '/contact', label: 'Contact opnemen', icon: Phone },
  { href: '/blog', label: 'Blog & tips', icon: BookOpen },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Search size={32} className="text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-3">Pagina niet gevonden</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          De pagina die u zoekt bestaat niet of is verplaatst. Controleer het adres of bekijk een van onze populaire pagina&apos;s.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {popularPages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="inline-flex items-center gap-2 bg-card hover:bg-gray-100 border border-gray-200 text-dark font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <page.icon size={14} className="text-primary" /> {page.label}
            </Link>
          ))}
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-sm"
        >
          <Home size={15} /> Naar homepage
        </Link>
      </motion.div>
    </div>
  );
}
