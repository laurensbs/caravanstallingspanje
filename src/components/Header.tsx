'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Phone, Mail } from 'lucide-react';

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

  return (
    <>
      {/* Top bar */}
      <div className="bg-primary-dark text-white/80 text-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="tel:+34972000000" className="flex items-center gap-1.5 hover:text-white"><Phone size={13} /> +34 972 00 00 00</a>
            <a href="mailto:info@caravanstalling-spanje.com" className="flex items-center gap-1.5 hover:text-white"><Mail size={13} /> info@caravanstalling-spanje.com</a>
          </div>
          <div className="flex items-center gap-4">
            <span>Ma-Vr 09:30 - 16:30</span>
            <Link href="/mijn-account" className="text-accent hover:text-accent-light font-medium">Mijn Account</Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <header className="bg-primary sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="text-white font-bold text-xl tracking-tight">
            CARAVANSTALLING<span className="text-accent"> SPANJE</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(n => (
              <Link key={n.href} href={n.href} className="text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                {n.label}
              </Link>
            ))}
            <Link href="/offerte" className="ml-3 bg-accent hover:bg-accent-light text-primary-dark font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
              Offerte aanvragen
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile nav */}
        {open && (
          <div className="md:hidden bg-primary-dark border-t border-white/10 px-6 py-4 space-y-1">
            {NAV.map(n => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block text-white/80 hover:text-white py-2.5 text-sm font-medium">
                {n.label}
              </Link>
            ))}
            <Link href="/mijn-account" onClick={() => setOpen(false)} className="block text-accent py-2.5 text-sm font-medium">Mijn Account</Link>
            <Link href="/offerte" onClick={() => setOpen(false)} className="block bg-accent text-primary-dark font-semibold px-4 py-2.5 rounded-lg text-sm text-center mt-3">
              Offerte aanvragen
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
