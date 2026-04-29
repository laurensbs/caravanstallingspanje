'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Loader2, User, Refrigerator, Warehouse, Truck, MessageSquare, Wrench,
  ArrowRight,
} from 'lucide-react';

type Result = {
  kind: string;
  label: string;
  sub: string;
  href: string;
  ref?: string;
};

const KIND_ICON: Record<string, typeof User> = {
  customer: User,
  fridge: Refrigerator,
  booking: Refrigerator,
  stalling: Warehouse,
  transport: Truck,
  service: Wrench,
  contact: MessageSquare,
};

// Globale Cmd/Ctrl+K palette voor het admin-paneel.
export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle on Cmd+K / Ctrl+K. Esc sluit altijd.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isShortcut = (e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K');
      if (isShortcut) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQ('');
      setResults([]);
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`, { credentials: 'include' });
        const data = await res.json();
        setResults(Array.isArray(data.results) ? data.results : []);
        setActive(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [q, open]);

  const go = useCallback((r: Result) => {
    router.push(r.href);
    setOpen(false);
  }, [router]);

  const onResultsKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(results.length - 1, i + 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    if (e.key === 'Enter' && results[active]) { e.preventDefault(); go(results[active]); }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            role="dialog"
            aria-modal="true"
            className="fixed left-1/2 top-[12vh] -translate-x-1/2 z-[60] w-[min(640px,92vw)] card-surface shadow-2xl overflow-hidden"
          >
            <div className="relative border-b border-border">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" />
              {loading && (
                <Loader2 size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-subtle animate-spin" />
              )}
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onResultsKey}
                placeholder="Zoek klant, ref-code, kenteken, camping…"
                className="w-full h-14 pl-11 pr-12 bg-transparent text-[15px] focus:outline-none placeholder:text-text-subtle"
              />
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {results.length === 0 && q.trim().length >= 2 && !loading && (
                <p className="p-6 text-[13px] text-text-muted text-center">Geen resultaten voor &quot;{q}&quot;.</p>
              )}
              {results.length === 0 && q.trim().length < 2 && (
                <div className="p-5 space-y-2 text-[12px] text-text-muted">
                  <p>Type minstens 2 tekens. Voorbeelden:</p>
                  <ul className="space-y-1 ml-3 list-disc list-inside">
                    <li>Klant-naam, e-mail of telefoon</li>
                    <li>Ref-code: KK-12, ST-7, TR-3, CT-5</li>
                    <li>Kenteken of camping-naam</li>
                  </ul>
                </div>
              )}
              {results.map((r, i) => {
                const Icon = KIND_ICON[r.kind] || ArrowRight;
                const isActive = i === active;
                return (
                  <button
                    key={`${r.kind}-${i}`}
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      isActive ? 'bg-surface-2' : 'hover:bg-surface-2'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-[var(--radius-md)] bg-surface border border-border flex items-center justify-center shrink-0 text-text">
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-medium truncate">{r.label}</div>
                      <div className="text-[12px] text-text-muted truncate">{r.sub}</div>
                    </div>
                    {r.ref && (
                      <span className="text-[11px] font-mono text-text-subtle shrink-0">{r.ref}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between px-4 py-2 border-t border-border text-[11px] text-text-muted">
              <span><kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border">↑↓</kbd> navigeren</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border">↵</kbd> openen</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border">Esc</kbd> sluiten</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
