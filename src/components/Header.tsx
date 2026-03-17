'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail, Clock, User, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/stalling', label: 'Stalling' },
  { href: '/diensten', label: 'Diensten' },
  { href: '/locaties', label: 'Locaties' },
  { href: '/tarieven', label: 'Tarieven' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className="bg-primary-dark text-white/70 text-xs hidden lg:block border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <a href="tel:+34972000000" className="flex items-center gap-1.5 hover:text-accent transition-colors">
              <Phone size={11} /> +34 972 00 00 00
            </a>
            <span className="w-px h-3 bg-white/10" />
            <a href="mailto:info@caravanstalling-spanje.com" className="flex items-center gap-1.5 hover:text-accent transition-colors">
              <Mail size={11} /> info@caravanstalling-spanje.com
            </a>
          </div>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5"><Clock size={11} /> Ma-Vr 09:30 - 16:30</span>
            <span className="w-px h-3 bg-white/10" />
            <Link href="/mijn-account" className="flex items-center gap-1.5 text-accent hover:text-accent-light font-semibold transition-colors">
              <User size={11} /> Mijn Account
            </Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-primary-dark/95 backdrop-blur-xl shadow-2xl shadow-black/20'
            : 'bg-primary/95 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 md:h-[68px]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-accent to-accent-light rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 group-hover:shadow-accent/40 transition-shadow">
              <span className="text-primary-dark font-black text-sm">CS</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight block leading-tight">
                CARAVANSTALLING
              </span>
              <span className="text-accent text-[10px] font-bold tracking-[0.2em] uppercase block leading-tight">
                Spanje
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV.map(n => (
              <Link
                key={n.href}
                href={n.href}
                className="relative text-white/70 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-300 group"
              >
                {n.label}
                <span className="absolute bottom-0.5 left-4 right-4 h-0.5 bg-accent rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            ))}
            <Link
              href="/contact"
              className="ml-4 bg-gradient-to-r from-accent to-accent-light hover:from-accent-light hover:to-accent text-primary-dark font-bold px-6 py-2.5 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:scale-[1.02] inline-flex items-center gap-2"
            >
              Offerte aanvragen <ChevronRight size={14} />
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="lg:hidden overflow-hidden border-t border-white/5"
            >
              <div className="bg-primary-dark/95 backdrop-blur-xl px-6 py-5 space-y-1">
                {NAV.map((n, i) => (
                  <motion.div
                    key={n.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between text-white/70 hover:text-white py-3 text-sm font-medium border-b border-white/5 last:border-0 transition-colors"
                    >
                      {n.label}
                      <ChevronRight size={14} className="text-white/20" />
                    </Link>
                  </motion.div>
                ))}
                <div className="pt-4 space-y-2">
                  <Link
                    href="/mijn-account"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 text-accent text-sm font-semibold py-2"
                  >
                    <User size={14} /> Mijn Account
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setOpen(false)}
                    className="block bg-gradient-to-r from-accent to-accent-light text-primary-dark font-bold px-5 py-3 rounded-xl text-sm text-center shadow-lg shadow-accent/20"
                  >
                    Offerte aanvragen
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
