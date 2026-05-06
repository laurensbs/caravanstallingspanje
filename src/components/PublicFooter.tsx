'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from './LocaleProvider';
import type { StringKey } from '@/lib/i18n';

// Footer uit mockup (p01-21): navy-deep, 4-koloms grid (brand+adres /
// Diensten / Werkplaats / Bedrijf), copyright-strip onder.

type FooterLink = { href: string; label: StringKey; external?: boolean };

const SERVICES: FooterLink[] = [
  { href: '/diensten/stalling', label: 'footer.svc-storage' },
  { href: '/caravan-huren', label: 'footer.svc-rent' },
  { href: '/koelkast', label: 'footer.svc-fridge' },
  { href: '/diensten/airco', label: 'footer.svc-airco' },
  { href: '/diensten/transport', label: 'footer.svc-transport' },
  { href: '/diensten/inspectie', label: 'footer.svc-inspection' },
];

const WORKSHOP: FooterLink[] = [
  { href: '/diensten/service', label: 'footer.svc-service' },
  { href: '/diensten/reparatie', label: 'footer.heading-workshop-repair' },
];

const COMPANY: FooterLink[] = [
  { href: '/over-ons', label: 'footer.info-about' },
  { href: '/contact', label: 'footer.info-contact' },
  { href: '/faq', label: 'footer.info-faq' },
  { href: '/privacy', label: 'footer.info-privacy' },
  { href: '/cookies', label: 'footer.info-cookies' },
  { href: '/verwerkers', label: 'footer.info-processors' },
];

export default function PublicFooter() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="brand-footer">
      <div className="footer-grid">
        <div className="brand-blk">
          <Link href="/" className="inline-block" style={{ marginBottom: 14 }}>
            <Image
              src="/images/logo.png"
              alt="Caravanstalling Spanje"
              width={420}
              height={95}
              style={{ height: 36, width: 'auto', filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.10))' }}
            />
          </Link>
          <p>{t('footer.tagline')}</p>
          <p style={{ marginTop: 4 }}>
            Ctra. de Palamós 9<br />
            17110 Sant Climent de Peralta<br />
            Girona, Spain
          </p>
        </div>

        <div>
          <h4>{t('footer.heading-services')}</h4>
          <ul>
            {SERVICES.map((s) => (
              <li key={s.href}><Link href={s.href}>{t(s.label)}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4>{t('footer.heading-workshop')}</h4>
          <ul>
            {WORKSHOP.map((s) => (
              <li key={s.href}><Link href={s.href}>{t(s.label)}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4>{t('footer.heading-company')}</h4>
          <ul>
            {COMPANY.map((s) => (
              <li key={s.href}><Link href={s.href}>{t(s.label)}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>{t('footer.copyright', year)}</span>
        <span style={{ display: 'inline-flex', gap: 18 }}>
          <a href="https://www.facebook.com/caravanstalling.spanje" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://www.google.com/maps/place/Caravanstalling+Spanje" target="_blank" rel="noopener noreferrer">Google</a>
          <a href="https://www.linkedin.com/company/caravanstalling-spanje" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </span>
      </div>
    </footer>
  );
}
