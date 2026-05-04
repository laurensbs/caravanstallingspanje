'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import LocaleSwitch from './LocaleSwitch';
import { useLocale } from './LocaleProvider';
import { useFocusTrap } from '@/lib/focusTrap';
import type { StringKey } from '@/lib/i18n';

// Sticky publieke header met drie varianten:
//   - 'marketing-cream' (default voor /): cream blur-backdrop, ink kleuren,
//     terracotta primary CTA — premium-marketing look.
//   - 'over-dark': transparant op donkere hero, schakelt naar wit-blur na
//     scroll (legacy gebruik op andere pages).
//   - 'light': wit-blur direct vanaf load (voor diensten-detail-pagina's).

type NavLink = { href: string; labelKey: StringKey };

const NAV_LINKS: NavLink[] = [
  { href: '/diensten',  labelKey: 'nav.services' },
  { href: '/koelkast',  labelKey: 'nav.fridge-rental' },
  { href: '/contact',   labelKey: 'nav.contact' },
  { href: '/ideeen',    labelKey: 'nav.ideas' },
];

interface PublicHeaderProps {
  variant?: 'marketing-cream' | 'over-dark' | 'light';
}

export default function PublicHeader({ variant = 'marketing-cream' }: PublicHeaderProps) {
  const { t } = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Header is "donker" (witte tekst + witte logo) op:
  //  - over-dark variant zolang nog niet gescrold (transparant op hero)
  //  - marketing-cream: navy bar zodat witte logo zichtbaar is
  const isOverDark = (variant === 'over-dark' && !scrolled) || variant === 'marketing-cream';

  useEffect(() => {
    if (variant !== 'over-dark') return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [variant]);

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

  const headerStyle = (() => {
    if (variant === 'over-dark' && !scrolled) {
      // Transparant boven donkere hero
      return {
        background: 'transparent',
        backdropFilter: 'none' as const,
        WebkitBackdropFilter: 'none' as const,
        borderBottom: '1px solid transparent',
        color: '#F1F5F9',
      };
    }
    if (variant === 'marketing-cream') {
      // Zelfde navy-deep als Topbar zodat ze visueel één blok vormen
      // (gebruiker: "header in dezelfde kleur als de top bar"). Geen
      // border-bottom — naadloze overgang naar het content-canvas.
      return {
        background: 'var(--color-navy-deep)',
        backdropFilter: 'none' as const,
        WebkitBackdropFilter: 'none' as const,
        borderBottom: 'none',
        color: '#F1F5F9',
      };
    }
    // 'light' of scrolled over-dark
    return {
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)',
      color: 'var(--color-text)',
    };
  })();

  const linkColorActive = isOverDark ? '#FFFFFF' : 'var(--color-navy)';
  const linkColorRest = isOverDark ? 'rgba(241,245,249,0.75)' : 'var(--color-marketing-ink)';
  const linkBgActive = isOverDark ? 'rgba(255,255,255,0.10)' : 'var(--color-sand)';

  return (
    <header
      className="sticky top-0 inset-x-0 z-40 transition-colors duration-200"
      style={headerStyle}
    >
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo — terracotta mark + navy serif wordmark op licht;
            full image-logo met glow op donker. */}
        <Link
          href="/"
          aria-label={t('common.brand')}
          className="flex items-center gap-2.5 shrink-0"
        >
          {isOverDark ? (
            <Image
              src="/images/logo.png"
              alt="Caravanstalling Spanje"
              width={420}
              height={95}
              priority
              className="h-9 w-auto"
              style={{ filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.18))' }}
            />
          ) : (
            <>
              <span
                aria-hidden
                className="grid place-items-center text-white font-bold"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--color-terracotta), var(--color-terracotta-deep))',
                  fontSize: '0.95rem',
                  letterSpacing: '0.02em',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                CS
              </span>
              <span
                className="font-display"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1.15rem',
                  color: 'var(--color-navy)',
                  letterSpacing: '-0.012em',
                }}
              >
                Caravanstalling Spanje
              </span>
            </>
          )}
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Hoofd-navigatie"
          className="hidden md:flex items-center gap-1"
        >
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className="press-spring inline-flex items-center h-9 px-3 rounded-md text-[14px] font-medium transition-colors"
                style={{
                  color: active ? linkColorActive : linkColorRest,
                  background: active ? linkBgActive : 'transparent',
                }}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block">
            <LocaleSwitch variant={isOverDark ? 'dark' : 'light'} />
          </div>

          {/* Primary CTA — marketing varianten gebruiken terracotta-pill,
              over-dark gebruikt wit pill, light gebruikt accent-near-black. */}
          {variant === 'marketing-cream' ? (
            <Link
              href="/diensten"
              className="hidden md:inline-flex mk-btn-primary"
              style={{ padding: '0.55rem 1.1rem', fontSize: '13px' }}
            >
              {t('nav.cta-services')}
              <ArrowRight size={13} aria-hidden />
            </Link>
          ) : (
            <Link
              href="/diensten"
              className="press-spring hidden md:inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-[13px] font-semibold transition-colors"
              style={{
                background: isOverDark ? '#FFFFFF' : 'var(--color-accent)',
                color: isOverDark ? 'var(--color-navy)' : 'var(--color-accent-fg)',
              }}
            >
              {t('nav.cta-services')}
              <ArrowRight size={13} aria-hidden />
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? t('nav.menu-close') : t('nav.menu-open')}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="md:hidden press-spring inline-flex items-center justify-center w-10 h-10 rounded-md transition-colors"
            style={{
              color: isOverDark ? '#F1F5F9' : 'var(--color-navy)',
              background: 'transparent',
            }}
          >
            {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
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
            className="md:hidden border-t"
            style={{
              background: variant === 'marketing-cream' ? 'var(--color-marketing-cream)' : 'var(--color-surface)',
              borderColor: variant === 'marketing-cream' ? 'var(--color-marketing-line)' : 'var(--color-border)',
              color: variant === 'marketing-cream' ? 'var(--color-marketing-ink)' : 'var(--color-text)',
              boxShadow: 'var(--shadow-popover)',
            }}
          >
            <nav aria-label="Mobiel navigatie-menu" className="max-w-[1180px] mx-auto px-5 sm:px-8 py-3">
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => {
                  const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="press-spring flex items-center justify-between h-12 px-3 rounded-md text-[15px] font-medium transition-colors"
                        style={{
                          color: active ? 'var(--color-navy)' : 'var(--color-marketing-ink-soft)',
                          background: active ? 'var(--color-sand)' : 'transparent',
                        }}
                      >
                        {t(link.labelKey)}
                        <ArrowRight size={14} aria-hidden style={{ opacity: 0.4 }} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 pt-3 border-t flex items-center justify-between gap-3" style={{ borderColor: 'var(--color-marketing-line)' }}>
                <LocaleSwitch />
                <Link
                  href="/diensten"
                  className="mk-btn-primary"
                  style={{ padding: '0.6rem 1.1rem', fontSize: '14px' }}
                >
                  {t('nav.cta-services')}
                  <ArrowRight size={14} aria-hidden />
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
