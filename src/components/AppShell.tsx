'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Refrigerator, Bell, Truck, LogOut, ChevronLeft,
  Settings,
} from 'lucide-react';
import { ReactNode } from 'react';

type NavGroup = {
  label: string;
  items: { href: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Operatie',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/admin/koelkasten', label: 'Koelkasten', icon: Refrigerator },
      { href: '/admin/transport', label: 'Transport', icon: Truck },
      { href: '/admin/wachtlijst', label: 'Wachtlijst', icon: Bell },
    ],
  },
  {
    label: 'Beheer',
    items: [
      { href: '/admin/instellingen', label: 'Instellingen', icon: Settings },
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
            className="flex items-center gap-3 group"
            title="Naar portaal-keuze"
          >
            <div className="w-11 h-11 rounded-[var(--radius-md)] bg-white flex items-center justify-center overflow-hidden shrink-0">
              <Image
                src="/images/logo.png"
                alt="Caravanstalling"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold leading-tight">Caravanstalling</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/45 mt-1">Stalling</div>
            </div>
            <ChevronLeft size={13} className="text-white/30 group-hover:text-white/60 transition-colors" />
          </Link>
        </div>

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
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 h-8 rounded-[var(--radius-md)] text-[12px] text-white/55 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={14} /> Uitloggen
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
    </div>
  );
}
