'use client';

import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  width?: number;
  footer?: ReactNode;
}

export default function Drawer({ open, onClose, title, subtitle, children, width = 520, footer }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handler);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
            style={{ width }}
            className="fixed top-0 right-0 bottom-0 z-50 bg-bg shadow-lg flex flex-col max-w-[90vw]"
          >
            <header className="shrink-0 px-6 py-5 border-b border-border flex items-start justify-between gap-3">
              <div className="min-w-0">
                {title && <h2 className="text-lg font-medium text-text truncate">{title}</h2>}
                {subtitle && <p className="text-sm text-text-muted truncate mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Sluiten"
                className="shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-[var(--radius-md)] text-text-muted hover:bg-surface-2 hover:text-text transition-colors"
              >
                <X size={16} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
            {footer && (
              <footer className="shrink-0 px-6 py-4 border-t border-border bg-surface flex items-center justify-end gap-2">
                {footer}
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
