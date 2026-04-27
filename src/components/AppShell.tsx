'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Refrigerator, LogOut } from 'lucide-react';
import { ReactNode } from 'react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/koelkasten', label: 'Koelkasten', icon: Refrigerator, exact: false },
];

interface AppShellProps {
  userName: string;
  children: ReactNode;
  onLogout: () => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('');
}

export default function AppShell({ userName, children, onLogout }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try { await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' }); } catch { /* ignore */ }
    onLogout();
    router.refresh();
  };

  return (
    <div className="min-h-screen flex bg-bg">
      <aside className="w-60 shrink-0 bg-surface border-r border-border flex flex-col h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-text-muted">Beheer</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 h-9 rounded-[var(--radius-md)] text-sm transition-colors ${
                  active ? 'text-text font-medium' : 'text-text-muted hover:text-text hover:bg-surface-2'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-surface-2 rounded-[var(--radius-md)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon size={15} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-accent text-accent-fg flex items-center justify-center text-xs font-medium shrink-0">
              {initials(userName)}
            </div>
            <span className="flex-1 text-sm font-medium text-text truncate">{userName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-1 flex items-center gap-3 px-3 h-9 rounded-[var(--radius-md)] text-sm text-text-muted hover:text-danger hover:bg-danger-soft transition-colors"
          >
            <LogOut size={15} /> Uitloggen
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="px-8 py-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
