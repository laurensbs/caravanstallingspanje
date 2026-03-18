'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, Phone, Mail, Clock, Globe, Shield, Wrench, Truck, Sparkles, ShoppingBag, Bike, ThermometerSnowflake, Wind, ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, LOCALES } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import DarkModeToggle from './DarkModeToggle';

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
  const headerBg = scrolled || !isHome
    ? 'bg-white/95 backdrop-blur-xl border-b border-sand-dark/30 shadow-[0_1px_3px_rgba(139,134,128,0.08)]'
    : 'bg-transparent';
  const textColor = scrolled || !isHome ? 'text-surface-dark' : 'text-white';
  const mutedColor = scrolled || !isHome ? 'text-warm-gray' : 'text-white/60';

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/stalling', label: 'Stalling' },
    { href: '/diensten', label: 'Diensten', hasMega: true },
    { href: '/locaties', label: 'Locaties' },
    { href: '/tarieven', label: 'Tarieven' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  const currentFlag = LOCALES.find(l => l.code === locale)?.flag || '🇳🇱';

  return (
    <>
      {/* Top bar - desktop only */}
      <div className={`hidden lg:block transition-all duration-300 ${scrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-auto opacity-100'} ${isHome ? 'bg-surface-dark/40 backdrop-blur-sm' : 'bg-sand/50 border-b border-sand-dark/30'}`}>
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className={`flex items-center gap-6 text-xs ${isHome ? 'text-white/50' : 'text-warm-gray'}`}>
            <a href="tel:+34650036755" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Phone size={11} /> +34 650 036 755
            </a>
            <a href="mailto:info@caravanstalling-spanje.com" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Mail size={11} /> info@caravanstalling-spanje.com
            </a>
            <span className="flex items-center gap-1.5">
              <Clock size={11} /> Ma-Vr 09:30 - 16:30
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/mijn-account" className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isHome ? 'text-white/50 hover:text-white' : 'text-warm-gray hover:text-surface-dark'}`}>
              <User size={12} /> Mijn Account
            </Link>
            <div className="w-px h-3.5 bg-current opacity-15" />
            <div ref={langRef} className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className={`flex items-center gap-1.5 text-xs ${isHome ? 'text-white/50 hover:text-white' : 'text-warm-gray hover:text-surface-dark'} transition-colors`}>
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
                    className="absolute right-0 top-8 bg-white dark:bg-[#231e1a] rounded-xl shadow-xl border border-sand-dark/30 dark:border-white/10 py-1.5 min-w-[140px] z-50"
                  >
                    {LOCALES.map(l => (
                      <button key={l.code} onClick={() => { setLocale(l.code as Locale); setLangOpen(false); }} className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs hover:bg-sand dark:hover:bg-white/5 transition-colors ${locale === l.code ? 'text-primary font-semibold' : 'text-surface-dark'}`}>
                        <span className="text-base">{l.flag}</span> {l.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${headerBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 lg:h-[68px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${scrolled || !isHome ? 'bg-primary text-white' : 'bg-white/10 text-white border border-white/10'}`}>
                CS
              </div>
              <div className="hidden sm:block">
                <span className={`text-[13px] font-bold block leading-tight tracking-tight transition-colors ${textColor}`}>
                  Caravanstalling
                </span>
                <span className="text-primary text-[9px] font-bold tracking-[0.15em] uppercase">Spanje</span>
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
                    className={`relative px-3.5 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 flex items-center gap-1
                      ${pathname === item.href
                        ? `${scrolled || !isHome ? 'text-primary' : 'text-white'}`
                        : `${mutedColor} hover:${textColor}`
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
                          <div className="bg-white rounded-2xl shadow-2xl border border-sand-dark/20 p-5 w-[520px]">
                            <p className="text-[10px] font-bold text-warm-gray uppercase tracking-widest mb-3 px-1">Onze diensten</p>
                            <div className="grid grid-cols-2 gap-1">
                              {DIENSTEN_ITEMS.map(d => (
                                <Link
                                  key={d.label}
                                  href={d.href}
                                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-sand/50 transition-colors group"
                                >
                                  <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                                    <d.icon size={16} className="text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-[13px] font-semibold text-surface-dark leading-tight">{d.label}</p>
                                    <p className="text-[11px] text-warm-gray mt-0.5">{d.desc}</p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-sand-dark/20">
                              <Link href="/diensten" className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors py-1.5">
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

              <Link href="/stalling" className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-[13px] font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
                <span className="hidden sm:inline">Stalling aanvragen</span>
                <span className="sm:hidden">Stalling</span>
              </Link>

              {/* Mobile menu button */}
              <button onClick={() => setOpen(!open)} className={`lg:hidden p-2 rounded-lg transition-colors ${textColor}`} aria-label="Menu">
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu - unique items not in bottom nav */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-sand-dark/20 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {/* Only show items NOT in MobileNav bottom bar */}
                {navItems.filter(item => !['/','/ ','/stalling','/diensten','/blog','/contact','/mijn-account'].includes(item.href)).map(item => (
                  <div key={item.href}>
                    <Link href={item.href} className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname === item.href ? 'bg-primary/8 text-primary' : 'text-surface-dark hover:bg-sand/50'}`}>
                      {item.label}
                    </Link>
                  </div>
                ))}
                {/* Diensten sub-items */}
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-warm-gray/50">Onze diensten</p>
                  <div className="space-y-0.5">
                    {DIENSTEN_ITEMS.map(d => (
                      <Link key={d.label} href={d.href} className="flex items-center gap-2.5 px-4 py-2 text-xs text-warm-gray hover:text-surface-dark transition-colors">
                        <d.icon size={13} className="text-primary/50" /> {d.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t border-sand-dark/20 space-y-2">
                  <Link href="/mijn-account" className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-surface-dark hover:bg-sand/50 rounded-xl">
                    <User size={15} /> Mijn Account
                  </Link>
                  <Link href="/stalling" className="block text-center bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                    Stalling aanvragen
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
