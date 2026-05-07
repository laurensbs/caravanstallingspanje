'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Caravan, Receipt, User, KeyRound, LogOut, ArrowLeft,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { useLocale } from '../LocaleProvider';
import type { StringKey } from '@/lib/i18n';

interface AccountLayoutProps {
  customerName?: string;
  customerEmail?: string;
  children: ReactNode;
}

type NavItem = { href: string; labelKey: StringKey; icon: LucideIcon };

const NAV: NavItem[] = [
  { href: '/account',                  labelKey: 'pt1.nav-dashboard', icon: LayoutDashboard },
  { href: '/account/caravan',          labelKey: 'pt1.nav-caravan',   icon: Caravan },
  { href: '/account/facturen',         labelKey: 'pt1.nav-invoices',  icon: Receipt },
  { href: '/account/gegevens',         labelKey: 'pt1.nav-details',   icon: User },
  { href: '/account/wachtwoord-wijzigen', labelKey: 'pt1.nav-password', icon: KeyRound },
];

export default function AccountLayout({ customerName, customerEmail, children }: AccountLayoutProps) {
  const { t } = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/account/logout', { method: 'POST', credentials: 'include' });
    router.push('/account/login');
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <aside
        className="hidden lg:flex flex-col"
        style={{
          width: 260,
          background: 'var(--navy-deep)',
          color: '#B7C5D2',
          position: 'sticky',
          top: 0,
          height: '100vh',
          padding: '24px 18px',
          flexShrink: 0,
        }}
      >
        <Link href="/" aria-label="Caravanstalling Spanje" style={{ display: 'inline-block', marginBottom: 28 }}>
          <Image
            src="/images/logo-v2.png"
            alt="Caravanstalling Spanje"
            width={512}
            height={115}
            style={{ height: 32, width: 'auto', filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.10))' }}
          />
        </Link>

        {customerName && (
          <div style={{ paddingBottom: 18, marginBottom: 18, borderBottom: '1px solid var(--navy-line)' }}>
            <div style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 13, color: '#fff', marginBottom: 2 }}>
              {customerName}
            </div>
            {customerEmail && (
              <div style={{ fontSize: 11.5, color: '#8AA0B5' }}>{customerEmail}</div>
            )}
          </div>
        )}

        <nav aria-label="Portaal-navigatie" style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV.map(({ href, labelKey, icon: Icon }) => {
              const active = pathname === href || (href !== '/account' && pathname?.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px', borderRadius: 8,
                      fontFamily: 'var(--inter)', fontSize: 14, fontWeight: 500,
                      color: active ? '#fff' : '#B7C5D2',
                      background: active ? 'rgba(149,216,253,0.08)' : 'transparent',
                      borderLeft: active ? '3px solid var(--orange)' : '3px solid transparent',
                      paddingLeft: active ? 9 : 12,
                      textDecoration: 'none',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                  >
                    <Icon size={16} aria-hidden style={{ color: active ? 'var(--orange)' : '#8AA0B5' }} />
                    {t(labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={{ paddingTop: 18, borderTop: '1px solid var(--navy-line)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Link
            href="/"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8,
              fontSize: 13, color: '#8AA0B5', textDecoration: 'none',
              fontFamily: 'var(--inter)',
            }}
          >
            <ArrowLeft size={14} aria-hidden /> {t('pt1.back-to-site')}
          </Link>
          <button
            type="button"
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8,
              fontSize: 13, color: '#FCA5A5',
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--inter)', textAlign: 'left',
            }}
          >
            <LogOut size={14} aria-hidden /> {t('pt1.nav-logout')}
          </button>
        </div>
      </aside>

      {/* Mobile top-bar */}
      <header
        className="lg:hidden"
        style={{
          background: 'var(--navy-deep)',
          color: '#fff',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          width: '100%',
        }}
      >
        <Link href="/" style={{ display: 'inline-block' }}>
          <Image src="/images/logo-v2.png" alt="" width={512}
            height={115} style={{ height: 26, width: 'auto' }} />
        </Link>
        <button
          type="button"
          onClick={logout}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 12px', borderRadius: 8,
            fontSize: 12.5, color: '#FCA5A5',
            background: 'rgba(252,165,165,0.10)', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--inter)',
          }}
        >
          <LogOut size={13} aria-hidden /> {t('pt1.nav-logout')}
        </button>
      </header>

      <main className="flex-1 min-w-0">
        <div className="lg:hidden" style={{ background: '#fff', borderBottom: '1px solid var(--line)', padding: '10px 18px', overflowX: 'auto' }}>
          <ul style={{ display: 'flex', gap: 6, listStyle: 'none', margin: 0, padding: 0 }}>
            {NAV.map(({ href, labelKey, icon: Icon }) => {
              const active = pathname === href || (href !== '/account' && pathname?.startsWith(href));
              return (
                <li key={href} style={{ flex: '0 0 auto' }}>
                  <Link
                    href={href}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 12px', borderRadius: 999,
                      fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 12.5,
                      background: active ? 'var(--navy)' : 'var(--bg)',
                      color: active ? '#fff' : 'var(--ink-2)',
                      border: active ? '1px solid var(--navy)' : '1px solid var(--line)',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Icon size={13} aria-hidden /> {t(labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="px-5 sm:px-8 lg:px-10 py-8 sm:py-10">{children}</div>
      </main>
    </div>
  );
}
