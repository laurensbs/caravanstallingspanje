'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { KeyRound, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import MarketingPage from '@/components/marketing/MarketingPage';

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
      // Korte vertraging zodat klant de bevestiging ziet, dan door naar
      // dashboard. Bij eerste login is dat de eerste keer dat ze 'm zien.
      setTimeout(() => router.push('/account'), 900);
    } catch {
      setError('Verbindingsfout. Probeer het zo opnieuw.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section className="max-w-md mx-auto px-5 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mk-card p-6 sm:p-8 text-center space-y-3"
        >
          <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center" style={{ background: 'var(--color-terracotta-soft)', color: 'var(--color-terracotta-deep)' }}>
            <CheckCircle2 size={22} />
          </div>
          <h2 className="font-display" style={{ color: 'var(--color-navy)', fontSize: '1.3rem', fontWeight: 700 }}>
            Wachtwoord gewijzigd
          </h2>
          <p className="text-[14px]" style={{ color: 'var(--color-marketing-ink-soft)' }}>
            Je gaat zo door naar je portaal…
          </p>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="max-w-md mx-auto px-5 sm:px-6 py-8 sm:py-12">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mk-card p-6 sm:p-8 space-y-5"
      >
        <div>
          <h2 className="font-display" style={{ color: 'var(--color-navy)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.012em', margin: '0 0 0.4rem' }}>
            {isFirstLogin ? 'Kies je eigen wachtwoord' : 'Wachtwoord wijzigen'}
          </h2>
          <p className="text-[14px]" style={{ color: 'var(--color-marketing-ink-soft)' }}>
            {isFirstLogin
              ? 'Voor toegang tot je portaal kies je nu een eigen wachtwoord. Het eenmalige wachtwoord uit de mail mag je daarna vergeten.'
              : 'Voer je huidige wachtwoord in en kies een nieuw wachtwoord van minimaal 8 tekens.'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium" style={{ color: 'var(--color-marketing-ink)' }}>
              {isFirstLogin ? 'Wachtwoord uit welkomst-mail' : 'Huidig wachtwoord'}
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full h-12 px-3.5 text-[15px] bg-white text-[var(--color-marketing-ink)] border border-[var(--color-marketing-line)] rounded-[var(--radius-md)] transition-colors focus:outline-none focus:ring-2 focus:border-[color:var(--color-terracotta)] focus:ring-[color:var(--color-terracotta-soft)]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium" style={{ color: 'var(--color-marketing-ink)' }}>
              Nieuw wachtwoord <span className="text-[12px]" style={{ color: 'var(--color-marketing-ink-soft)' }}>(min. 8 tekens)</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-12 px-3.5 text-[15px] bg-white text-[var(--color-marketing-ink)] border border-[var(--color-marketing-line)] rounded-[var(--radius-md)] transition-colors focus:outline-none focus:ring-2 focus:border-[color:var(--color-terracotta)] focus:ring-[color:var(--color-terracotta-soft)]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium" style={{ color: 'var(--color-marketing-ink)' }}>
              Bevestig nieuw wachtwoord
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-12 px-3.5 text-[15px] bg-white text-[var(--color-marketing-ink)] border border-[var(--color-marketing-line)] rounded-[var(--radius-md)] transition-colors focus:outline-none focus:ring-2 focus:border-[color:var(--color-terracotta)] focus:ring-[color:var(--color-terracotta-soft)]"
            />
          </div>
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-[var(--radius-md)] bg-danger-soft text-danger px-4 py-3 text-[13px]">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mk-btn-primary w-full justify-center disabled:opacity-50"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
          {submitting ? 'Bezig…' : 'Wachtwoord opslaan'}
        </button>
      </motion.form>
    </section>
  );
}

export default function ChangePasswordPage() {
  return (
    <MarketingPage
      hero={{
        title: 'Wachtwoord instellen',
        back: { href: '/account/login', label: 'Inloggen' },
        variant: 'compact',
      }}
    >
      <Suspense fallback={null}>
        <ChangeForm />
      </Suspense>
    </MarketingPage>
  );
}
