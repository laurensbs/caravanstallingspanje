'use client';

import Link from 'next/link';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import LocaleSwitch from '../LocaleSwitch';
import { useLocale } from '../LocaleProvider';

// Smalle navy-deep info-strip boven de hoofd-nav (mockup p01-21).
// Mobiel-eerst: alleen live-pulse + WhatsApp + telefoon. Op desktop ook
// e-mail + taalswitch + login.

const WHATSAPP_HREF =
  'https://wa.me/34633778699?text=' +
  encodeURIComponent('Hallo, ik heb een vraag over caravanstalling.');

export default function Topbar() {
  const { t } = useLocale();
  return (
    <div className="brand-topbar">
      <div className="tb-left">
        <span className="live">
          <span className="pulse" aria-hidden />
          <span className="live-full">{t('topbar.live')}</span>
          <span className="live-short" aria-hidden>4 plekken vrij</span>
        </span>
      </div>
      <div className="tb-right">
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="tb-whatsapp"
          aria-label="WhatsApp"
        >
          <MessageCircle size={12} aria-hidden /> <span className="tb-whatsapp-label">WhatsApp</span>
        </a>
        <a href="tel:+34633778699" aria-label="Bel ons">
          <Phone size={12} aria-hidden /> <span className="tb-phone-label">+34 633 77 86 99</span>
        </a>
        <a href="mailto:info@caravanstalling-spanje.com" className="hide-mobile">
          <Mail size={12} aria-hidden /> info@caravanstalling-spanje.com
        </a>
        <span className="lang hide-mobile">
          <LocaleSwitch variant="dark" />
        </span>
        <Link href="/account/login" className="tb-login hide-mobile">
          {t('nav.login')}
        </Link>
      </div>
    </div>
  );
}
