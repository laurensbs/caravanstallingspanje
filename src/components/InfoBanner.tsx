'use client';

import { Info } from 'lucide-react';
import { ReactNode } from 'react';

interface InfoBannerProps {
  children: ReactNode;
  className?: string;
}

export default function InfoBanner({ children, className = '' }: InfoBannerProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border px-4 py-3 flex gap-3 text-[12px] leading-relaxed ${className}`}
      style={{
        background: 'var(--color-warning-soft)',
        borderColor: 'color-mix(in oklch, var(--color-warning), transparent 70%)',
        color: 'var(--color-text)',
      }}
    >
      <Info size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
