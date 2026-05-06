'use client';

import { Info } from 'lucide-react';
import { ReactNode } from 'react';

interface InfoBannerProps {
  children: ReactNode;
  className?: string;
}

// Subtiele info-strip op cream-canvas: terracotta-soft fill met
// accent-bar links — sluit aan bij brand i.p.v. een afwijkende warning-amber.
export default function InfoBanner({ children, className = '' }: InfoBannerProps) {
  return (
    <div
      className={`relative rounded-[var(--radius-md)] pl-5 pr-4 py-3 flex gap-3 text-[12.5px] leading-relaxed overflow-hidden ${className}`}
      style={{
        background: 'var(--sky-soft)',
        border: '1px solid rgba(217,110,60,0.22)',
        color: 'var(--ink)',
      }}
    >
      {/* Terracotta accent-bar links */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: 'var(--orange)' }}
      />
      <Info size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--orange-d)' }} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
