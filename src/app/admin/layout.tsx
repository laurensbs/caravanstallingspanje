'use client';

import { useEffect, useState, useCallback, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import LoginScreen from '@/components/LoginScreen';
import AppShell from '@/components/AppShell';
import { Spinner } from '@/components/ui';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPicker = pathname === '/admin';

  const [loading, setLoading] = useState(!isPicker);
  const [authed, setAuthed] = useState(false);
  const [name, setName] = useState('');

  const check = useCallback(() => {
    fetch('/api/admin/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setAuthed(true); setName(d.name || 'Admin'); })
      .catch(() => setAuthed(false))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isPicker) return;
    check();
  }, [check, isPicker]);

  // Portaal-keuzepagina is publiek; geen login-flow
  if (isPicker) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text-muted">
        <Spinner size={20} />
      </div>
    );
  }

  if (!authed) {
    return <LoginScreen onSuccess={({ name }) => { setName(name); setAuthed(true); }} />;
  }

  return <AppShell userName={name} onLogout={() => { setAuthed(false); setName(''); }}>{children}</AppShell>;
}
