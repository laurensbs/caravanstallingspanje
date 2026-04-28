'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2, Lock } from 'lucide-react';
import Link from 'next/link';
import InfoBanner from './InfoBanner';

export type ContactState = {
  name: string;
  email: string;
  phone: string;
  registration: string;
  brand: string;
  model: string;
  locationHint: string;
};

export const emptyContact: ContactState = {
  name: '',
  email: '',
  phone: '',
  registration: '',
  brand: '',
  model: '',
  locationHint: '',
};

const inputCls =
  'w-full h-10 px-3 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors placeholder:text-text-subtle';

export const fieldCls = inputCls;

export function Field({ label, required, children, hint }: { label: string; required?: boolean; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-text">
        {label}
        {required && <span className="text-text-subtle ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-text-subtle">{hint}</p>}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">{title}</h2>
      {children}
    </section>
  );
}

export function ContactFields({
  state,
  onChange,
  showRegistration = true,
  showLocation = true,
}: {
  state: ContactState;
  onChange: (next: ContactState) => void;
  showRegistration?: boolean;
  showLocation?: boolean;
}) {
  const set = (key: keyof ContactState, value: string) => onChange({ ...state, [key]: value });
  return (
    <div className="space-y-3">
      <Field label="Naam" required>
        <input required value={state.name} onChange={e => set('name', e.target.value)} autoComplete="name" className={inputCls} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="E-mail" required>
          <input required type="email" value={state.email} onChange={e => set('email', e.target.value)} autoComplete="email" className={inputCls} />
        </Field>
        <Field label="Telefoon" required>
          <input required type="tel" value={state.phone} onChange={e => set('phone', e.target.value)} autoComplete="tel" className={inputCls} />
        </Field>
      </div>
      {showRegistration && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Kenteken">
            <input value={state.registration} onChange={e => set('registration', e.target.value)} placeholder="12-AB-34" className={inputCls} />
          </Field>
          <Field label="Merk">
            <input value={state.brand} onChange={e => set('brand', e.target.value)} placeholder="Hobby" className={inputCls} />
          </Field>
          <Field label="Model">
            <input value={state.model} onChange={e => set('model', e.target.value)} placeholder="Excellent" className={inputCls} />
          </Field>
        </div>
      )}
      {showLocation && (
        <Field label="Camping / locatie" hint="Optioneel — bv. 'Camping Eurocamping plek 12'">
          <input value={state.locationHint} onChange={e => set('locationHint', e.target.value)} className={inputCls} />
        </Field>
      )}
    </div>
  );
}

export function ServicePageShell({
  title,
  intro,
  onSubmit,
  submitting,
  error,
  done,
  doneTitle = 'Aanvraag ontvangen',
  doneBody,
  publicCode,
  paid = false,
  children,
}: {
  title: string;
  intro: string;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  error: string;
  done: boolean;
  doneTitle?: string;
  doneBody?: string;
  publicCode?: string | null;
  paid?: boolean;
  children: ReactNode;
}) {
  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md text-center"
        >
          <div className="w-12 h-12 rounded-full bg-success-soft text-success flex items-center justify-center mx-auto mb-6">
            <Check size={20} />
          </div>
          <h1 className="text-2xl font-medium tracking-tight mb-3">{doneTitle}</h1>
          <p className="text-text-muted leading-relaxed">
            {doneBody || 'Bedankt! Je krijgt zo een bevestiging per e-mail. Onze werkplaats neemt zo snel mogelijk contact op.'}
          </p>
          {publicCode && (
            <p className="text-sm text-text-muted mt-6">
              Referentie: <span className="font-mono text-text">{publicCode}</span>
            </p>
          )}
          <Link
            href="/diensten"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text mt-8"
          >
            <ArrowLeft size={14} /> Terug naar diensten
          </Link>
        </motion.div>
      </main>
    );
  }

  const E = [0.16, 1, 0.3, 1] as const;
  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-6 py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: E }}
        >
          <Link href="/diensten" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text mb-6 transition-colors">
            <ArrowLeft size={14} /> Diensten
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: E }}
        >
          <h1 className="text-[28px] sm:text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-text-muted mt-2 leading-relaxed text-[14px] sm:text-base">{intro}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: E }}
          className="mt-6"
        >
          <InfoBanner>
            <strong>Belangrijk:</strong> gebruik het e-mailadres en telefoonnummer dat bij ons bekend is. Zo koppelen we je aanvraag automatisch aan je klantgegevens.
          </InfoBanner>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.45, ease: E }}
          onSubmit={onSubmit}
          className="mt-6 space-y-7"
        >
          {children}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[var(--radius-md)] bg-danger-soft text-danger px-4 py-3 text-sm"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="press-spring w-full h-12 rounded-[var(--radius-md)] bg-accent text-accent-fg font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {submitting
              ? (paid ? 'Doorsturen…' : 'Versturen…')
              : (paid ? 'Doorgaan naar betalen' : 'Aanvraag versturen')}
            {!submitting && <ArrowRight size={16} className="transition-transform" />}
          </button>
          <p className="text-xs text-text-muted text-center">
            {paid
              ? 'Je gaat door naar onze beveiligde Stripe-betaalpagina.'
              : 'Je krijgt direct een bevestiging per e-mail. Onze werkplaats neemt zo snel mogelijk contact op.'}
          </p>
        </motion.form>
      </div>

      {/* Stripe-redirect overlay: voorkomt 'flash of old form' tussen submit en window.location.href */}
      <AnimatePresence>
        {paid && submitting && <RedirectOverlay />}
      </AnimatePresence>
    </main>
  );
}

function RedirectOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-sm flex items-center justify-center px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-center max-w-sm"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface border border-border mb-5">
          <Lock size={18} className="text-text" />
        </div>
        <h2 className="text-base font-semibold mb-1">Doorsturen naar Stripe…</h2>
        <p className="text-[13px] text-text-muted leading-relaxed">
          Je betaling verloopt via een beveiligde verbinding.
        </p>
        <div className="flex justify-center mt-5">
          <Loader2 size={16} className="animate-spin text-text-muted" />
        </div>
      </motion.div>
    </motion.div>
  );
}

// Helper hook combining state + submit logic so each page stays small.
export function useServiceSubmit<T>(endpoint: string) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [publicCode, setPublicCode] = useState<string | null>(null);

  const submit = async (payload: T) => {
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Er ging iets mis');
        return;
      }
      // Direct doorsturen naar Stripe Checkout indien aangeleverd.
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setPublicCode(data.publicCode || null);
      setDone(true);
    } catch {
      setError('Verbindingsfout');
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, error, done, publicCode, setError };
}
