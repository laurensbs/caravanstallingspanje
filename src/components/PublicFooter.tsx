'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Clock, Shield, Star } from 'lucide-react';

// Globale footer voor publieke pagina's. Navy gradient zodat 'm naadloos
// aansluit op de hero/body. Mobile-first: één kolom op klein, drie kolommen
// vanaf md.

const NAVY = '#0A1929';
const NAVY_TOP = '#142F4D';

const SERVICES = [
  { href: '/koelkast', label: 'Fridges & AC rental' },
  { href: '/diensten/airco', label: 'AC units' },
  { href: '/diensten/stalling', label: 'Storage (indoor/outdoor)' },
  { href: '/diensten/transport', label: 'Transport' },
  { href: '/diensten/service', label: 'Service & repair' },
  { href: '/diensten/inspectie', label: 'Inspection' },
];

const ABOUT = [
  { href: '/contact', label: 'Contact' },
  { href: '/ideeen', label: 'Ideas inbox' },
  { href: 'https://caravanstalling-spanje.com/over-ons', label: 'About us', external: true },
  { href: 'https://caravanstalling-spanje.com/nieuws', label: 'News', external: true },
  { href: 'https://caravanstalling-spanje.com/faq', label: 'FAQ', external: true },
  { href: 'https://caravanstalling-spanje.com/privacy', label: 'Privacy', external: true },
];

export default function PublicFooter() {
  return (
    <footer
      className="relative text-white"
      style={{
        background: `linear-gradient(180deg, ${NAVY_TOP} 0%, ${NAVY} 60%, #050D18 100%)`,
      }}
    >
      {/* Top wave / glow voor zachte overgang vanuit voorgaande sectie */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{
          background:
            'radial-gradient(60% 100% at 50% 0%, rgba(126,168,255,0.10) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-10">
        {/* Header: logo + tagline */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 mb-12 md:mb-14 items-start">
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/logo.png"
                alt="Caravanstalling Spanje"
                width={420}
                height={95}
                className="h-10 sm:h-12 w-auto"
                style={{ filter: 'drop-shadow(0 0 18px rgba(255,255,255,0.14))' }}
              />
            </Link>
            <p
              className="text-[14px] leading-relaxed max-w-md"
              style={{ color: 'rgba(241,245,249,0.65)' }}
            >
              Indoor &amp; outdoor caravan storage, repair, sales and rentals
              on the Costa Brava. Family-run, secured 24/7, fully insured.
            </p>
            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-[12px]">
              <span className="inline-flex items-center gap-1.5" style={{ color: 'rgba(241,245,249,0.55)' }}>
                <Star size={12} className="text-warning" /> 4.9 / 5 · 25 reviews
              </span>
              <span className="inline-flex items-center gap-1.5" style={{ color: 'rgba(241,245,249,0.55)' }}>
                <Shield size={12} /> Securitas Direct
              </span>
            </div>
          </div>
        </div>

        {/* Three-col link block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-14">
          {/* Contact */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] mb-4" style={{ color: 'rgba(241,245,249,0.45)' }}>
              Contact
            </h3>
            <ul className="space-y-3 text-[14px]">
              <li>
                <a
                  href="https://maps.google.com/?q=Ctra+de+Palamos+9,+17110+Sant+Climent+de+Peralta,+Girona,+Spain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-2 transition-colors"
                  style={{ color: 'rgba(241,245,249,0.85)' }}
                >
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  <span>
                    Ctra de Palamos 9<br />
                    17110 Sant Climent de Peralta<br />
                    Girona, Spain
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+34633778699"
                  className="inline-flex items-center gap-2 transition-colors hover:underline underline-offset-4"
                  style={{ color: 'rgba(241,245,249,0.85)' }}
                >
                  <Phone size={14} /> +34 633 77 86 99
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@caravanstalling-spanje.com"
                  className="inline-flex items-center gap-2 transition-colors hover:underline underline-offset-4"
                  style={{ color: 'rgba(241,245,249,0.85)' }}
                >
                  <Mail size={14} /> info@caravanstalling-spanje.com
                </a>
              </li>
              <li className="inline-flex items-start gap-2" style={{ color: 'rgba(241,245,249,0.65)' }}>
                <Clock size={14} className="mt-0.5 shrink-0" />
                <span>
                  Mon–Fri 09:30 – 16:30<br />
                  Sat &amp; Sun closed
                </span>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] mb-4" style={{ color: 'rgba(241,245,249,0.45)' }}>
              Services
            </h3>
            <ul className="space-y-2.5 text-[14px]">
              {SERVICES.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="transition-colors hover:underline underline-offset-4"
                    style={{ color: 'rgba(241,245,249,0.85)' }}
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] mb-4" style={{ color: 'rgba(241,245,249,0.45)' }}>
              Information
            </h3>
            <ul className="space-y-2.5 text-[14px]">
              {ABOUT.map((a) => (
                <li key={a.href}>
                  {a.external ? (
                    <a
                      href={a.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:underline underline-offset-4"
                      style={{ color: 'rgba(241,245,249,0.85)' }}
                    >
                      {a.label}
                    </a>
                  ) : (
                    <Link
                      href={a.href}
                      className="transition-colors hover:underline underline-offset-4"
                      style={{ color: 'rgba(241,245,249,0.85)' }}
                    >
                      {a.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 border-t flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-center justify-between text-[12px]"
          style={{ borderColor: 'rgba(241,245,249,0.08)', color: 'rgba(241,245,249,0.45)' }}
        >
          <p>© {new Date().getFullYear()} Caravan Storage Spain S.L. · All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/caravanstalling.spanje"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline underline-offset-4"
            >
              Facebook
            </a>
            <a
              href="https://www.google.com/maps/place/Caravanstalling+Spanje"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline underline-offset-4"
            >
              Google
            </a>
            <a
              href="https://www.linkedin.com/company/caravanstalling-spanje"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline underline-offset-4"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
