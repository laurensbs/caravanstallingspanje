'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ShieldCheck, Wrench, Sparkles, ClipboardCheck, Truck,
  Snowflake, Tag, Recycle, ArrowRight, Phone, Mail, MapPin, Heart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import LocaleSwitch from './LocaleSwitch';
import { useLocale } from './LocaleProvider';
import { useFocusTrap } from '@/lib/focusTrap';
import type { StringKey } from '@/lib/i18n';

// Hoofd-nav uit mockup (p01-21): navy-deep canvas, logo links, links midden,
// orange CTA rechts, mobiele burger. Versmelt visueel met de Topbar erboven.
// Diensten heeft een desktop megamenu (3 koloms + featured-card).

type NavLink = { href: string; labelKey: StringKey };

const NAV_LEFT: NavLink[] = [
  { href: '/diensten/stalling', labelKey: 'nav.storage' },
];

const NAV_RIGHT: NavLink[] = [
  { href: '/aangesloten-campings', labelKey: 'nav.campings' },
  { href: '/verkoop',  labelKey: 'nav.sales' },
  { href: '/tarieven', labelKey: 'nav.pricing' },
  { href: '/over-ons', labelKey: 'nav.about' },
  { href: '/contact',  labelKey: 'nav.contact' },
];

type MegaItem = { href: string; icon: LucideIcon; titleKey: StringKey; subKey: StringKey };

const MEGA_STORAGE: MegaItem[] = [
  { href: '/diensten/stalling', icon: ShieldCheck, titleKey: 'home1.svc-1-title', subKey: 'home1.svc-1-desc' },
  { href: '/diensten/transport', icon: Truck, titleKey: 'home1.svc-5-title', subKey: 'home1.svc-5-desc' },
];

const MEGA_WORKSHOP: MegaItem[] = [
  { href: '/diensten/reparatie', icon: Wrench, titleKey: 'home1.svc-2-title', subKey: 'home1.svc-2-desc' },
  { href: '/diensten/service', icon: Sparkles, titleKey: 'home1.svc-3-title', subKey: 'home1.svc-3-desc' },
  { href: '/diensten/inspectie', icon: ClipboardCheck, titleKey: 'home1.svc-4-title', subKey: 'home1.svc-4-desc' },
];

const MEGA_RENTAL: MegaItem[] = [
  { href: '/caravan-huren', icon: Heart, titleKey: 'nav.rent', subKey: 'nav.rent-sub' },
  { href: '/koelkast', icon: Snowflake, titleKey: 'home1.svc-6-title', subKey: 'home1.svc-6-desc' },
  { href: '/verkoop', icon: Tag, titleKey: 'home1.svc-7-title', subKey: 'home1.svc-7-desc' },
  { href: '/verkoop#inkoop', icon: Recycle, titleKey: 'home1.svc-8-title', subKey: 'home1.svc-8-desc' },
];

interface PublicHeaderProps {
  variant?: 'marketing-cream' | 'over-dark' | 'light';
}

export default function PublicHeader({}: PublicHeaderProps = {}) {
  const { t } = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const megaRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMenuOpen(false); setMegaOpen(false); }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMegaOpen(false); };
    const onClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [megaOpen]);

  useFocusTrap(menuRef, { active: menuOpen });

  const isActive = (href: string) => pathname === href || (href !== '/' && !!pathname?.startsWith(href));
  // "Diensten"-button is actief op /diensten/* en /koelkast — maar NIET op
  // /diensten/stalling want dat is een eigen top-level nav-link.
  const dienstenActive =
    (!!pathname?.startsWith('/diensten') && !pathname?.startsWith('/diensten/stalling')) ||
    pathname === '/koelkast';

  return (
    <div className="brand-nav-wrap" ref={megaRef}>
      <div className="brand-nav">
        <Link href="/" aria-label={t('common.brand')} className="nav-brand">
          <Image
            src="/images/logo.png"
            alt="Caravanstalling Spanje"
            width={420}
            height={95}
            priority
            style={{ height: 36, width: 'auto', filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.10))' }}
          />
        </Link>

        <nav aria-label="Hoofd-navigatie" className="nav-links">
          {NAV_LEFT.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={isActive(link.href) ? 'active' : undefined}
            >
              {t(link.labelKey)}
            </Link>
          ))}

          <button
            type="button"
            className={`has-sub ${megaOpen ? 'open' : ''} ${dienstenActive ? 'active' : ''}`}
            onClick={() => setMegaOpen((v) => !v)}
            aria-expanded={megaOpen}
            aria-haspopup="true"
          >
            {t('nav.services')}
          </button>

          {NAV_RIGHT.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={isActive(link.href) ? 'active' : undefined}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        <Link href="/reserveren/configurator" className="nav-cta">
          {t('nav.cta-pickup')}
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? t('nav.menu-close') : t('nav.menu-open')}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="m-burger brand-nav-mobile"
        >
          {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
        </button>
      </div>

      {/* Desktop megamenu */}
      <div className={`megamenu-wrap ${megaOpen ? 'open' : ''}`} aria-hidden={!megaOpen}>
        <div className="megamenu-inner">
          <MegaCol title="Stalling & transport" items={MEGA_STORAGE} t={t} />
          <MegaCol title="Werkplaats" items={MEGA_WORKSHOP} t={t} />
          <MegaCol title="Verhuur & verkoop" items={MEGA_RENTAL} t={t} />

          <Link href="/diensten" className="megamenu-feature" style={{ textDecoration: 'none' }}>
            <span className="eb">Bekijk alles</span>
            <h3>Alle diensten op één pagina</h3>
            <p>Schoonmaak, onderhoud, transport, reparatie, inspectie, verhuur en meer — onder één dak.</p>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--navy)', fontFamily: 'var(--sora)', fontWeight: 700, fontSize: 13 }}>
              Naar diensten <ArrowRight size={14} aria-hidden />
            </span>
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              aria-hidden
              className="mobile-menu-backdrop"
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              id="mobile-menu"
              ref={menuRef}
              role="dialog"
              aria-modal="true"
              aria-label={t('nav.menu-open')}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="mobile-menu-drawer"
            >
              {/* Drawer header */}
              <div className="mobile-menu-head">
                <Image
                  src="/images/logo.png"
                  alt="Caravanstalling Spanje"
                  width={420}
                  height={95}
                  style={{ height: 28, width: 'auto', filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.10))' }}
                />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label={t('nav.menu-close')}
                  className="mobile-menu-close"
                >
                  <X size={20} aria-hidden />
                </button>
              </div>

              {/* CTA boven — primair */}
              <div className="mobile-menu-cta">
                <Link href="/reserveren/configurator" className="btn btn-primary btn-block">
                  {t('nav.cta-pickup')} <ArrowRight size={15} aria-hidden />
                </Link>
              </div>

              <nav aria-label="Mobiel navigatie-menu" className="mobile-menu-nav">
                {/* Hoofdnavigatie */}
                <div className="mobile-menu-section">
                  <span className="mobile-menu-eyebrow">Pagina&apos;s</span>
                  <ul>
                    {[...NAV_LEFT, { href: '/diensten', labelKey: 'nav.services' as StringKey }, ...NAV_RIGHT].map((link) => {
                      const active = isActive(link.href);
                      return (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className={active ? 'mobile-menu-link active' : 'mobile-menu-link'}
                          >
                            {t(link.labelKey)}
                            <ArrowRight size={14} aria-hidden className="arrow" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Diensten quick-grid */}
                <div className="mobile-menu-section">
                  <span className="mobile-menu-eyebrow">Snel naar</span>
                  <div className="mobile-menu-grid">
                    {[...MEGA_STORAGE, ...MEGA_WORKSHOP, ...MEGA_RENTAL].slice(0, 6).map(({ icon: Icon, href, titleKey }) => (
                      <Link key={href} href={href} className="mobile-menu-tile">
                        <span className="ic"><Icon size={16} aria-hidden /></span>
                        <span className="ttl">{t(titleKey)}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Account + locale */}
                <div className="mobile-menu-section">
                  <span className="mobile-menu-eyebrow">Account</span>
                  <ul>
                    <li>
                      <Link href="/account/login" className="mobile-menu-link">
                        {t('nav.login')}
                        <ArrowRight size={14} aria-hidden className="arrow" />
                      </Link>
                    </li>
                  </ul>
                </div>
              </nav>

              {/* Footer-strook met contact + taal */}
              <div className="mobile-menu-foot">
                <div className="mobile-menu-contact">
                  <a href="tel:+34633778699" className="mobile-menu-contact-item">
                    <Phone size={14} aria-hidden /> +34 633 77 86 99
                  </a>
                  <a href="mailto:info@caravanstalling-spanje.com" className="mobile-menu-contact-item">
                    <Mail size={14} aria-hidden /> info@caravanstalling-spanje.com
                  </a>
                </div>
                <div className="mobile-menu-locale">
                  <LocaleSwitch variant="dark" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MegaCol({ title, items, t }: { title: string; items: MegaItem[]; t: (k: StringKey) => string }) {
  return (
    <div className="megamenu-col">
      <h4>{title}</h4>
      <ul>
        {items.map(({ icon: Icon, href, titleKey, subKey }) => (
          <li key={href}>
            <Link href={href}>
              <span className="ic"><Icon size={15} aria-hidden /></span>
              <span className="info">
                <span className="ttl">{t(titleKey)}</span>
                <span className="sub">{t(subKey)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
