'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useId, useRef } from 'react';
import { Button } from './ui';
import { useFocusTrap } from '@/lib/focusTrap';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  destructive, onConfirm, onCancel, loading,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  useFocusTrap(dialogRef, { active: open });

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center px-4"
          style={{ zIndex: 'var(--z-modal)' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            aria-hidden
          />
          <motion.div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="relative bg-bg border border-border rounded-[var(--radius-xl)] max-w-sm w-full p-6"
            style={{ boxShadow: 'var(--shadow-modal)' }}
          >
            <h2 id={titleId} className="text-base font-medium text-text">{title}</h2>
            {description && <p id={descId} className="text-sm text-text-muted mt-2 leading-relaxed">{description}</p>}
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
              <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
