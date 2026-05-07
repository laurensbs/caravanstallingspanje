'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { KeyRound, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

function WelkomShell() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';

  const [status, setStatus] = useState<'loading' | 'invalid' | 'ready' | 'done'>('loading');
  const [emailMasked, setEmailMasked] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }
    let alive = true;
    fetch(`/api/account/welcome-password?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        if (!alive) return;
        if (!r.ok) { setStatus('invalid'); return; }
        const d = await r.json();
        setEmailMasked(d.emailMasked || '');
        setStatus('ready');
      })
      .catch(() => { if (alive) setStatus('invalid'); });
    return () => { alive = false; };
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Wachtwoord moet minimaal 8 tekens zijn.'); return; }
    if (password !== confirm) { setError('Bevestiging komt niet overeen.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/account/welcome-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Instellen mislukt.');
        if (res.status === 410) setStatus('invalid');
        return;
      }
      setStatus('done');
      setTimeout(() => router.push('/account/login'), 1500);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1 flex items-center justify-center" style={{ padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          {status === 'loading' && (
            <div className="card-mk text-center" style={{ padding: 40 }}>
              <Loader2 className="animate-spin" style={{ color: 'var(--muted)' }} />
            </div>
          )}

          {status === 'invalid' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-mk text-center"
              style={{ padding: 32 }}
            >
              <div
                aria-hidden
                style={{
                  width: 56, height: 56, margin: '0 auto 14px', borderRadius: 999,
                  background: 'rgba(220,38,38,0.10)', color: 'var(--red)',
                  display: 'grid', placeItems: 'center',
                }}
              >
                <AlertCircle size={28} />
              </div>
              <h1 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 20, color: 'var(--navy)', margin: '0 0 8px' }}>
                Link is niet (meer) geldig
              </h1>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 18px' }}>
                Deze welkomstlink is verlopen of al gebruikt. Vraag ons om een nieuwe te sturen, of log in als je al een wachtwoord hebt.
              </p>
              <Link href="/account/login" className="btn btn-primary">Naar inloggen</Link>
            </motion.div>
          )}

          {status === 'ready' && (
            <motion.form
              onSubmit={submit}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="card-mk"
              style={{ padding: 32 }}
            >
              <span className="eyebrow-mk">Welkom</span>
              <h1 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 24, color: 'var(--navy)', margin: '4px 0 6px' }}>
                Kies je wachtwoord
              </h1>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 20px', lineHeight: 1.55 }}>
                Stel je wachtwoord in voor je klantportaal{emailMasked ? <> — voor account <strong>{emailMasked}</strong></> : ''}.
              </p>

              <label style={{ display: 'block', marginBottom: 14 }}>
                <span style={{ display: 'block', fontSize: 11, fontFamily: 'var(--sora)', textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--muted)', marginBottom: 4 }}>
                  Nieuw wachtwoord
                </span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--line)', fontSize: 15, background: '#fff' }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: 6 }}>
                <span style={{ display: 'block', fontSize: 11, fontFamily: 'var(--sora)', textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--muted)', marginBottom: 4 }}>
                  Bevestig
                </span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--line)', fontSize: 15, background: '#fff' }}
                />
              </label>

              {error && (
                <p style={{ fontSize: 13, color: 'var(--red)', margin: '12px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={14} aria-hidden /> {error}
                </p>
              )}

              <button type="submit" disabled={submitting} className="btn btn-primary btn-block" style={{ marginTop: 18 }}>
                {submitting ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <KeyRound size={15} aria-hidden />}
                Wachtwoord instellen
              </button>
            </motion.form>
          )}

          {status === 'done' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-mk text-center"
              style={{ padding: 32 }}
            >
              <div
                aria-hidden
                style={{
                  width: 56, height: 56, margin: '0 auto 14px', borderRadius: 999,
                  background: 'var(--green-soft)', color: 'var(--green)',
                  display: 'grid', placeItems: 'center', border: '2px solid var(--green)',
                }}
              >
                <CheckCircle2 size={28} />
              </div>
              <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 20, color: 'var(--navy)', margin: '0 0 8px' }}>
                Klaar — je gaat door naar inloggen
              </h2>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>
                Een moment…
              </p>
            </motion.div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export default function WelkomPage() {
  return (
    <Suspense fallback={null}>
      <WelkomShell />
    </Suspense>
  );
}
