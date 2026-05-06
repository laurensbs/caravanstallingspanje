'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, Lock } from 'lucide-react';
import InfoBanner from './InfoBanner';
import CampingPicker from './CampingPicker';
import Stepper from './Stepper';
import SuccessScreen from './SuccessScreen';
import { useLocale } from './LocaleProvider';
import MarketingPage from './marketing/MarketingPage';
import { MotionShake } from './motion/MotionPrimitives';

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

// Form-input in mockup-stijl (matched met .field-mk uit globals.css):
// witte fill, line-2 border, navy focus-ring. Komt op /koelkast, /contact,
// /ideeen, en in alle MultiStepShell/ServicePageShell forms terecht.
const inputCls =
  'cs-mk-input w-full h-12 px-3.5 text-[14px] bg-white text-[color:var(--ink)] border border-[color:var(--line-2)] rounded-[8px] transition-colors placeholder:text-[color:var(--muted-2)] focus:outline-none focus:border-[color:var(--navy)] focus:ring-[3px] focus:ring-[color:rgba(47,66,84,0.10)]';

export const fieldCls = inputCls;

export function Field({ label, required, children, hint }: { label: string; required?: boolean; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-2">
      <label
        className="block"
        style={{
          fontFamily: 'var(--sora)',
          fontWeight: 600,
          fontSize: 12,
          color: 'var(--navy)',
          letterSpacing: 0.2,
          marginBottom: 4,
        }}
      >
        {label}
        {required && (
          <span className="ml-0.5" style={{ color: 'var(--orange-d)' }}>*</span>
        )}
      </label>
      {children}
      {hint && (
        <p style={{ fontSize: 11.5, color: 'var(--muted)', fontFamily: 'var(--inter)', marginTop: 4 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2
        style={{
          fontFamily: 'var(--sora)',
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: 2.4,
          textTransform: 'uppercase',
          color: 'var(--muted)',
        }}
      >
        {title}
      </h2>
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
  icon,
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
  icon?: import('lucide-react').LucideIcon;
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
    <MarketingPage
      hero={{
        title,
        intro,
        back: { href: '/', label: t('common.brand') },
        icon,
        variant: 'compact',
      }}
    >
      <section className="max-w-[820px] w-full mx-auto px-5 sm:px-10 py-12 sm:py-16">
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: E }}
          onSubmit={onSubmit}
          className="card-mk card-lift space-y-8"
          style={{ padding: 32 }}
        >
          <InfoBanner>
            <strong>{t('banner.important')}</strong> {t('banner.match-hint')}
          </InfoBanner>

          <div className="space-y-9">{children}</div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#991B1B',
                padding: 14,
                borderRadius: 10,
                fontSize: 13.5,
              }}
            >
              {error}
            </motion.div>
          )}

          <div className="pt-6 border-t" style={{ borderColor: 'var(--line)' }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-block disabled:opacity-50"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" aria-hidden /> : null}
              {submitting
                ? (paid ? t('common.forwarding') : t('common.sending'))
                : (paid ? t('common.continue-to-pay') : t('common.send-request'))}
              {!submitting && <ArrowRight size={17} aria-hidden />}
            </button>
            <p className="text-center mt-3" style={{ fontSize: 11.5, color: 'var(--muted)', fontFamily: 'var(--inter)' }}>
              {paid ? t('common.stripe-footer-paid') : t('common.email-confirmation-footer')}
            </p>
          </div>
        </motion.form>
      </section>

      {/* Stripe-redirect overlay: voorkomt 'flash of old form' tussen submit en window.location.href */}
      <AnimatePresence>
        {paid && submitting && <RedirectOverlay />}
      </AnimatePresence>
    </MarketingPage>
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
  /** Sfeer-icoon rechts in de hero (cream-disc met glow). */
  icon?: import('lucide-react').LucideIcon;
  /** Kleur-accent voor hero glow + tag. */
  accent?: 'cyan' | 'amber' | 'violet' | 'default';
  /** Inline samenvatting van form-validatie-errors (rhf, klant-vriendelijk).
   *  Verschijnt onder summary, boven de submit-knop. Onafhankelijk van
   *  `error` (server-side). */
  inlineError?: string | null;
  /** Increment-trigger om MotionShake opnieuw te firen op de error-banner. */
  errorTrigger?: number;
  /** Optionele rechter-aside met content (product-card, features, FAQ etc.).
   *  Verschijnt naast de form op desktop, onder de form op mobiel. */
  aside?: ReactNode;
  /** Optionele content boven de form (binnen dezelfde page-container).
   *  Bv. "wat krijg je"-strook, mini-features-grid. */
  preForm?: ReactNode;
  /** Optionele content onder de form. Bv. FAQ-sectie. */
  postForm?: ReactNode;
}

export function MultiStepShell({
  title, intro, step1, step2, step1Valid,
  onSubmit, submitting, error, done, doneTitle, doneBody, publicCode,
  paid = false, summary, eyebrow, eyebrowIcon, icon, accent = 'default',
  inlineError, errorTrigger = 0, aside, preForm, postForm,
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

  // eyebrowIcon en accent worden niet meer visueel gebruikt op cream-canvas;
  // we behouden ze als props (geen breaking-change voor callers).
  void eyebrowIcon;
  void accent;

  return (
    <MarketingPage
      hero={{
        title,
        intro,
        eyebrow,
        back: { href: '/', label: t('common.brand') },
        icon,
        variant: 'compact',
      }}
    >
      {preForm && (
        <section className="max-w-[1200px] w-full mx-auto px-5 sm:px-10 py-10 sm:py-14">
          {preForm}
        </section>
      )}

      <section className="max-w-[1200px] w-full mx-auto px-5 sm:px-10 py-8 sm:py-12">
        <div className={aside ? 'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-10 items-start' : ''}>
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
          className="card-mk card-lift"
          style={{ padding: 32 }}
        >
          <Stepper current={step} steps={stepLabels} />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: E }}
            className="mb-7"
          >
            <InfoBanner>
              <strong>{t('banner.important')}</strong> {t('banner.match-hint')}
            </InfoBanner>
          </motion.div>
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

          {(error || inlineError) && (
            <MotionShake trigger={errorTrigger + (error ? 1000 : 0)}>
              <div
                role="alert"
                aria-live="polite"
                className="mt-6"
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  padding: 14,
                  borderRadius: 10,
                  fontSize: 13.5,
                }}
              >
                {error || inlineError}
              </div>
            </MotionShake>
          )}

          <div className="mt-9 pt-6 border-t flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between" style={{ borderColor: 'var(--line)' }}>
            {step === 1 ? (
              <button
                type="button"
                onClick={() => setStep(0)}
                className="btn btn-ghost w-full sm:w-auto"
              >
                <ArrowLeft size={15} aria-hidden /> {t('common.back')}
              </button>
            ) : (
              <span aria-hidden className="hidden sm:block" />
            )}
            {step === 0 ? (
              <button
                type="button"
                disabled={!step1Valid}
                onClick={goNext}
                className="btn btn-primary w-full sm:w-auto sm:ml-auto disabled:opacity-50"
              >
                {t('common.next')} <ArrowRight size={17} aria-hidden />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full sm:w-auto sm:ml-auto disabled:opacity-50"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" aria-hidden /> : null}
                {submitting
                  ? (paid ? t('common.forwarding') : t('common.sending'))
                  : (paid ? t('common.continue-to-pay') : t('common.send-request'))}
                {!submitting && <ArrowRight size={17} aria-hidden />}
              </button>
            )}
          </div>
          <p className="text-center mt-4" style={{ fontSize: 11.5, color: 'var(--muted)', fontFamily: 'var(--inter)' }}>
            {step === 1 ? (paid ? t('common.stripe-footer-paid') : t('common.email-confirmation-footer')) : ' '}
          </p>
        </form>

        {aside && (
          <aside className="lg:sticky lg:top-6 self-start">
            {aside}
          </aside>
        )}
        </div>
      </section>

      {postForm && (
        <section className="max-w-[1200px] w-full mx-auto px-5 sm:px-10 py-12 sm:py-16">
          {postForm}
        </section>
      )}

      <AnimatePresence>
        {paid && submitting && <RedirectOverlay />}
      </AnimatePresence>
    </MarketingPage>
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
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(248, 251, 253, 0.96)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-center max-w-sm"
      >
        <div
          className="inline-flex items-center justify-center mb-5"
          style={{
            width: 48, height: 48, borderRadius: 999,
            background: 'var(--sky-soft)', border: '1px solid var(--sky)',
            color: 'var(--navy)',
          }}
        >
          <Lock size={18} aria-hidden />
        </div>
        <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 18, color: 'var(--navy)', margin: '0 0 6px' }}>
          {t('common.stripe-redirect')}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>
          {t('common.stripe-secure')}
        </p>
        <div className="flex justify-center mt-5">
          <Loader2 size={16} className="animate-spin" aria-hidden style={{ color: 'var(--muted)' }} />
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
