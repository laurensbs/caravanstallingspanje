'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Plus, Loader2, UserCheck } from 'lucide-react';
import { Badge } from './ui';

export type CustomerLite = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  holded_contact_id: string | null;
};

interface Props {
  /** Geselecteerde klant — toont de "geselecteerd"-badge ipv input. */
  value: CustomerLite | null;
  onSelect: (c: CustomerLite) => void;
  onClear: () => void;
  onCreateNew: (initialQuery?: string) => void;
  placeholder?: string;
}

export default function CustomerPicker({ value, onSelect, onClear, onCreateNew, placeholder }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CustomerLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/customers/search?q=${encodeURIComponent(query)}`, { credentials: 'include' });
        const data = await res.json();
        setResults(data.customers || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  // Klik buiten dropdown → sluiten
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (value) {
    return (
      <div className="rounded-[var(--radius-md)] border border-accent bg-surface p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-success-soft text-success flex items-center justify-center shrink-0">
            <UserCheck size={14} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{value.name}</div>
            <div className="text-[12px] text-text-muted truncate">
              {[value.email, value.phone].filter(Boolean).join(' · ') || '—'}
            </div>
          </div>
          {value.holded_contact_id && <Badge tone="success">Holded</Badge>}
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-[12px] text-text-muted hover:text-text underline-offset-2 hover:underline"
        >
          Wijzigen
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder || 'Zoek op naam, e-mail of telefoon…'}
          className="w-full h-10 pl-9 pr-9 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors placeholder:text-text-subtle"
        />
        {loading && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle animate-spin" />
        )}
      </div>

      {open && (query.trim().length >= 2 || results.length > 0) && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 card-surface shadow-lg overflow-hidden">
          {results.length > 0 ? (
            <ul className="max-h-72 overflow-y-auto divide-y divide-border">
              {results.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => { onSelect(c); setOpen(false); setQuery(''); }}
                    className="w-full text-left px-3 py-2.5 hover:bg-surface-2 transition-colors flex items-center gap-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{c.name}</div>
                      <div className="text-[12px] text-text-muted truncate">
                        {[c.email, c.phone].filter(Boolean).join(' · ') || '—'}
                      </div>
                    </div>
                    {c.holded_contact_id && <Badge tone="success">Holded</Badge>}
                  </button>
                </li>
              ))}
            </ul>
          ) : !loading ? (
            <p className="px-3 py-3 text-[13px] text-text-muted">Geen klanten gevonden voor &quot;{query}&quot;.</p>
          ) : null}
          <button
            type="button"
            onClick={() => { onCreateNew(query); setOpen(false); }}
            className="w-full px-3 py-2.5 text-[13px] font-medium border-t border-border bg-surface-2 hover:bg-surface transition-colors flex items-center gap-2 text-text"
          >
            <Plus size={14} /> Nieuwe klant aanmaken{query ? ` "${query}"` : ''}
          </button>
        </div>
      )}
    </div>
  );
}
