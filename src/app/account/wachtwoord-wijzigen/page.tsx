'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { KeyRound, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import AccountLayout from '@/components/account/AccountLayout';
import { useLocale } from '@/components/LocaleProvider';

function ChangeForm() {
  const router = useRouter();
  const params = useSearchParams();
  const isFirstLogin = params.get('first') === '1';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Bevestiging komt niet overeen met het nieuwe wachtwoord.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Nieuw wachtwoord moet minimaal 8 tekens zijn.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Wijzigen mislukt.');
        return;
      }
      setDone(true);
      setTimeout(() => router.push('/account'), 900);
    } catch {
      setError('Verbindingsfout. Probeer het zo opnieuw.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-mk text-center"
        style={{ padding: 32, maxWidth: 480 }}
      >
        <div
          aria-hidden
          style={{
            width: 56, height: 56,
            margin: '0 auto 14px',
            borderRadius: 999,
            background: 'var(--green-soft)',
            color: 'var(--green)',
            display: 'grid', placeItems: 'center',
            border: '2px solid var(--green)',
          }}
        >
          <CheckCircle2 size={28} />
        </div>
        <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 20, color: 'var(--navy)', margin: '0 0 8px' }}>
          Wachtwoord gewijzigd
        </h2>
        <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>
          Je gaat zo door naar je portaal…
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="card-mk"
      style={{ padding: 32, maxWidth: 480 }}
    >
      {isFirstLogin && (
        <div
          role="status"
          style={{
            background: 'var(--sky-soft)',
            border: '1px solid rgba(47,66,84,0.10)',
            color: 'var(--navy)',
            padding: 14,
            borderRadius: 10,
            fontSize: 13.5,
            marginBottom: 18,
            lineHeight: 1.55,
          }}
        >
          Welkom! Voor je verder kunt: kies een eigen wachtwoord ter vervanging van het tijdelijke uit de welkomstmail.
        </div>
      )}

      <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 20, color: 'var(--navy)', margin: '0 0 18px' }}>
        Wachtwoord wijzigen
      </h2>

      <div className="field-mk">
        <label htmlFor="pw-current">Huidig wachtwoord</label>
        <input
          id="pw-current"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div className="field-mk">
        <label htmlFor="pw-new">Nieuw wachtwoord</label>
        <input
          id="pw-new"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
          required
        />
        <div className="hint">Minimaal 8 tekens.</div>
      </div>
      <div className="field-mk">
        <label htmlFor="pw-confirm">Bevestig nieuw wachtwoord</label>
        <input
          id="pw-confirm"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <div role="alert" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: 12, borderRadius: 10, fontSize: 13, margin: '14px 0' }}>
          <AlertCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <button type="submit" disabled={submitting} className="btn btn-primary btn-block disabled:opacity-50" style={{ marginTop: 6 }}>
        {submitting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <KeyRound size={15} aria-hidden />}
        {submitting ? 'Wijzigen…' : 'Wijzig wachtwoord'}
      </button>
    </motion.form>
  );
}

export default function WachtwoordWijzigenPage() {
  const { t } = useLocale();
  return (
    <AccountLayout>
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <span className="eyebrow-mk">{t('pt1.brand')}</span>
        <h1 className="h2-mk" style={{ marginTop: 4, fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)' }}>
          Wachtwoord wijzigen
        </h1>
      </motion.header>
      <Suspense fallback={<div className="card-mk" style={{ padding: 32, maxWidth: 480, height: 320 }} />}>
        <ChangeForm />
      </Suspense>
    </AccountLayout>
  );
}
