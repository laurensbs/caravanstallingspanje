'use client';

import { ReactNode, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useFocusTrap } from '@/lib/focusTrap';

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
  const asideRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const subtitleId = useId();

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

  useFocusTrap(asideRef, { active: open });

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
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
            style={{ zIndex: 'var(--z-drawer)' }}
            aria-hidden
          />
          <motion.aside
            ref={asideRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={subtitle ? subtitleId : undefined}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
            style={{ width, zIndex: 'var(--z-drawer)' }}
            className="fixed top-0 right-0 bottom-0 bg-bg shadow-lg flex flex-col max-w-[90vw]"
          >
            <header className="shrink-0 px-6 py-5 border-b border-border flex items-start justify-between gap-3">
              <div className="min-w-0">
                {title && <h2 id={titleId} className="text-lg font-medium text-text truncate">{title}</h2>}
                {subtitle && <p id={subtitleId} className="text-sm text-text-muted truncate mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-[var(--radius-md)] text-text-muted hover:bg-surface-2 hover:text-text transition-colors"
              >
                <X size={16} aria-hidden />
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
