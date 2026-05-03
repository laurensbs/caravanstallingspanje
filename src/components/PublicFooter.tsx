'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Clock, Shield, Star } from 'lucide-react';
import { useLocale } from './LocaleProvider';
import type { StringKey } from '@/lib/i18n';

// Globale footer voor publieke pagina's. Navy gradient zodat 'm naadloos
// aansluit op de hero/body. Mobile-first: één kolom op klein, drie kolommen
// vanaf md.

const NAVY = '#0A1929';
const NAVY_TOP = '#142F4D';

type ServiceLink = { href: string; label: StringKey };
type InfoLink = { href: string; label: StringKey; external?: boolean };

const SERVICES: ServiceLink[] = [
  { href: '/koelkast', label: 'footer.svc-fridge' },
  { href: '/diensten/airco', label: 'footer.svc-airco' },
  { href: '/diensten/stalling', label: 'footer.svc-storage' },
  { href: '/diensten/transport', label: 'footer.svc-transport' },
  { href: '/diensten/service', label: 'footer.svc-service' },
  { href: '/diensten/inspectie', label: 'footer.svc-inspection' },
];

const ABOUT: InfoLink[] = [
  { href: '/contact', label: 'footer.info-contact' },
  { href: '/ideeen', label: 'footer.info-ideas' },
  { href: 'https://caravanstalling-spanje.com/over-ons', label: 'footer.info-about', external: true },
  { href: 'https://caravanstalling-spanje.com/nieuws', label: 'footer.info-news', external: true },
  { href: 'https://caravanstalling-spanje.com/faq', label: 'footer.info-faq', external: true },
  { href: '/privacy', label: 'footer.info-privacy' },
  { href: '/cookies', label: 'footer.info-cookies' },
  { href: '/verwerkers', label: 'footer.info-processors' },
];

export default function PublicFooter() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

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
              {t('footer.tagline')}
            </p>
            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-[12px]">
              <span className="inline-flex items-center gap-1.5" style={{ color: 'rgba(241,245,249,0.55)' }}>
                <Star size={12} className="text-warning" /> {t('footer.reviews')}
              </span>
              <span className="inline-flex items-center gap-1.5" style={{ color: 'rgba(241,245,249,0.55)' }}>
                <Shield size={12} /> {t('footer.security')}
              </span>
            </div>
          </div>
        </div>

        {/* Three-col link block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-14">
          {/* Contact */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] mb-4" style={{ color: 'rgba(241,245,249,0.45)' }}>
              {t('footer.heading-contact')}
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
                  {t('footer.hours')}<br />
                  {t('footer.hours-closed')}
                </span>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] mb-4" style={{ color: 'rgba(241,245,249,0.45)' }}>
              {t('footer.heading-services')}
            </h3>
            <ul className="space-y-2.5 text-[14px]">
              {SERVICES.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="transition-colors hover:underline underline-offset-4"
                    style={{ color: 'rgba(241,245,249,0.85)' }}
                  >
                    {t(s.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] mb-4" style={{ color: 'rgba(241,245,249,0.45)' }}>
              {t('footer.heading-info')}
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
                      {t(a.label)}
                    </a>
                  ) : (
                    <Link
                      href={a.href}
                      className="transition-colors hover:underline underline-offset-4"
                      style={{ color: 'rgba(241,245,249,0.85)' }}
                    >
                      {t(a.label)}
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
          <p>{t('footer.copyright', year)}</p>
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
