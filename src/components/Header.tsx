'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, Phone, Mail, Clock, Globe, Shield, Wrench, Truck, Sparkles, ShoppingBag, Bike, ThermometerSnowflake, Wind, ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, LOCALES } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import QuizModal from '@/components/QuizModal';


const DIENSTEN_ITEMS = [
  { icon: Shield, label: 'Buiten- & Binnenstalling', desc: 'Beveiligd terrein, Securitas Direct', href: '/stalling' },
  { icon: Wrench, label: 'Reparatie & Onderhoud', desc: 'Complete werkplaats, alle merken', href: '/diensten' },
  { icon: Sparkles, label: 'CaravanRepair®', desc: 'Masterdealer schadeherstel', href: '/diensten' },
  { icon: Truck, label: 'Transport', desc: '7 eenheden, heel Costa Brava', href: '/diensten' },
  { icon: ShoppingBag, label: 'Verkoop', desc: 'Tweedehands caravans', href: '/diensten' },
  { icon: Bike, label: 'Verhuur', desc: 'Fietsen, koelkasten & airco', href: '/diensten' },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { locale, setLocale } = useLocale();
  const megaRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const megaTimeout = useRef<NodeJS.Timeout>(null);
  const [quizOpen, setQuizOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isHome = pathname === '/';
  const headerBg = scrolled
    ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
    : isHome
      ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200/60'
      : 'bg-white/95 backdrop-blur-xl border-b border-gray-200/60';
  const textColor = 'text-gray-900';
  const mutedColor = 'text-gray-500';

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/stalling', label: 'Stalling' },
    { href: '/diensten', label: 'Diensten', hasMega: true },
    { href: '/locaties', label: 'Locaties' },
    { href: '/tarieven', label: 'Tarieven' },
    { href: '/blog', label: 'Costa Brava Gids' },
    { href: '/contact', label: 'Contact' },
  ];

  const currentFlag = LOCALES.find(l => l.code === locale)?.flag || '🇳🇱';

  return (
    <>
      {/* Top bar - desktop only */}
      <div className={`hidden lg:block transition-all duration-300 ${scrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-auto opacity-100'} bg-hero`}>
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6 text-xs text-white/80">
            <a href="tel:+34650036755" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={11} /> +34 650 036 755
            </a>
            <a href="mailto:info@caravanstalling-spanje.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail size={11} /> info@caravanstalling-spanje.com
            </a>
            <span className="flex items-center gap-1.5">
              <Clock size={11} /> Ma-Vr 09:30 - 16:30
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/mijn-account" className="flex items-center gap-1.5 text-xs font-medium transition-colors text-white/80 hover:text-white">
              <User size={12} /> Mijn Account
            </Link>
            <div className="w-px h-3.5 bg-white/15" />
            <div ref={langRef} className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white transition-colors">
                <Globe size={12} />
                <span>{currentFlag}</span>
                <ChevronDown size={10} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-8 bg-card rounded-xl shadow-xl border border-gray-200 py-1.5 min-w-[140px] z-50"
                  >
                    {LOCALES.map(l => (
                      <button key={l.code} onClick={() => { setLocale(l.code as Locale); setLangOpen(false); }} className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs hover:bg-gray-100 transition-colors ${locale === l.code ? 'text-primary font-semibold' : 'text-gray-900'}`}>
                        <span className="text-base">{l.flag}</span> {l.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>

      {/* Main header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${headerBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 lg:h-[68px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs bg-primary text-white transition-colors">
                CS
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-bold block leading-tight tracking-tight text-gray-900">
                  Caravanstalling
                </span>
                <span className="text-primary text-[9px] font-semibold tracking-[0.15em] uppercase">Spanje</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(item => (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => { if (item.hasMega) { if (megaTimeout.current) clearTimeout(megaTimeout.current); setMegaOpen(true); } }}
                  onMouseLeave={() => { if (item.hasMega) { megaTimeout.current = setTimeout(() => setMegaOpen(false), 200); } }}
                >
                  <Link
                    href={item.href}
                    className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1
                      ${pathname === item.href
                        ? 'text-primary'
                        : 'text-gray-500 hover:text-gray-900'
                      }
                    `}
                  >
                    {item.label}
                    {item.hasMega && <ChevronDown size={11} className={`transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`} />}
                    {pathname === item.href && (
                      <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-primary rounded-full" />
                    )}
                  </Link>

                  {/* Mega menu */}
                  {item.hasMega && (
                    <AnimatePresence>
                      {megaOpen && (
                        <motion.div
                          ref={megaRef}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-3"
                          onMouseEnter={() => { if (megaTimeout.current) clearTimeout(megaTimeout.current); setMegaOpen(true); }}
                          onMouseLeave={() => { megaTimeout.current = setTimeout(() => setMegaOpen(false), 200); }}
                        >
                          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 p-5 w-[520px]">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">Onze diensten</p>
                            <div className="grid grid-cols-2 gap-1">
                              {DIENSTEN_ITEMS.map(d => (
                                <Link
                                  key={d.label}
                                  href={d.href}
                                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                                >
                                  <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/12 transition-colors">
                                    <d.icon size={16} className="text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900 leading-tight">{d.label}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{d.desc}</p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <Link href="/diensten" className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-light transition-colors py-1.5">
                                Alle diensten bekijken <ArrowRight size={12} />
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile lang */}
              <button onClick={() => setLangOpen(!langOpen)} className={`lg:hidden p-2 rounded-lg transition-colors ${mutedColor}`}>
                <span className="text-sm">{currentFlag}</span>
              </button>

              <button onClick={() => { setQuizOpen(true); setOpen(false); }} className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-light text-white text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer">
                <span className="hidden sm:inline">Stalling aanvragen</span>
                <span className="sm:hidden">Stalling</span>
              </button>

              {/* Mobile menu button */}
              <button onClick={() => setOpen(!open)} className={`lg:hidden p-2 rounded-lg transition-colors ${textColor}`} aria-label="Menu">
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

      </header>

      {/* Mobile menu - outside header to avoid backdrop-filter containing block issue */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 top-16 bg-white z-[45] overflow-y-auto pb-24"
          >
            <div className="px-4 py-6 max-w-lg mx-auto">
              {/* Main navigation */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {navItems.filter(item => !item.hasMega).map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                      pathname === item.href
                        ? 'bg-primary/8 text-primary border border-primary/15'
                        : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Diensten as large tiles */}
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Onze diensten</p>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {DIENSTEN_ITEMS.map(d => (
                  <Link
                    key={d.label}
                    href={d.href}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-primary/10 transition-all text-center"
                  >
                    <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center">
                      <d.icon size={18} className="text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 leading-tight">{d.label.split(' ')[0]}</span>
                  </Link>
                ))}
              </div>

              {/* Quick actions */}
              <div className="space-y-2">
                <button onClick={() => { setQuizOpen(true); setOpen(false); }} className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                  <ArrowRight size={15} /> Stalling aanvragen
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <a href="tel:+34650036755" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-sm font-semibold transition-colors">
                    <Phone size={14} /> Bellen
                  </a>
                  <a href="https://wa.me/34650036755" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white text-sm font-semibold transition-colors">
                    <Mail size={14} /> WhatsApp
                  </a>
                </div>
                <Link href="/mijn-account" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors">
                  <User size={15} /> Mijn Account
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} source="header" />
    </>
  );
}
