'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ShieldCheck, Wrench, Sparkles, ClipboardCheck, Truck,
  Snowflake, Tag, Recycle, ArrowRight,
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
  { href: '/verkoop',  labelKey: 'nav.sales' },
  { href: '/tarieven', labelKey: 'nav.pricing' },
  { href: '/over-ons', labelKey: 'nav.about' },
  { href: '/faq',      labelKey: 'nav.faq' },
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
  const dienstenActive = !!pathname?.startsWith('/diensten') || pathname === '/koelkast';

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
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu-open')}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="brand-mobile-panel"
            style={{
              background: '#fff',
              borderBottom: '1px solid var(--line)',
              padding: '14px 18px',
            }}
          >
            <nav aria-label="Mobiel navigatie-menu">
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[...NAV_LEFT, { href: '/diensten', labelKey: 'nav.services' as StringKey }, ...NAV_RIGHT].map((link) => {
                  const active = isActive(link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        style={{
                          display: 'block',
                          padding: '12px 10px',
                          borderRadius: 8,
                          fontFamily: 'var(--inter)',
                          fontWeight: active ? 600 : 500,
                          color: active ? 'var(--navy)' : 'var(--ink-2)',
                          background: active ? 'rgba(149,216,253,0.18)' : 'transparent',
                          textDecoration: 'none',
                          fontSize: 15,
                        }}
                      >
                        {t(link.labelKey)}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <Link
                    href="/account/login"
                    style={{
                      display: 'block',
                      padding: '12px 10px',
                      borderRadius: 8,
                      fontFamily: 'var(--inter)',
                      fontWeight: 500,
                      color: 'var(--ink-2)',
                      textDecoration: 'none',
                      fontSize: 15,
                    }}
                  >
                    {t('nav.login')}
                  </Link>
                </li>
              </ul>
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <LocaleSwitch />
                <Link href="/reserveren/configurator" className="btn btn-primary">
                  {t('nav.cta-pickup')}
                </Link>
              </div>
            </nav>
          </motion.div>
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
