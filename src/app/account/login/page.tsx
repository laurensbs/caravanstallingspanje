'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';
import MarketingPage from '@/components/marketing/MarketingPage';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Inloggen mislukt.');
        return;
      }
      // Eerste login op een eenmalig wachtwoord → dwingend naar
      // wachtwoord-wijzigen scherm. Daarna pas toegang tot dashboard.
      if (data.mustChangePassword) {
        router.push('/account/wachtwoord-wijzigen?first=1');
      } else {
        router.push('/account');
      }
    } catch {
      setError('Verbindingsfout. Probeer het zo opnieuw.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <h2 className="font-display" style={{
            color: 'var(--color-navy)',
            fontSize: '1.4rem',
            fontWeight: 700,
            letterSpacing: '-0.012em',
            margin: '0 0 0.4rem',
          }}>
            Inloggen
          </h2>
          <p className="text-[14px]" style={{ color: 'var(--color-marketing-ink-soft)' }}>
            Gebruik het wachtwoord uit je welkomst-mail. De eerste keer vragen we je een eigen wachtwoord te kiezen.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium" style={{ color: 'var(--color-marketing-ink)' }}>
              E-mail
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-3.5 text-[15px] bg-white text-[var(--color-marketing-ink)] border border-[var(--color-marketing-line)] rounded-[var(--radius-md)] transition-colors placeholder:opacity-60 focus:outline-none focus:ring-2 focus:border-[color:var(--color-terracotta)] focus:ring-[color:var(--color-terracotta-soft)]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium" style={{ color: 'var(--color-marketing-ink)' }}>
              Wachtwoord
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-3.5 text-[15px] bg-white text-[var(--color-marketing-ink)] border border-[var(--color-marketing-line)] rounded-[var(--radius-md)] transition-colors placeholder:opacity-60 focus:outline-none focus:ring-2 focus:border-[color:var(--color-terracotta)] focus:ring-[color:var(--color-terracotta-soft)]"
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
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
          {submitting ? 'Bezig…' : 'Inloggen'}
        </button>
      </motion.form>
    </section>
  );
}

export default function AccountLoginPage() {
  return (
    <MarketingPage
      hero={{
        title: 'Klantportaal',
        intro: 'Log in om je facturen en gegevens te bekijken.',
        back: { href: '/', label: 'Caravanstalling Spanje' },
        variant: 'compact',
      }}
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </MarketingPage>
  );
}
