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
      .catch(() => setError('Could not load users'))
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
        setError(data.error || 'Sign-in failed');
        setShake(s => s + 1);
        setPassword('');
        return;
      }
      if (data.mustChangePassword) {
        setStep('set-password');
        return;
      }
      localStorage.setItem(STORAGE_KEY, String(selected.id));
      onSuccess({ name: data.name, role: data.role });
    } catch {
      setError('Connection error');
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
      setError('Use at least 10 characters');
      setShake(s => s + 1);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
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
        setError(data.error || 'Could not set password');
        setShake(s => s + 1);
        return;
      }
      localStorage.setItem(STORAGE_KEY, String(selected.id));
      onSuccess({ name: data.name, role: data.role });
    } catch {
      setError('Connection error');
      setShake(s => s + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #142F4D 0%, #0A1929 100%)' }}
    >
      {/* Subtle radial glow voor diepte. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(80% 60% at 50% 0%, rgba(96,165,250,0.12) 0%, transparent 60%)',
        }}
      />
      <div className="w-full max-w-sm relative">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          {/* Witte badge zodat het kleur-correcte logo (donkerblauw, zoals op
              de homepage) leesbaar blijft tegen de navy-portal-achtergrond.
              Identiek met de sidebar-versie zodat 't visueel klopt. */}
          <div
            className="mx-auto mb-5 inline-flex items-center justify-center px-5 py-3 rounded-[var(--radius-lg)]"
            style={{ background: '#FFFFFF', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
          >
            <Image
              src="/images/logo.png"
              alt="Caravanstalling"
              width={220}
              height={50}
              priority
              className="h-9 w-auto"
            />
          </div>
          <p className="text-[10px] font-medium tracking-[0.25em] uppercase" style={{ color: 'rgba(241,245,249,0.55)' }}>
            Admin portal
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
              <p className="text-xs text-center mb-4" style={{ color: 'rgba(241,245,249,0.6)' }}>Who are you?</p>
              {loadingAdmins ? (
                <div className="flex justify-center py-8" style={{ color: 'rgba(241,245,249,0.55)' }}><Spinner size={20} /></div>
              ) : admins.length === 0 ? (
                <p className="text-center text-sm py-8" style={{ color: 'rgba(241,245,249,0.55)' }}>{error || 'No users found'}</p>
              ) : (
                admins.map((a, i) => (
                  <motion.button
                    key={a.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                    onClick={() => pickUser(a)}
                    className="w-full flex items-center gap-3 p-3 rounded-[var(--radius-lg)] transition-all group"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#F1F5F9',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
                      style={{ background: '#3B82F6', color: '#FFFFFF' }}
                    >
                      {initials(a.name)}
                    </div>
                    <span className="flex-1 text-sm font-medium text-left">{a.name}</span>
                    <ArrowRight size={14} style={{ color: 'rgba(241,245,249,0.5)' }} />
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
                placeholder="Password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                autoFocus
                autoComplete="current-password"
                error={error}
              />
              <Button type="submit" className="w-full" loading={submitting} disabled={!password}>
                <Lock size={14} /> Sign in
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
              <div
                className="rounded-[var(--radius-lg)] p-3 text-xs leading-relaxed"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(241,245,249,0.7)',
                }}
              >
                <strong style={{ color: '#FFFFFF' }}>First sign-in.</strong> Choose a personal password of at least 10 characters.
              </div>
              <Input
                type="password"
                placeholder="New password (min. 10 characters)"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError(''); }}
                autoFocus
                autoComplete="new-password"
              />
              <Input
                type="password"
                placeholder="Confirm new password"
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
                <KeyRound size={14} /> Set password
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
    <div
      className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)]"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#F1F5F9',
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
        style={{ background: '#3B82F6', color: '#FFFFFF' }}
      >
        {initials(user.name)}
      </div>
      <span className="flex-1 text-sm font-medium">{user.name}</span>
      <button
        type="button"
        onClick={onSwitch}
        className="text-xs inline-flex items-center gap-1 transition-colors"
        style={{ color: 'rgba(241,245,249,0.55)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(241,245,249,0.55)'; }}
      >
        <ArrowLeft size={12} /> Switch
      </button>
    </div>
  );
}
