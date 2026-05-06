'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export default function WachtwoordVergetenPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/account/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Er ging iets mis. Probeer het opnieuw.');
        return;
      }
      setDone(true);
    } catch {
      setError('Verbindingsfout. Probeer het zo opnieuw.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1 flex items-center justify-center" style={{ padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-mk"
              style={{ padding: 32, textAlign: 'center' }}
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
                Check je inbox
              </h2>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 20px', lineHeight: 1.55 }}>
                Als <strong>{email}</strong> bij ons bekend is, hebben we een link gestuurd om een nieuw wachtwoord in te stellen. De link werkt 7 dagen.
              </p>
              <Link href="/account/login" className="btn btn-ghost">Terug naar inloggen</Link>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={submit}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="card-mk"
              style={{ padding: 32 }}
            >
              <span className="eyebrow-mk">Klantportaal</span>
              <h1 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 24, color: 'var(--navy)', margin: '4px 0 6px' }}>
                Wachtwoord vergeten
              </h1>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 20px', lineHeight: 1.55 }}>
                Vul je e-mailadres in. We sturen je een link om een nieuw wachtwoord te kiezen.
              </p>

              <label style={{ display: 'block', marginBottom: 6 }}>
                <span style={{ display: 'block', fontSize: 11, fontFamily: 'var(--sora)', textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--muted)', marginBottom: 4 }}>
                  E-mailadres
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--line)', fontSize: 15, background: '#fff' }}
                />
              </label>

              {error && (
                <p style={{ fontSize: 13, color: 'var(--red)', margin: '12px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={14} aria-hidden /> {error}
                </p>
              )}

              <button type="submit" disabled={submitting || !email} className="btn btn-primary btn-block" style={{ marginTop: 18 }}>
                {submitting ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Mail size={15} aria-hidden />}
                Stuur reset-link
              </button>

              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '20px 0 0', textAlign: 'center' }}>
                <Link href="/account/login" style={{ color: 'var(--navy)', textDecoration: 'underline' }}>Terug naar inloggen</Link>
              </p>
            </motion.form>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
