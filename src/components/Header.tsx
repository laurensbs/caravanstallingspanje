'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail, Clock, User, ChevronRight, ChevronDown, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useT, useLocale, LOCALES } from '@/lib/i18n';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const t = useT();
  const { locale, setLocale } = useLocale();
  const currentLang = LOCALES.find(l => l.code === locale)!;

  const NAV = [
    { href: '/', label: t('nav.home') },
    { href: '/stalling', label: t('nav.storage') },
    { href: '/diensten', label: t('nav.services') },
    { href: '/locaties', label: t('nav.locations') },
    { href: '/tarieven', label: t('nav.rates') },
    { href: '/contact', label: t('nav.contact') },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!langOpen) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.lang-dropdown')) setLangOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [langOpen]);

  return (
    <>
      {/* Top bar */}
      <div className="bg-primary-dark text-white/60 text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-9">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Phone size={11} /> +34 972 00 00 00</span>
            <span className="flex items-center gap-1.5"><Mail size={11} /> info@caravanstalling-spanje.com</span>
            <span className="flex items-center gap-1.5"><Clock size={11} /> Ma-Vr 09:30-16:30</span>
          </div>
          <div className="relative lang-dropdown">
            <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Globe size={12} />
              <span>{currentLang.flag} {currentLang.code.toUpperCase()}</span>
              <ChevronDown size={10} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 min-w-[140px]">
                {LOCALES.map(l => (
                  <button key={l.code} onClick={() => { setLocale(l.code); setLangOpen(false); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${locale === l.code ? 'text-accent font-semibold' : 'text-gray-600'}`}>
                    <span>{l.flag}</span> {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-accent to-accent-light rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-accent/20">CS</div>
            <div className="hidden sm:block">
              <span className="font-black text-primary-dark text-sm block leading-tight">Caravanstalling</span>
              <span className="text-[10px] text-muted font-medium">Costa Brava, Spanje</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map(n => (
              <Link key={n.href} href={n.href} className="px-3.5 py-2 text-sm font-medium text-muted hover:text-primary-dark transition-colors rounded-lg hover:bg-gray-50">
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/mijn-account" className="hidden sm:flex items-center gap-1.5 text-sm text-muted hover:text-primary-dark transition-colors">
              <User size={16} /> {t('nav.myaccount')}
            </Link>
            <Link href="/stalling" className="hidden md:inline-flex bg-gradient-to-r from-accent to-accent-light hover:from-accent-dark hover:to-accent text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-accent/20 items-center gap-1.5">
              {t('nav.book')} <ChevronRight size={14} />
            </Link>

            {/* Mobile lang button */}
            <div className="relative lg:hidden lang-dropdown">
              <button onClick={() => setLangOpen(!langOpen)} className="text-muted hover:text-primary-dark p-2 transition-colors">
                <Globe size={18} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 min-w-[140px]">
                  {LOCALES.map(l => (
                    <button key={l.code} onClick={() => { setLocale(l.code); setLangOpen(false); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${locale === l.code ? 'text-accent font-semibold' : 'text-gray-600'}`}>
                      <span>{l.flag}</span> {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button className="lg:hidden text-primary-dark p-2" onClick={() => setOpen(!open)}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="lg:hidden overflow-hidden border-t border-gray-100 bg-white">
              <div className="px-4 py-4 space-y-1">
                {NAV.map(n => (
                  <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block px-4 py-3 text-sm font-medium text-muted hover:text-primary-dark hover:bg-gray-50 rounded-xl transition-colors">
                    {n.label}
                  </Link>
                ))}
                <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
                  <Link href="/mijn-account" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-muted hover:text-primary-dark hover:bg-gray-50 rounded-xl transition-colors">
                    <User size={16} /> {t('nav.myaccount')}
                  </Link>
                  <Link href="/stalling" onClick={() => setOpen(false)} className="block bg-gradient-to-r from-accent to-accent-light text-white font-bold px-4 py-3 rounded-xl text-sm text-center">
                    {t('nav.book')}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
