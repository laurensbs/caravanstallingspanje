'use client';

import { MapPin, Phone, Mail } from 'lucide-react';
import LocaleSwitch from '../LocaleSwitch';

// Smalle informatie-strip boven de hoofd-nav. Adres + tel + mail + taal-
// switcher. Donkere navy. Mobiel: alleen tel + mail (adres weg om
// horizontale ruimte te besparen).

export default function Topbar() {
  return (
    <div
      className="hidden sm:block text-[12px]"
      style={{
        background: 'var(--color-navy-deep)',
        color: 'rgba(255,255,255,0.85)',
      }}
    >
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-2 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-5 flex-wrap">
          <span className="hidden md:inline-flex items-center gap-1.5">
            <MapPin size={12} aria-hidden /> Ctra. de Palamós 9, Sant Climent de Peralta
          </span>
          <a
            href="tel:+34633778699"
            className="inline-flex items-center gap-1.5 hover:underline underline-offset-4"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            <Phone size={12} aria-hidden /> +34 633 77 86 99
          </a>
          <a
            href="mailto:info@caravanstalling-spanje.com"
            className="inline-flex items-center gap-1.5 hover:underline underline-offset-4"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            <Mail size={12} aria-hidden /> info@caravanstalling-spanje.com
          </a>
        </div>
        <div className="hidden md:block">
          <LocaleSwitch variant="dark" />
        </div>
      </div>
    </div>
  );
}
