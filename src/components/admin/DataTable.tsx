'use client';

import { useMemo, useState, ReactNode, useEffect } from 'react';
import { ArrowDown, ArrowUp, Search, X } from 'lucide-react';
import EmptyState from './EmptyState';

// Lichtgewicht admin-tabel met:
//   - per-kolom sort (aria-sort + visual indicator)
//   - globale full-text zoek (debounced, escape clears)
//   - keyboard: '/' focust zoek, Esc leegt 'm
//   - sticky header
//   - controlled toolbar slot voor filter-knoppen
//   - empty + filtered-empty states
//
// Geen TanStack — voor onze datasets (~hooked op 100-1000 rijen) is een
// simpele in-memory `Array.sort` + `filter` ruim snel zat. Server-side
// pagination kan later via `controlled` mode (totalCount + onSortChange).

export type Column<T> = {
  key: string;
  header: ReactNode;
  /** Cell-render. Krijg 't hele record zodat je composities (status + naam) kunt maken. */
  cell: (row: T) => ReactNode;
  /** Hoe te sorteren. Geef een string/number-extractor — null = niet sorteerbaar. */
  sortValue?: (row: T) => string | number | null | undefined;
  /** Tailwind-extra voor de td/th — bv. width of alignment. */
  className?: string;
  /** Sticky kolom (bv. eerste kolom op mobiel). */
  sticky?: boolean;
  /** Verborgen op mobile. */
  hideOnMobile?: boolean;
};

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  /** Stable key per rij — voor React-key + sort-stabiliteit. */
  rowKey: (row: T) => string | number;
  /** Globale zoek-extractor. Krijgt rij, geeft string die we doorzoeken. */
  searchable?: (row: T) => string;
  searchPlaceholder?: string;
  /** Klik-handler op een hele rij (bv. open detail-pagina). */
  onRowClick?: (row: T) => void;
  /** Extra slot rechts naast zoekbalk (filter-chips, refresh-knop). */
  toolbarEnd?: ReactNode;
  /** Empty state wanneer rows.length === 0. */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  /** Initiële sort. */
  initialSort?: { key: string; direction: 'asc' | 'desc' };
  /** Loading state — toont skeleton-rows. */
  loading?: boolean;
  className?: string;
};

export default function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchable,
  searchPlaceholder = 'Zoek…',
  onRowClick,
  toolbarEnd,
  emptyTitle = 'Nog geen gegevens',
  emptyDescription,
  emptyAction,
  initialSort,
  loading,
  className = '',
}: Props<T>) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(initialSort ?? null);

  // Debounce zoek — 120ms is genoeg om typen niet te onderbreken zonder
  // dat de tabel ruziet bij elke keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 120);
    return () => clearTimeout(id);
  }, [query]);

  // Global '/' shortcut to focus search.
  useEffect(() => {
    if (!searchable) return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === '/') {
        e.preventDefault();
        document.getElementById('admin-table-search')?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchable]);

  const filtered = useMemo(() => {
    if (!debouncedQuery || !searchable) return rows;
    return rows.filter((r) => searchable(r).toLowerCase().includes(debouncedQuery));
  }, [rows, debouncedQuery, searchable]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return filtered;
    const dir = sort.direction === 'asc' ? 1 : -1;
    // Spread → original-array niet muteren (voor stable refs in callers).
    return [...filtered].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb), 'nl', { numeric: true }) * dir;
    });
  }, [filtered, sort, columns]);

  function toggleSort(key: string) {
    setSort((curr) => {
      if (!curr || curr.key !== key) return { key, direction: 'asc' };
      if (curr.direction === 'asc') return { key, direction: 'desc' };
      return null; // derde klik = reset
    });
  }

  const isFilteredEmpty = sorted.length === 0 && rows.length > 0;
  const isFullyEmpty = rows.length === 0 && !loading;

  return (
    <div className={`space-y-3 ${className}`}>
      {(searchable || toolbarEnd) && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {searchable && (
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
              <input
                id="admin-table-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') setQuery(''); }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-full h-9 pl-9 pr-9 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors placeholder:text-text-subtle"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Zoekopdracht wissen"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-text-subtle hover:text-text hover:bg-surface-2"
                >
                  <X size={12} />
                </button>
              )}
              <kbd className="hidden md:inline-block absolute right-9 top-1/2 -translate-y-1/2 text-[10px] text-text-subtle border border-border rounded px-1.5 py-0.5 pointer-events-none">/</kbd>
            </div>
          )}
          {toolbarEnd && <div className="flex items-center gap-2 shrink-0">{toolbarEnd}</div>}
        </div>
      )}

      {isFullyEmpty ? (
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-surface-2 border-b border-border">
              <tr>
                {columns.map((c) => {
                  const sortable = !!c.sortValue;
                  const active = sort?.key === c.key;
                  const dir = active ? sort.direction : undefined;
                  return (
                    <th
                      key={c.key}
                      scope="col"
                      aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : sortable ? 'none' : undefined}
                      className={`text-left px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted whitespace-nowrap ${c.hideOnMobile ? 'hidden sm:table-cell' : ''} ${c.sticky ? 'sticky left-0 bg-surface-2' : ''} ${c.className ?? ''}`}
                    >
                      {sortable ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(c.key)}
                          className="inline-flex items-center gap-1.5 hover:text-text transition-colors"
                        >
                          {c.header}
                          {active ? (
                            dir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />
                          ) : (
                            <span aria-hidden className="opacity-30"><ArrowDown size={11} /></span>
                          )}
                        </button>
                      ) : (
                        c.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`sk-${i}`} className="border-b border-border last:border-b-0">
                      {columns.map((c) => (
                        <td key={c.key} className={`px-3 py-3 ${c.hideOnMobile ? 'hidden sm:table-cell' : ''}`}>
                          <div className="h-3 bg-surface-2 rounded animate-pulse" style={{ width: `${50 + ((i * 7 + c.key.length * 11) % 40)}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : sorted.map((row) => (
                    <tr
                      key={rowKey(row)}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={`border-b border-border last:border-b-0 ${onRowClick ? 'cursor-pointer hover:bg-surface-2 transition-colors' : ''}`}
                    >
                      {columns.map((c) => (
                        <td
                          key={c.key}
                          className={`px-3 py-2.5 align-top ${c.hideOnMobile ? 'hidden sm:table-cell' : ''} ${c.sticky ? 'sticky left-0 bg-surface' : ''} ${c.className ?? ''}`}
                        >
                          {c.cell(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {isFilteredEmpty && (
        <EmptyState
          title="Geen resultaten"
          description={`Niets gevonden voor "${query}". Probeer een andere zoekterm of wis 'm met Esc.`}
        />
      )}
    </div>
  );
}
