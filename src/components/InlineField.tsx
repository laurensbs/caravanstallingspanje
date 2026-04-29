'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Pencil, Loader2 } from 'lucide-react';

interface Props {
  value: string | null;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'textarea';
  /** Tekst-display als value leeg is. */
  emptyText?: string;
  onSave: (next: string) => Promise<void>;
}

// Inline-edit veld in stijl van het reparatiepanel: klik = input verschijnt,
// Enter/checkmark = save, Esc/X = cancel. Toont een groene puls bij succes.
export default function InlineField({ value, label, placeholder, type = 'text', emptyText, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => { setDraft(value ?? ''); }, [value]);
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const cancel = () => { setDraft(value ?? ''); setEditing(false); };

  const save = async () => {
    if ((draft || '') === (value || '')) { setEditing(false); return; }
    setSaving(true);
    try {
      await onSave(draft);
      setSavedFlash(true);
      setEditing(false);
      setTimeout(() => setSavedFlash(false), 1400);
    } finally {
      setSaving(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') { e.preventDefault(); save(); }
    if (e.key === 'Escape') { e.preventDefault(); cancel(); }
  };

  const display = value && value.trim().length > 0 ? value : (emptyText ?? <span className="text-text-subtle italic">— niet ingevuld —</span>);

  return (
    <div className="group">
      {label && (
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted mb-1.5">
          {label}
        </div>
      )}
      {editing ? (
        <div className="flex items-start gap-1.5">
          {type === 'textarea' ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              rows={3}
              placeholder={placeholder}
              className="flex-1 px-2.5 py-2 text-[14px] bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors"
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              placeholder={placeholder}
              className="flex-1 h-9 px-2.5 text-[14px] bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors"
            />
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="h-9 w-9 inline-flex items-center justify-center rounded-[var(--radius-md)] bg-accent text-accent-fg hover:bg-accent-hover transition-colors disabled:opacity-50"
            aria-label="Opslaan"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />}
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={saving}
            className="h-9 w-9 inline-flex items-center justify-center rounded-[var(--radius-md)] border border-border bg-surface hover:border-border-strong text-text-muted hover:text-text transition-colors"
            aria-label="Annuleren"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="w-full text-left px-2 py-1.5 -mx-2 rounded-[var(--radius-sm)] hover:bg-surface-2 transition-colors flex items-start justify-between gap-2 group"
        >
          <span className={`text-[14px] ${value && value.trim() ? 'text-text' : ''} whitespace-pre-wrap break-words flex-1`}>
            {display}
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            <AnimatePresence>
              {savedFlash && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-success-soft text-success"
                >
                  <Check size={11} strokeWidth={3} />
                </motion.span>
              )}
            </AnimatePresence>
            <Pencil size={12} className="text-text-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </button>
      )}
    </div>
  );
}
