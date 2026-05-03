'use client';

import { useEffect, useState, useCallback } from 'react';
import { Rows3, Rows4 } from 'lucide-react';

// Density-toggle voor admin: compact vs comfortable. Bewaart in localStorage
// en zet `data-density` attribuut op <html>. CSS-rules in globals lezen 't
// via `[data-density="compact"] .page-admin .card-surface { padding: ... }`.
//
// Visueel: pill-toggle in admin-page-header, naast de zoek/filter-rij.
//
// Niet: per-pagina-state (gebruiker verwacht consistente density over hele
// admin) en geen flicker op SSR — initieel checken op mount via useEffect.

const STORAGE_KEY = 'cs-admin-density';
type Density = 'compact' | 'comfortable';

function read(): Density {
  if (typeof window === 'undefined') return 'comfortable';
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === 'compact' ? 'compact' : 'comfortable';
}

function apply(density: Density) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.density = density;
}

/** Hook voor componenten die zelf willen reageren op density. */
export function useDensity(): [Density, (next: Density) => void] {
  const [density, setDensity] = useState<Density>('comfortable');
  useEffect(() => {
    const v = read();
    setDensity(v);
    apply(v);
  }, []);
  const set = useCallback((next: Density) => {
    setDensity(next);
    apply(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode */
    }
  }, []);
  return [density, set];
}

type Props = { className?: string };

export default function DensityToggle({ className = '' }: Props) {
  const [density, setDensity] = useDensity();
  return (
    <div
      role="group"
      aria-label="Layout density"
      className={`inline-flex items-center rounded-[var(--radius-md)] border border-border bg-surface p-0.5 ${className}`}
    >
      {[
        { value: 'comfortable' as const, icon: Rows3, label: 'Comfortable' },
        { value: 'compact' as const, icon: Rows4, label: 'Compact' },
      ].map(({ value, icon: Icon, label }) => {
        const active = density === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setDensity(value)}
            aria-pressed={active}
            aria-label={label}
            title={label}
            className={`inline-flex items-center justify-center w-8 h-7 rounded-[var(--radius-sm)] transition-colors ${
              active ? 'bg-accent text-accent-fg' : 'text-text-muted hover:text-text'
            }`}
          >
            <Icon size={14} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
