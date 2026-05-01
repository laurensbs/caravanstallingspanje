'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Refrigerator, Bell, Truck, LogOut, ChevronLeft,
  Settings, Users, Warehouse, MessageSquare, Search, PlayCircle, Lightbulb,
} from 'lucide-react';
import { ReactNode } from 'react';
import CommandPalette from './CommandPalette';
import LocaleSwitch from './LocaleSwitch';

type NavGroup = {
  label: string;
  items: { href: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Operations',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/admin/klanten', label: 'Customers', icon: Users },
      { href: '/admin/koelkasten', label: 'Fridges', icon: Refrigerator },
      { href: '/admin/stalling', label: 'Storage', icon: Warehouse },
      { href: '/admin/transport', label: 'Transport', icon: Truck },
      { href: '/admin/contact', label: 'Messages', icon: MessageSquare },
      { href: '/admin/ideeen', label: 'Ideas inbox', icon: Lightbulb },
      { href: '/admin/wachtlijst', label: 'Waitlist', icon: Bell },
    ],
  },
  {
    label: 'Admin',
    items: [
      { href: '/admin/test-flow', label: 'Test flow', icon: PlayCircle },
      { href: '/admin/instellingen', label: 'Settings', icon: Settings },
    ],
  },
];

interface AppShellProps {
  userName: string;
  children: ReactNode;
  onLogout: () => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
}

export default function AppShell({ userName, children, onLogout }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

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
    <div className="min-h-screen flex bg-bg">
      {/* Donkere sidebar — reparatiepanel-stijl */}
      <aside
        className="w-64 shrink-0 flex flex-col h-screen sticky top-0"
        style={{ background: 'var(--color-sidebar)', color: 'var(--color-sidebar-fg)' }}
      >
        <div
          className="px-5 py-5 border-b"
          style={{ borderColor: 'var(--color-sidebar-border)' }}
        >
          <Link
            href="/admin"
            className="flex items-center justify-between group"
            title="Back to portal selection"
          >
            <div
              className="inline-flex items-center justify-center px-3 py-2 rounded-[var(--radius-md)]"
              style={{ background: '#FFFFFF' }}
            >
              <Image
                src="/images/logo.png"
                alt="Caravanstalling"
                width={420}
                height={95}
                priority
                quality={100}
                className="h-9 w-auto"
              />
            </div>
            <ChevronLeft size={14} className="text-white/30 group-hover:text-white/60 transition-colors shrink-0" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => {
            // Trigger Cmd+K palette via een synthetisch keyboard event
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
          }}
          className="mx-3 mt-3 flex items-center gap-2.5 px-3 h-9 rounded-[var(--radius-md)] text-[13px] transition-colors group"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Search size={14} />
          <span className="flex-1 text-left">Quick search…</span>
          <kbd className="text-[10px] tabular-nums px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}>⌘K</kbd>
        </button>

        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="px-3 mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="relative flex items-center gap-3 px-3 h-10 rounded-[var(--radius-md)] text-[14px] transition-colors group"
                      style={{
                        color: active ? 'white' : 'rgba(255,255,255,0.7)',
                      }}
                    >
                      {active && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-[var(--radius-md)]"
                          style={{ background: 'var(--color-sidebar-active)' }}
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <Icon size={16} className="relative z-10 shrink-0" />
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div
          className="p-3 border-t"
          style={{ borderColor: 'var(--color-sidebar-border)' }}
        >
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
              style={{ background: 'var(--color-sidebar-accent)', color: 'white' }}
            >
              {initials(userName)}
            </div>
            <span className="flex-1 text-[12px] font-medium text-white truncate">{userName}</span>
            <LocaleSwitch variant="dark" />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 h-8 rounded-[var(--radius-md)] text-[12px] text-white/55 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 min-w-0">
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
      </div>
      <CommandPalette />
    </div>
  );
}
