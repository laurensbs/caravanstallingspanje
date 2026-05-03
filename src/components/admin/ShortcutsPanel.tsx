'use client';

import { useEffect, useState } from 'react';
import { Keyboard, X } from 'lucide-react';

// Keyboard-shortcuts paneel voor admin. `?` toggle (alleen wanneer focus
// niet op een input zit) opent een overlay met de actieve shortcuts.
//
// We registreren hier geen nieuwe shortcuts — alleen documenteren wat al
// bestaat. Dit is een eenvoudig "cheat sheet" — gebruikers leren ze niet
// uit hoofd dus 'm openen op `?` is laagdrempelig.

const SHORTCUTS = [
  { keys: ['⌘', 'K'], desc: 'Quick search / command palette', context: 'global' },
  { keys: ['/'], desc: 'Focus zoekbalk op huidige pagina', context: 'admin lijst' },
  { keys: ['Esc'], desc: 'Sluit dialog / wis zoekopdracht', context: 'global' },
  { keys: ['?'], desc: 'Open dit paneel', context: 'global' },
];

export default function ShortcutsPanel() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === '?') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 'var(--z-modal)', background: 'rgba(15, 23, 42, 0.4)' }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md card-surface p-5"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: 'var(--shadow-modal)' }}
      >
        <header className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Keyboard size={16} className="text-text-muted" aria-hidden />
            <h2 id="shortcuts-title" className="text-[15px] font-semibold">Keyboard shortcuts</h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Sluit"
            className="w-7 h-7 inline-flex items-center justify-center rounded-md text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
          >
            <X size={14} />
          </button>
        </header>

        <ul className="space-y-2">
          {SHORTCUTS.map((s, i) => (
            <li key={i} className="flex items-center justify-between gap-3 py-1.5">
              <span className="text-[13px] text-text">{s.desc}</span>
              <span className="inline-flex items-center gap-1 shrink-0">
                {s.keys.map((k, j) => (
                  <kbd
                    key={j}
                    className="inline-flex items-center justify-center min-w-[22px] h-6 px-1.5 rounded text-[11px] font-medium bg-surface-2 border border-border text-text-muted"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-4 pt-3 border-t border-border text-[11px] text-text-subtle">
          Druk <kbd className="inline-flex items-center justify-center min-w-[18px] h-5 px-1 rounded text-[10px] bg-surface-2 border border-border">?</kbd> opnieuw of <kbd className="inline-flex items-center justify-center min-w-[28px] h-5 px-1 rounded text-[10px] bg-surface-2 border border-border">Esc</kbd> om te sluiten.
        </p>
      </div>
    </div>
  );
}
