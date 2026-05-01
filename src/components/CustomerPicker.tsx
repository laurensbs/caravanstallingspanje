'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Search, Plus, Loader2, UserCheck, Cloud, Link2 } from 'lucide-react';
import { Badge } from './ui';

export type CustomerLite = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  holded_contact_id: string | null;
};

type HoldedHit = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
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
  const [holdedResults, setHoldedResults] = useState<HoldedHit[]>([]);
  const [holdedError, setHoldedError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [adoptingId, setAdoptingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setHoldedResults([]); setHoldedError(null); return; }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/customers/search?q=${encodeURIComponent(query)}`, { credentials: 'include' });
        const data = await res.json();
        setResults(data.customers || []);
        setHoldedResults(data.holded || []);
        setHoldedError(data.holdedError || null);
      } catch {
        setResults([]);
        setHoldedResults([]);
        setHoldedError('Connection to server failed');
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const adopt = async (h: HoldedHit) => {
    setAdoptingId(h.id);
    try {
      const res = await fetch('/api/admin/customers/adopt-holded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdedContactId: h.id }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Linking failed');
        return;
      }
      toast.success(data.alreadyLinked ? 'Customer already linked' : 'Customer linked from Holded');
      onSelect(data.customer);
      setOpen(false);
      setQuery('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Linking failed');
    } finally {
      setAdoptingId(null);
    }
  };

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
          Change
        </button>
      </div>
    );
  }

  const hasResults = results.length > 0 || holdedResults.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder || 'Search by name, email or phone…'}
          className="w-full h-10 pl-9 pr-9 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors placeholder:text-text-subtle"
        />
        {loading && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle animate-spin" />
        )}
      </div>

      {open && (query.trim().length >= 2 || hasResults) && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 card-surface shadow-lg overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            {results.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted bg-surface-2/50 border-b border-border">
                  Our customers
                </div>
                <ul className="divide-y divide-border">
                  {results.map((c) => (
                    <li key={`local-${c.id}`}>
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
              </>
            )}

            {holdedResults.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted bg-surface-2/50 border-b border-t border-border flex items-center gap-1.5">
                  <Cloud size={11} /> From Holded — not yet linked locally
                </div>
                <ul className="divide-y divide-border">
                  {holdedResults.map((h) => {
                    const adopting = adoptingId === h.id;
                    return (
                      <li key={`holded-${h.id}`}>
                        <button
                          type="button"
                          disabled={adopting}
                          onClick={() => adopt(h)}
                          className="w-full text-left px-3 py-2.5 hover:bg-surface-2 transition-colors flex items-center gap-2.5 disabled:opacity-60"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">{h.name}</div>
                            <div className="text-[12px] text-text-muted truncate">
                              {[h.email, h.phone].filter(Boolean).join(' · ') || 'Holded contact'}
                            </div>
                          </div>
                          {adopting ? (
                            <Loader2 size={13} className="animate-spin text-text-muted shrink-0" />
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-text-muted shrink-0">
                              <Link2 size={11} /> Link
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {!loading && !hasResults && query.trim().length >= 2 && (
              <p className="px-3 py-4 text-[13px] text-text-muted">
                No customers found for &quot;{query}&quot;{holdedError ? ' locally' : ' — not locally and not in Holded'}.
              </p>
            )}
            {holdedError && (
              <div className="px-3 py-2.5 text-[12px] border-t border-border bg-warning-soft text-text">
                <strong className="block">Holded search failed:</strong>
                <span className="text-text-muted">{holdedError}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => { onCreateNew(query); setOpen(false); }}
            className="w-full px-3 py-2.5 text-[13px] font-medium border-t border-border bg-surface-2 hover:bg-surface transition-colors flex items-center gap-2 text-text"
          >
            <Plus size={14} /> Create new customer{query ? ` "${query}"` : ''}
          </button>
        </div>
      )}
    </div>
  );
}
