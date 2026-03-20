'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({ open, onClose, title, description, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', handler);
      return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handler); };
    }
    document.body.style.overflow = '';
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className={`relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}
          >
            {title && (
              <div className="flex items-start justify-between p-6 pb-0">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                  {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900" aria-label="Sluiten">
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
