'use client';

import Link from 'next/link';
import { Home, Search, ShieldCheck, Sparkles, Tag, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const popularPages = [
  { href: '/diensten/stalling', label: 'Stalling', icon: ShieldCheck },
  { href: '/diensten', label: 'Alle diensten', icon: Sparkles },
  { href: '/verkoop', label: 'Verkoop', icon: Tag },
  { href: '/tarieven', label: 'Tarieven', icon: Tag },
  { href: '/contact', label: 'Contact', icon: Phone },
];

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 section-bg-sky-soft">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg py-16"
      >
        <div
          aria-hidden
          style={{
            width: 88, height: 88, borderRadius: 22,
            margin: '0 auto 24px',
            background: 'linear-gradient(135deg, var(--sky) 0%, #BFE7FD 100%)',
            color: 'var(--navy)',
            display: 'grid', placeItems: 'center',
            boxShadow: 'var(--shadow-card-mk), 0 18px 40px -18px rgba(31,42,54,0.25)',
          }}
        >
          <Search size={40} />
        </div>
        <span className="eyebrow-mk" style={{ display: 'inline-flex', justifyContent: 'center' }}>404</span>
        <h1 className="h1-mk" style={{ marginTop: 4, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
          Pagina niet gevonden
        </h1>
        <p className="lead-mk" style={{ marginTop: 14, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
          De pagina die je zoekt bestaat niet of is verplaatst. Bekijk een van onze populaire pagina&apos;s.
        </p>
        <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {popularPages.map((page) => {
            const Icon = page.icon;
            return (
              <Link
                key={page.href}
                href={page.href}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#fff',
                  border: '1px solid var(--line)',
                  color: 'var(--navy)',
                  fontFamily: 'var(--sora)',
                  fontWeight: 600,
                  fontSize: 13,
                  padding: '10px 16px',
                  borderRadius: 999,
                  textDecoration: 'none',
                  boxShadow: 'var(--shadow-card-mk)',
                }}
              >
                <Icon size={14} aria-hidden style={{ color: 'var(--orange)' }} /> {page.label}
              </Link>
            );
          })}
        </div>
        <div style={{ marginTop: 32 }}>
          <Link href="/" className="btn btn-primary">
            <Home size={15} aria-hidden /> Naar homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
