'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import LocaleSwitch from './LocaleSwitch';
import { useLocale } from './LocaleProvider';
import { useFocusTrap } from '@/lib/focusTrap';
import type { StringKey } from '@/lib/i18n';

// Hoofd-nav uit mockup (p01-21): wit, logo links, links midden, orange CTA
// rechts. De variant-prop blijft accepted voor backwards-compat met oude
// callers, maar wordt nu visueel genegeerd — er is één unified mockup-look.

type NavLink = { href: string; labelKey: StringKey };

const NAV_LINKS: NavLink[] = [
  { href: '/diensten/stalling', labelKey: 'nav.storage' },
  { href: '/diensten',          labelKey: 'nav.services' },
  { href: '/verkoop',           labelKey: 'nav.sales' },
  { href: '/tarieven',          labelKey: 'nav.pricing' },
  { href: '/over-ons',          labelKey: 'nav.about' },
  { href: '/faq',               labelKey: 'nav.faq' },
  { href: '/contact',           labelKey: 'nav.contact' },
];

interface PublicHeaderProps {
  variant?: 'marketing-cream' | 'over-dark' | 'light';
}

export default function PublicHeader({}: PublicHeaderProps = {}) {
  const { t } = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

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

  useFocusTrap(menuRef, { active: menuOpen });

  return (
    <>
      <div className="brand-nav">
        <Link href="/" aria-label={t('common.brand')} className="nav-brand">
          <Image
            src="/images/logo.png"
            alt="Caravanstalling Spanje"
            width={420}
            height={95}
            priority
            style={{ height: 40, width: 'auto' }}
          />
        </Link>

        <nav aria-label="Hoofd-navigatie" className="nav-links">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== '/' && !!pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={active ? 'active' : undefined}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
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
                {NAV_LINKS.map((link) => {
                  const active = pathname === link.href || (link.href !== '/' && !!pathname?.startsWith(link.href));
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
    </>
  );
}
