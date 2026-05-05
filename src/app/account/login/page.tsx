'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LogIn, Loader2, AlertCircle, Receipt, Camera, Calendar, ArrowLeft,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import { useLocale } from '@/components/LocaleProvider';
import type { StringKey } from '@/lib/i18n';

const EASE = [0.16, 1, 0.3, 1] as const;
type T = (k: StringKey, ...a: (string | number)[]) => string;

function LoginForm({ t }: { t: T }) {
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
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="card-mk card-lift"
      style={{ padding: 32 }}
    >
      <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 22, color: 'var(--navy)', margin: '0 0 20px' }}>
        {t('pt1.login-form-title')}
      </h2>

      <div className="field-mk">
        <label htmlFor="login-email">{t('pt1.login-email')}</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="field-mk">
        <label htmlFor="login-password">{t('pt1.login-password')}</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <div
          role="alert"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: '#FEF2F2', border: '1px solid #FECACA',
            color: '#991B1B', padding: 12, borderRadius: 10,
            fontSize: 13, marginBottom: 14,
          }}
        >
          <AlertCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary btn-block disabled:opacity-50"
        style={{ marginTop: 6 }}
      >
        {submitting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <LogIn size={16} aria-hidden />}
        {submitting ? '...' : t('pt1.login-submit')}
      </button>

      <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
        {t('pt1.login-help')}
      </p>
    </motion.form>
  );
}

function Benefits({ t }: { t: T }) {
  const items: Array<{ icon: LucideIcon; tKey: StringKey; dKey: StringKey }> = [
    { icon: Receipt, tKey: 'pt1.login-benefit-1-t', dKey: 'pt1.login-benefit-1-d' },
    { icon: Camera, tKey: 'pt1.login-benefit-2-t', dKey: 'pt1.login-benefit-2-d' },
    { icon: Calendar, tKey: 'pt1.login-benefit-3-t', dKey: 'pt1.login-benefit-3-d' },
  ];
  return (
    <div>
      <Link href="/" className="inline-flex items-center gap-1.5" style={{ color: 'var(--muted)', fontSize: 13, textDecoration: 'none', marginBottom: 22, fontFamily: 'var(--inter)' }}>
        <ArrowLeft size={14} aria-hidden /> {t('pt1.back-to-site')}
      </Link>
      <span className="eyebrow-mk">{t('pt1.login-eyebrow')}</span>
      <h1 className="h1-mk" style={{ marginTop: 4, fontSize: 'clamp(2rem, 4vw, 2.6rem)' }}>
        {t('pt1.login-h1')}
      </h1>
      <p className="lead-mk" style={{ marginTop: 14, maxWidth: 480 }}>
        {t('pt1.login-lead')}
      </p>

      <ul style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 18, listStyle: 'none', padding: 0 }}>
        {items.map(({ icon: Icon, tKey, dKey }) => (
          <li key={tKey} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span
              aria-hidden
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--sky-soft)', color: 'var(--navy)',
                display: 'grid', placeItems: 'center', flexShrink: 0,
                marginTop: 2,
              }}
            >
              <Icon size={18} />
            </span>
            <div>
              <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 15, color: 'var(--navy)', margin: '0 0 3px' }}>
                {t(tKey)}
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: 0, lineHeight: 1.55, maxWidth: 460 }}>
                {t(dKey)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AccountLoginPage() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1">
        <section className="section-bg-sky-soft">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-14 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-center">
              <Benefits t={t} />
              <Suspense fallback={<div className="card-mk" style={{ padding: 32, height: 360 }} />}>
                <LoginForm t={t} />
              </Suspense>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
