'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { Button, Input, Spinner } from './ui';

type AdminUser = { id: number; name: string; role: string };

interface LoginScreenProps {
  onSuccess: (data: { name: string; role: string }) => void;
}

const STORAGE_KEY = 'admin_last_id';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('');
}

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(0);

  useEffect(() => {
    fetch('/api/admin/auth/users', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        const list: AdminUser[] = d.admins || [];
        setAdmins(list);
        const lastId = Number(localStorage.getItem(STORAGE_KEY));
        if (lastId) {
          const match = list.find(a => a.id === lastId);
          if (match) setSelected(match);
        }
      })
      .catch(() => setError('Kon gebruikers niet laden'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: selected.id, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(STORAGE_KEY, String(selected.id));
        onSuccess({ name: data.name, role: data.role });
      } else {
        setError(data.error || 'Inloggen mislukt');
        setShake(s => s + 1);
        setPassword('');
      }
    } catch {
      setError('Verbindingsfout');
      setShake(s => s + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-text-muted">Beheerportaal</span>
          </div>
          <h1 className="text-2xl font-medium text-text tracking-tight">Caravanstalling</h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.25 }}
              className="space-y-2"
            >
              <p className="text-xs text-text-muted text-center mb-4">Wie ben jij?</p>
              {loading ? (
                <div className="flex justify-center py-8 text-text-muted"><Spinner size={20} /></div>
              ) : admins.length === 0 ? (
                <p className="text-center text-sm text-text-muted py-8">{error || 'Geen gebruikers gevonden'}</p>
              ) : (
                admins.map((a, i) => (
                  <motion.button
                    key={a.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                    onClick={() => { setSelected(a); setError(''); }}
                    className="w-full flex items-center gap-3 p-3 bg-surface border border-border rounded-[var(--radius-lg)] hover:border-border-strong hover:shadow-sm transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent text-accent-fg flex items-center justify-center text-sm font-medium shrink-0">
                      {initials(a.name)}
                    </div>
                    <span className="flex-1 text-sm font-medium text-text text-left">{a.name}</span>
                    <ArrowRight size={14} className="text-text-subtle group-hover:text-text transition-colors" />
                  </motion.button>
                ))
              )}
            </motion.div>
          ) : (
            <motion.form
              key="password"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0, ...(shake > 0 && { x: [0, -6, 6, -4, 4, 0] }) }}
              exit={{ opacity: 0, x: -8 }}
              transition={shake > 0 ? { duration: 0.4 } : { duration: 0.25 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded-[var(--radius-lg)]">
                <div className="w-10 h-10 rounded-full bg-accent text-accent-fg flex items-center justify-center text-sm font-medium shrink-0">
                  {initials(selected.name)}
                </div>
                <span className="flex-1 text-sm font-medium text-text">{selected.name}</span>
                <button
                  type="button"
                  onClick={() => { setSelected(null); setPassword(''); setError(''); localStorage.removeItem(STORAGE_KEY); }}
                  className="text-xs text-text-muted hover:text-text inline-flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft size={12} /> Wisselen
                </button>
              </div>
              <Input
                type="password"
                placeholder="Wachtwoord"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                autoFocus
                autoComplete="current-password"
                error={error}
              />
              <Button type="submit" className="w-full" loading={submitting} disabled={!password}>
                <Lock size={14} /> Inloggen
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
