'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, MapPin, Search, X } from 'lucide-react';
import { CAMPING_GROUPS, type Camping } from '@/lib/campings';

interface CampingPickerProps {
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  ariaLabel?: string;
  /** Optional: pre-filter the available campings (e.g. exclude one already chosen). */
  filter?: (c: Camping) => boolean;
}

const inputCls =
  'w-full h-10 pl-3 pr-9 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors placeholder:text-text-subtle text-left';

export default function CampingPicker({
  value,
  onChange,
  placeholder,
  required,
  className = '',
  ariaLabel,
  filter,
}: CampingPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Filter groups against query + outer filter prop.
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CAMPING_GROUPS.map((g) => ({
      ...g,
      campings: g.campings.filter((c) => {
        if (filter && !filter(c)) return false;
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          g.subregion.toLowerCase().includes(q) ||
          g.comarca.toLowerCase().includes(q)
        );
      }),
    })).filter((g) => g.campings.length > 0);
  }, [query, filter]);

  // Flat list of currently-visible campings (for keyboard navigation).
  const flat = useMemo(() => groups.flatMap((g) => g.campings), [groups]);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  const select = (c: Camping) => {
    onChange(c.name);
    setQuery('');
    setOpen(false);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      setHighlight((h) => Math.min(h + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && open && flat[highlight]) {
      e.preventDefault();
      select(flat[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            // Focus the search input when opening.
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          className={`${inputCls} flex items-center justify-between`}
        >
          <span className={value ? 'text-text truncate' : 'text-text-subtle truncate'}>
            {value || placeholder || 'Kies een camping'}
          </span>
        </button>
        <ChevronDown
          size={14}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
        {/* Hidden required input so the form's native validation still triggers. */}
        {required && (
          <input
            tabIndex={-1}
            aria-hidden="true"
            required
            value={value}
            onChange={() => { /* read-only proxy */ }}
            className="sr-only"
          />
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id={listboxId}
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 left-0 right-0 mt-1.5 bg-surface border border-border rounded-[var(--radius-md)] shadow-lg overflow-hidden"
          >
            {/* Search bar */}
            <div className="relative border-b border-border">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Zoek camping of plaats…"
                className="w-full h-10 pl-9 pr-9 text-sm bg-transparent focus:outline-none placeholder:text-text-subtle"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-text-subtle hover:text-text hover:bg-surface-2 transition-colors"
                  aria-label="Wissen"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Results — capped to ~340px tall on mobile so the picker never eats the screen. */}
            <div
              ref={listRef}
              className="max-h-[min(60vh,340px)] overflow-y-auto py-1"
            >
              {groups.length === 0 ? (
                <div className="px-4 py-6 text-center text-[12px] text-text-muted">
                  Geen camping gevonden
                </div>
              ) : (
                groups.map((g) => (
                  <div key={`${g.comarca}-${g.subregion}`} className="py-1">
                    <div className="px-3 pt-1.5 pb-1">
                      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-text-subtle">
                        {g.comarca}
                      </div>
                      <div className="text-[11px] text-text-muted">{g.subregion}</div>
                    </div>
                    {g.campings.map((c) => {
                      const idxInFlat = flat.findIndex((x) => x.id === c.id);
                      const isHighlight = idxInFlat === highlight;
                      const isSelected = value === c.name;
                      return (
                        <button
                          type="button"
                          key={c.id}
                          role="option"
                          aria-selected={isSelected}
                          onMouseEnter={() => setHighlight(idxInFlat)}
                          onClick={() => select(c)}
                          className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left transition-colors ${
                            isHighlight ? 'bg-surface-2' : 'bg-transparent'
                          }`}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <MapPin size={11} className="text-text-subtle shrink-0" />
                            <span className="text-sm truncate">{c.name}</span>
                            <span className="text-[11px] text-text-muted truncate">{c.location}</span>
                          </span>
                          {isSelected && <Check size={13} className="text-text shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
