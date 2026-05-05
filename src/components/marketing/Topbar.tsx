'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import LocaleSwitch from '../LocaleSwitch';
import { useLocale } from '../LocaleProvider';

// Smalle navy-deep info-strip boven de hoofd-nav (mockup p01-21).
// Links: live-status pulse + adres. Rechts: tel, mail, taalswitch, login.
// Op mobiel klappen e-mail + adres weg (.hide-mobile uit globals.css).

export default function Topbar() {
  const { t } = useLocale();
  return (
    <div className="brand-topbar">
      <div className="tb-left">
        <span className="live">
          <span className="pulse" aria-hidden />
          {t('topbar.live')}
        </span>
        <span className="pipe hide-mobile" aria-hidden />
        <span className="hide-mobile" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={12} aria-hidden /> {t('topbar.address')}
        </span>
      </div>
      <div className="tb-right">
        <a href="tel:+34633778699">
          <Phone size={12} aria-hidden /> +34 633 77 86 99
        </a>
        <a href="mailto:info@caravanstalling-spanje.com" className="hide-mobile">
          <Mail size={12} aria-hidden /> info@caravanstalling-spanje.com
        </a>
        <span className="lang hide-mobile">
          <LocaleSwitch variant="dark" />
        </span>
        <Link href="/account/login" className="tb-login">
          {t('nav.login')}
        </Link>
      </div>
    </div>
  );
}
