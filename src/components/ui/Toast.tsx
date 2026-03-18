'use client';

import { Toaster } from 'sonner';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: '12px',
          padding: '14px 16px',
          fontSize: '13px',
          fontWeight: 500,
          border: '1px solid rgba(0,0,0,0.04)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        },
      }}
      richColors
      closeButton
    />
  );
}
