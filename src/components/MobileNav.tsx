'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, Wrench, User, Phone, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/stalling', icon: MapPin, label: 'Stalling' },
  { href: '/diensten', icon: Wrench, label: 'Diensten' },
  { href: '/blog', icon: BookOpen, label: 'Blog' },
  { href: '/contact', icon: Phone, label: 'Contact' },
  { href: '/mijn-account', icon: User, label: 'Account' },
];

export default function MobileNav() {
  const pathname = usePathname();

  // Don't show on admin/staff portals
  if (pathname.startsWith('/admin') || pathname.startsWith('/staff')) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-sand-dark/30 safe-bottom md:hidden no-print">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors touch-manipulation ${
                isActive ? 'text-primary' : 'text-warm-gray'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute inset-0 bg-primary/[0.06] rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <item.icon size={20} className="relative" />
              <span className="relative text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
