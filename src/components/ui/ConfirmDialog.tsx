'use client';
import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export default function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Bevestigen', cancelLabel = 'Annuleren', variant = 'primary', loading }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center sm:text-left">
        <h3 className="text-lg font-bold text-surface-dark mb-2">{title}</h3>
        {description && <p className="text-sm text-warm-gray/70 mb-6">{description}</p>}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 text-sm font-semibold text-warm-gray/70 hover:text-warm-gray transition-colors">{cancelLabel}</button>
          <button type="button" onClick={onConfirm} disabled={loading} className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50 ${variant === 'danger' ? 'bg-danger hover:bg-red-700' : 'bg-primary hover:bg-primary-light'}`}>{loading ? 'Bezig...' : confirmLabel}</button>
        </div>
      </div>
    </Modal>
  );
}
