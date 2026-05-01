'use client';

import { ReactNode } from 'react';
import PublicFooter from './PublicFooter';

const NAVY_BG =
  'linear-gradient(180deg, #0A1929 0%, #050D18 100%)';

// Wrapt elke publieke pagina in een continuous navy gradient + footer.
// PublicHero komt erbovenop; de daaronder liggende body krijgt voortaan een
// translucent glass-card zodat het navy doorheen schemert. Mobile-first.
export default function PublicShell({ children, withFooter = true }: { children: ReactNode; withFooter?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col page-public" style={{ background: NAVY_BG, color: '#F1F5F9' }}>
      <div className="flex-1">{children}</div>
      {withFooter && <PublicFooter />}
    </div>
  );
}

// Glass-card wrapper voor content op de navy achtergrond. Plaats hier je
// formulieren, samenvattingen, etc. — de witte body uit eerder is vervangen
// door een subtiele frosted-glass look.
export function PublicCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[var(--radius-2xl)] p-5 sm:p-7 ${className}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {children}
    </div>
  );
}
