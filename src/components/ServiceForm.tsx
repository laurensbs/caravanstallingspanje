'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, Lock } from 'lucide-react';
import InfoBanner from './InfoBanner';
import CampingPicker from './CampingPicker';
import PublicHero from './PublicHero';
import Stepper from './Stepper';
import SuccessScreen from './SuccessScreen';
import { useLocale } from './LocaleProvider';
import PublicFooter from './PublicFooter';

export type ContactState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  vat_number: string;
  registration: string;
  brand: string;
  model: string;
  locationHint: string;
};

export const emptyContact: ContactState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  postal_code: '',
  city: '',
  country: 'Nederland',
  vat_number: '',
  registration: '',
  brand: '',
  model: '',
  locationHint: '',
};

const inputCls =
  'w-full h-12 px-3.5 text-[15px] bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors placeholder:text-text-subtle';

export const fieldCls = inputCls;

export function Field({ label, required, children, hint }: { label: string; required?: boolean; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-2">
      <label className="block text-[13px] font-medium text-text">
        {label}
        {required && <span className="text-text-subtle ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[12px] text-text-subtle">{hint}</p>}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.18em]">{title}</h2>
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
  const { t } = useLocale();
  const set = (key: keyof ContactState, value: string) => onChange({ ...state, [key]: value });
  return (
    <div className="space-y-3">
      <Field label={t('contact.name')} required>
        <input required value={state.name} onChange={e => set('name', e.target.value)} autoComplete="name" className={inputCls} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label={t('contact.email')} required>
          <input required type="email" value={state.email} onChange={e => set('email', e.target.value)} autoComplete="email" className={inputCls} />
        </Field>
        <Field label={t('contact.phone')} required>
          <input required type="tel" value={state.phone} onChange={e => set('phone', e.target.value)} autoComplete="tel" className={inputCls} />
        </Field>
      </div>
      {/* Adresgegevens — verplicht voor de boekhouding-pro forma in Holded. */}
      <Field label="Adres" required>
        <input
          required
          value={state.address}
          onChange={e => set('address', e.target.value)}
          autoComplete="street-address"
          placeholder="Straat 12"
          className={inputCls}
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Postcode" required>
          <input
            required
            value={state.postal_code}
            onChange={e => set('postal_code', e.target.value)}
            autoComplete="postal-code"
            placeholder="1234 AB"
            className={inputCls}
          />
        </Field>
        <Field label="Plaats" required>
          <input
            required
            value={state.city}
            onChange={e => set('city', e.target.value)}
            autoComplete="address-level2"
            placeholder="Amsterdam"
            className={inputCls}
          />
        </Field>
        <Field label="Land" required>
          <input
            required
            value={state.country}
            onChange={e => set('country', e.target.value)}
            autoComplete="country-name"
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="BTW-nummer" hint="Optioneel — alleen voor zakelijke klanten">
        <input
          value={state.vat_number}
          onChange={e => set('vat_number', e.target.value)}
          placeholder="NL123456789B01"
          className={inputCls}
        />
      </Field>
      {showRegistration && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label={t('contact.registration')}>
            <input value={state.registration} onChange={e => set('registration', e.target.value)} placeholder="12-AB-34" className={inputCls} />
          </Field>
          <Field label={t('contact.brand')}>
            <input value={state.brand} onChange={e => set('brand', e.target.value)} placeholder="Hobby" className={inputCls} />
          </Field>
          <Field label={t('contact.model')}>
            <input value={state.model} onChange={e => set('model', e.target.value)} placeholder="Excellent" className={inputCls} />
          </Field>
        </div>
      )}
      {showLocation && (
        <Field label={t('contact.location-hint-label')} hint={t('contact.location-hint-help')}>
          <CampingPicker
            value={state.locationHint}
            onChange={(name) => set('locationHint', name)}
            placeholder={t('fridge.camping-placeholder')}
            ariaLabel={t('contact.location-hint-label')}
          />
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
  doneTitle,
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
  const { t } = useLocale();
  if (done) {
    return (
      <SuccessScreen
        title={doneTitle ?? t('thanks.request-title')}
        body={doneBody ?? t('thanks.request-body')}
        reference={publicCode || null}
      />
    );
  }

  const E = [0.16, 1, 0.3, 1] as const;
  return (
    <main
      className="min-h-screen page-public page-public-dark flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0A1929 0%, #050D18 100%)' }}
    >
      <PublicHero
        back={{ href: '/', label: t('common.brand') }}
        title={title}
        intro={intro}
      />
      <div className="flex-1 max-w-2xl w-full mx-auto px-5 sm:px-6 py-8 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: E }}
        >
          <InfoBanner>
            <strong>{t('banner.important')}</strong> {t('banner.match-hint')}
          </InfoBanner>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45, ease: E }}
          onSubmit={onSubmit}
          className="mt-8 space-y-9"
        >
          {children}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[var(--radius-md)] bg-danger-soft text-danger px-4 py-3 text-[14px]"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="press-spring w-full h-14 rounded-[var(--radius-lg)] bg-accent text-accent-fg font-semibold text-[15px] hover:bg-accent-hover transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
            {submitting
              ? (paid ? t('common.forwarding') : t('common.sending'))
              : (paid ? t('common.continue-to-pay') : t('common.send-request'))}
            {!submitting && <ArrowRight size={17} className="transition-transform" />}
          </button>
          <p className="text-[12px] text-text-muted text-center">
            {paid ? t('common.stripe-footer-paid') : t('common.email-confirmation-footer')}
          </p>
        </motion.form>
      </div>

      {/* Stripe-redirect overlay: voorkomt 'flash of old form' tussen submit en window.location.href */}
      <AnimatePresence>
        {paid && submitting && <RedirectOverlay />}
      </AnimatePresence>
      <PublicFooter />
    </main>
  );
}

// ─── Multi-step shell ────────────────────────────────────
// Used by koelkast / service / stalling / transport — pages with multiple
// distinct decisions. Step 1 = "kiezen" (what + when + where), step 2 =
// contact + summary + submit. Pages own the form state and the
// "is step N valid" callback; the shell handles navigation, the
// Stepper, the back/next buttons and the Stripe redirect overlay.

interface MultiStepProps {
  title: string;
  intro: string;
  /** First step content (selectie). Page renders inputs; shell wraps them. */
  step1: ReactNode;
  /** Second step content (contact + samenvatting). */
  step2: ReactNode;
  /** Returns true when step1 is filled enough to advance. */
  step1Valid: boolean;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  error: string;
  done: boolean;
  doneTitle?: string;
  doneBody?: string;
  publicCode?: string | null;
  /** When true, last button says "Doorgaan naar betalen" + redirect overlay shows. */
  paid?: boolean;
  /** Optional sticky summary that shows on the right side on desktop. */
  summary?: ReactNode;
  /** Eyebrow boven de hero-titel, bv. "Vanaf één week". */
  eyebrow?: string;
  /** Lucide-icoon vóór de eyebrow. */
  eyebrowIcon?: ReactNode;
  /** Kleur-accent voor hero glow + tag. */
  accent?: 'cyan' | 'amber' | 'violet' | 'default';
}

export function MultiStepShell({
  title, intro, step1, step2, step1Valid,
  onSubmit, submitting, error, done, doneTitle, doneBody, publicCode,
  paid = false, summary, eyebrow, eyebrowIcon, accent = 'default',
}: MultiStepProps) {
  const { t } = useLocale();
  const [step, setStep] = useState(0);
  const E = [0.16, 1, 0.3, 1] as const;

  const stepLabels = [t('common.step-choose'), t('common.step-confirm')];

  if (done) {
    return (
      <SuccessScreen
        title={doneTitle ?? t('thanks.payment-title')}
        body={doneBody ?? t('thanks.payment-services')}
        reference={publicCode || null}
      />
    );
  }

  const goNext = () => {
    if (step === 0 && step1Valid) setStep(1);
  };

  return (
    <main
      className="min-h-screen page-public page-public-dark flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0A1929 0%, #050D18 100%)' }}
    >
      <PublicHero
        back={{ href: '/', label: t('common.brand') }}
        title={title}
        intro={intro}
        eyebrow={eyebrow}
        eyebrowIcon={eyebrowIcon}
        accent={accent}
      />
      <div className="flex-1 max-w-2xl w-full mx-auto px-5 sm:px-6 py-8 sm:py-14">
        <Stepper current={step} steps={stepLabels} />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: E }}
        >
          <InfoBanner>
            <strong>{t('banner.important')}</strong> {t('banner.match-hint')}
          </InfoBanner>
        </motion.div>

        <form
          onSubmit={(e) => {
            // Voorkom dat een per ongeluk-submit (bv. enter in date-input)
            // op step 1 de échte submit triggert. Alleen step 2 mag.
            if (step !== 1) {
              e.preventDefault();
              if (step1Valid) goNext();
              return;
            }
            onSubmit(e);
          }}
          className="mt-8"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: E }}
              className="space-y-9"
            >
              {step === 0 ? step1 : step2}
            </motion.div>
          </AnimatePresence>

          {step === 1 && summary && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35, ease: E }}
              className="mt-8"
            >
              {summary}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-[var(--radius-md)] bg-danger-soft text-danger px-4 py-3 text-[14px]"
            >
              {error}
            </motion.div>
          )}

          <div className="mt-10 flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between">
            {step === 1 ? (
              <button
                type="button"
                onClick={() => setStep(0)}
                className="press-spring inline-flex items-center justify-center gap-2 h-12 px-5 rounded-[var(--radius-md)] border border-border bg-surface hover:border-border-strong text-[14px] font-medium transition-colors w-full sm:w-auto"
              >
                <ArrowLeft size={15} /> {t('common.back')}
              </button>
            ) : (
              <span aria-hidden className="hidden sm:block" />
            )}
            {step === 0 ? (
              <button
                type="button"
                disabled={!step1Valid}
                onClick={goNext}
                className="press-spring inline-flex items-center justify-center gap-2 h-14 px-6 rounded-[var(--radius-lg)] bg-accent text-accent-fg font-semibold text-[15px] hover:bg-accent-hover transition-colors disabled:opacity-50 w-full sm:w-auto sm:ml-auto"
              >
                {t('common.next')} <ArrowRight size={17} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="press-spring inline-flex items-center justify-center gap-2 h-14 px-6 rounded-[var(--radius-lg)] bg-accent text-accent-fg font-semibold text-[15px] hover:bg-accent-hover transition-colors disabled:opacity-50 w-full sm:w-auto sm:ml-auto"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                {submitting
                  ? (paid ? t('common.forwarding') : t('common.sending'))
                  : (paid ? t('common.continue-to-pay') : t('common.send-request'))}
                {!submitting && <ArrowRight size={17} />}
              </button>
            )}
          </div>
          <p className="text-[12px] text-text-muted text-center mt-4">
            {step === 1 ? (paid ? t('common.stripe-footer-paid') : t('common.email-confirmation-footer')) : ' '}
          </p>
        </form>
      </div>

      <AnimatePresence>
        {paid && submitting && <RedirectOverlay />}
      </AnimatePresence>
      <PublicFooter />
    </main>
  );
}

function RedirectOverlay() {
  const { t } = useLocale();
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
        <h2 className="text-base font-semibold mb-1">{t('common.stripe-redirect')}</h2>
        <p className="text-[13px] text-text-muted leading-relaxed">{t('common.stripe-secure')}</p>
        <div className="flex justify-center mt-5">
          <Loader2 size={16} className="animate-spin text-text-muted" />
        </div>
      </motion.div>
    </motion.div>
  );
}

// Helper hook combining state + submit logic so each page stays small.
// Voor gratis flows (transport/repair/inspection) redirecten we direct naar
// /diensten/bedankt?ref=… zodat de klant een uniforme rijke ontvangstpagina
// te zien krijgt — geen inline done-state meer.
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
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      const ref = data.ref || data.publicCode;
      if (ref) {
        window.location.href = `/diensten/bedankt?ref=${encodeURIComponent(ref)}`;
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
