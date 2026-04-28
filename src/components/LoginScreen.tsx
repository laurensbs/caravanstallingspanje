'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lock, KeyRound } from 'lucide-react';
import { Button, Input, Spinner } from './ui';

type AdminUser = { id: number; name: string; role: string };
type Step = 'select' | 'password' | 'set-password';

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
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [step, setStep] = useState<Step>('select');

  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
          if (match) { setSelected(match); setStep('password'); }
        }
      })
      .catch(() => setError('Kon gebruikers niet laden'))
      .finally(() => setLoadingAdmins(false));
  }, []);

  const reset = () => {
    setSelected(null);
    setStep('select');
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    localStorage.removeItem(STORAGE_KEY);
  };

  const pickUser = (a: AdminUser) => {
    setSelected(a);
    setStep('password');
    setError('');
  };

  const submitPassword = async (e: React.FormEvent) => {
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
      if (!res.ok || !data.success) {
        setError(data.error || 'Inloggen mislukt');
        setShake(s => s + 1);
        setPassword('');
        return;
      }
      if (data.mustChangePassword) {
        // Keep current password in state — backend re-checks it on set-password.
        setStep('set-password');
        return;
      }
      localStorage.setItem(STORAGE_KEY, String(selected.id));
      onSuccess({ name: data.name, role: data.role });
    } catch {
      setError('Verbindingsfout');
      setShake(s => s + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const submitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setError('');
    if (newPassword.length < 10) {
      setError('Minimaal 10 tekens');
      setShake(s => s + 1);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      setShake(s => s + 1);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: selected.id, currentPassword: password, newPassword }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Wachtwoord instellen mislukt');
        setShake(s => s + 1);
        return;
      }
      localStorage.setItem(STORAGE_KEY, String(selected.id));
      onSuccess({ name: data.name, role: data.role });
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
          <Image
            src="/images/logo.png"
            alt="Caravanstalling"
            width={220}
            height={50}
            priority
            className="mx-auto h-9 w-auto opacity-90 mb-5"
          />
          <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-text-muted">
            Beheerportaal
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.25 }}
              className="space-y-2"
            >
              <p className="text-xs text-text-muted text-center mb-4">Wie ben jij?</p>
              {loadingAdmins ? (
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
                    onClick={() => pickUser(a)}
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
          )}

          {step === 'password' && selected && (
            <motion.form
              key="password"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0, ...(shake > 0 && { x: [0, -6, 6, -4, 4, 0] }) }}
              exit={{ opacity: 0, x: -8 }}
              transition={shake > 0 ? { duration: 0.4 } : { duration: 0.25 }}
              onSubmit={submitPassword}
              className="space-y-4"
            >
              <UserCard user={selected} onSwitch={reset} />
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

          {step === 'set-password' && selected && (
            <motion.form
              key="set-password"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0, ...(shake > 0 && { x: [0, -6, 6, -4, 4, 0] }) }}
              exit={{ opacity: 0, x: -8 }}
              transition={shake > 0 ? { duration: 0.4 } : { duration: 0.25 }}
              onSubmit={submitNewPassword}
              className="space-y-4"
            >
              <UserCard user={selected} onSwitch={reset} />
              <div className="rounded-[var(--radius-lg)] border border-border bg-surface-2 p-3 text-xs text-text-muted leading-relaxed">
                <strong className="text-text">Eerste keer inloggen.</strong> Kies een eigen wachtwoord van minimaal 10 tekens.
              </div>
              <Input
                type="password"
                placeholder="Nieuw wachtwoord (min. 10 tekens)"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError(''); }}
                autoFocus
                autoComplete="new-password"
              />
              <Input
                type="password"
                placeholder="Bevestig nieuw wachtwoord"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                autoComplete="new-password"
                error={error}
              />
              <Button
                type="submit"
                className="w-full"
                loading={submitting}
                disabled={!newPassword || !confirmPassword}
              >
                <KeyRound size={14} /> Wachtwoord instellen
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function UserCard({ user, onSwitch }: { user: AdminUser; onSwitch: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded-[var(--radius-lg)]">
      <div className="w-10 h-10 rounded-full bg-accent text-accent-fg flex items-center justify-center text-sm font-medium shrink-0">
        {initials(user.name)}
      </div>
      <span className="flex-1 text-sm font-medium text-text">{user.name}</span>
      <button
        type="button"
        onClick={onSwitch}
        className="text-xs text-text-muted hover:text-text inline-flex items-center gap-1 transition-colors"
      >
        <ArrowLeft size={12} /> Wisselen
      </button>
    </div>
  );
}
