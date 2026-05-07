'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Refrigerator, Bell, Truck, LogOut, ChevronLeft,
  Settings, Users, Warehouse, MessageSquare, Search, Lightbulb, Wind, CalendarRange,
  Tag, Recycle, Wrench, ClipboardCheck,
} from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import CommandPalette from './CommandPalette';
import ShortcutsPanel from './admin/ShortcutsPanel';
import DensityToggle from './admin/DensityToggle';
import NewOrderNotifier from './admin/NewOrderNotifier';

type CountKey = 'stalling' | 'transport' | 'fridge' | 'contact' | 'ideas' | 'waitlist' | 'service_requests';

type NavGroup = {
  label: string;
  items: {
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
    exact?: boolean;
    /** Welke count uit /api/admin/badge-counts hoort bij dit item. */
    countKey?: CountKey;
  }[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Operations',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/admin/klanten', label: 'Customers', icon: Users },
      { href: '/admin/koelkasten', label: 'Fridges', icon: Refrigerator, countKey: 'fridge' },
      { href: '/admin/koelkasten?device=Airco', label: 'AC units', icon: Wind },
      { href: '/admin/planning', label: 'Planning', icon: CalendarRange },
      { href: '/admin/stalling', label: 'Storage', icon: Warehouse, countKey: 'stalling' },
      { href: '/admin/transport', label: 'Transport', icon: Truck, countKey: 'transport' },
      { href: '/admin/service-requests', label: 'Service-aanvragen', icon: Wrench, countKey: 'service_requests' },
      { href: '/admin/inspecties', label: 'Keuringen', icon: ClipboardCheck },
      { href: '/admin/contact', label: 'Messages', icon: MessageSquare, countKey: 'contact' },
      { href: '/admin/ideeen', label: 'Ideas inbox', icon: Lightbulb, countKey: 'ideas' },
      { href: '/admin/wachtlijst', label: 'Waitlist', icon: Bell, countKey: 'waitlist' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { href: '/admin/voorraad', label: 'Stock', icon: Tag },
      { href: '/admin/inkoop', label: 'Buy-back', icon: Recycle },
    ],
  },
  {
    label: 'Admin',
    items: [
      { href: '/admin/instellingen', label: 'Settings', icon: Settings },
    ],
  },
];

type Counts = Partial<Record<CountKey, number>>;

const POLL_MS = 30_000;

function useBadgeCounts(): Counts {
  const [counts, setCounts] = useState<Counts>({});
  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    async function load() {
      try {
        const r = await fetch('/api/admin/badge-counts', { credentials: 'include' });
        if (!r.ok) return;
        const d = (await r.json()) as Counts;
        if (mounted) setCounts(d);
      } catch {
        /* zwijgen — sidebar mag rustig leeg blijven bij offline */
      } finally {
        if (mounted) timer = setTimeout(load, POLL_MS);
      }
    }
    load();
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, []);
  return counts;
}

interface AppShellProps {
  userName: string;
  children: ReactNode;
  onLogout: () => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
}

const COLLAPSED_WIDTH = 76;
const EXPANDED_WIDTH = 280;

export default function AppShell({ userName, children, onLogout }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDevice = searchParams.get('device') || '';
  // Hover-state — sidebar opent zodra de muis erover komt en sluit weer
  // wanneer 'm de zone verlaat. De main-content krijgt een vaste linker
  // padding van COLLAPSED_WIDTH zodat hij niet schuift bij hovering.
  const [hovered, setHovered] = useState(false);
  const expanded = hovered;
  const counts = useBadgeCounts();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      /* ignore */
    }
    onLogout();
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg" style={{ paddingLeft: COLLAPSED_WIDTH }}>
      {/* Navy sidebar — auto-collapse naar 76px, expand op hover naar 280px.
          Sticky+fixed positioning zodat 'm boven de main-content schuift
          tijdens expand i.p.v. de content opzij te duwen. */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="fixed top-0 left-0 h-screen flex flex-col z-40 overflow-hidden"
        style={{
          width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
          background: 'var(--color-sidebar)',
          color: 'var(--color-sidebar-fg)',
          boxShadow: expanded ? '0 12px 40px rgba(0,0,0,0.35)' : 'none',
          transition: 'width 220ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms ease',
        }}
      >
        {/* Logo-blok */}
        <div
          className="border-b flex items-center"
          style={{
            borderColor: 'var(--color-sidebar-border)',
            height: 80,
            paddingLeft: 14,
            paddingRight: 14,
          }}
        >
          <Link href="/admin" className="flex items-center gap-3 group w-full" title="Back to portal selection">
            {/* Logo direct op de navy achtergrond — transparante PNG (wit-op-niets)
                ploft eruit zonder witte chip eromheen. Container clipt 'm bij
                collapsed naar een vierkant zodat alleen het symbool zichtbaar is. */}
            <div
              className="inline-flex items-center shrink-0 overflow-hidden"
              style={{
                width: expanded ? 200 : 48,
                height: 48,
                transition: 'width 220ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <Image
                src="/images/logo-v2.png"
                alt="Caravanstalling"
                width={512}
                height={115}
                priority
                quality={100}
                style={{
                  height: 36,
                  width: 'auto',
                  maxWidth: 'none',
                  objectFit: 'contain',
                  objectPosition: 'left center',
                }}
              />
            </div>
            {expanded && (
              <ChevronLeft
                size={14}
                className="text-white/30 group-hover:text-white/60 transition-colors shrink-0 ml-auto"
              />
            )}
          </Link>
        </div>

        {/* Search-trigger */}
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
          }}
          className="mx-3 mt-3 flex items-center gap-2.5 px-3 h-9 rounded-[var(--radius-md)] text-[13px] transition-colors shrink-0"
          style={{
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          title="Quick search (⌘K)"
        >
          <Search size={14} className="shrink-0" />
          {expanded && (
            <>
              <span className="flex-1 text-left whitespace-nowrap">Quick search…</span>
              <kbd
                className="text-[10px] tabular-nums px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}
              >
                ⌘K
              </kbd>
            </>
          )}
        </button>

        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto overflow-x-hidden">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {expanded && (
                <div className="px-3 mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/35 whitespace-nowrap">
                  {group.label}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  // Splits href in pathname-deel en query zodat we de device-param
                  // mee kunnen vergelijken — anders zouden 'Fridges' en 'AC units'
                  // beide actief zijn op /admin/koelkasten.
                  const [hrefPath, hrefQuery = ''] = item.href.split('?');
                  const hrefDevice = new URLSearchParams(hrefQuery).get('device') || '';
                  const pathMatch = item.exact
                    ? pathname === hrefPath
                    : pathname === hrefPath || pathname.startsWith(hrefPath + '/');
                  // Op /admin/koelkasten: actief als pathname klopt EN device-filter
                  // overeenkomt (beide leeg = Fridges; 'Airco' = AC units).
                  const active = pathMatch && hrefDevice === currentDevice;
                  const Icon = item.icon;
                  const count = item.countKey ? counts[item.countKey] ?? 0 : 0;
                  const showCount = count > 0;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={!expanded ? `${item.label}${showCount ? ` (${count})` : ''}` : undefined}
                      aria-label={showCount ? `${item.label}, ${count} pending` : item.label}
                      className="relative flex items-center gap-3 px-3 h-10 rounded-[var(--radius-md)] text-[14px] transition-colors"
                      style={{ color: active ? 'white' : 'rgba(255,255,255,0.7)' }}
                    >
                      {active && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-[var(--radius-md)]"
                          style={{ background: 'var(--color-sidebar-active)' }}
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10 shrink-0">
                        <Icon size={18} />
                        {/* Compact-state: kleine dot rechtsboven het icoon. */}
                        {!expanded && showCount && (
                          <span
                            aria-hidden
                            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                            style={{ background: 'var(--color-amber)', boxShadow: '0 0 0 2px var(--color-sidebar)' }}
                          />
                        )}
                      </span>
                      {expanded && (
                        <>
                          <span className="relative z-10 whitespace-nowrap flex-1">{item.label}</span>
                          {showCount && (
                            <span
                              aria-hidden
                              className="relative z-10 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-semibold tabular-nums"
                              style={{
                                background: 'rgba(244, 185, 66, 0.18)',
                                color: 'var(--color-amber)',
                                border: '1px solid rgba(244, 185, 66, 0.32)',
                              }}
                            >
                              {count > 99 ? '99+' : count}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Onderkant — user, taal-toggle, sign out */}
        <div className="p-3 border-t shrink-0" style={{ borderColor: 'var(--color-sidebar-border)' }}>
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
              style={{ background: 'var(--color-sidebar-accent)', color: 'white' }}
              title={!expanded ? userName : undefined}
            >
              {initials(userName)}
            </div>
            {expanded && (
              <span className="flex-1 text-[12px] font-medium text-white truncate">{userName}</span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 h-8 rounded-[var(--radius-md)] text-[12px] text-white/55 hover:text-white hover:bg-white/5 transition-colors"
            title={!expanded ? 'Sign out' : undefined}
          >
            <LogOut size={14} className="shrink-0" />
            {expanded && <span className="whitespace-nowrap">Sign out</span>}
          </button>
        </div>
      </aside>

      <main className="min-w-0 relative">
        {/* Floating density-toggle rechtsboven — zichtbaar op desktop, verborgen
            onder lg om mobile-screens niet te crowden. */}
        <div className="hidden lg:block absolute top-4 right-6" style={{ zIndex: 'var(--z-sticky)' }}>
          <DensityToggle />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="page-admin max-w-7xl mx-auto px-8 lg:px-12 py-10 lg:py-12"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <CommandPalette />
      <ShortcutsPanel />
      <NewOrderNotifier />
    </div>
  );
}
