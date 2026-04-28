'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Loader2, AlertTriangle, Lock } from 'lucide-react';
import { calculatePrice, PRICES, MIN_DAYS, type DeviceType } from '@/lib/pricing';
import InfoBanner from '@/components/InfoBanner';
import CampingPicker from '@/components/CampingPicker';
import PublicHero from '@/components/PublicHero';
import { useLocale } from '@/components/LocaleProvider';
import type { StringKey } from '@/lib/i18n';

type FormState = {
  device_type: DeviceType;
  name: string;
  email: string;
  phone: string;
  camping: string;
  spot_number: string;
  start_date: string;
  end_date: string;
  notes: string;
};

const empty: FormState = {
  device_type: 'Grote koelkast',
  name: '',
  email: '',
  phone: '',
  camping: '',
  spot_number: '',
  start_date: '',
  end_date: '',
  notes: '',
};

// Localized device-type labels — keys keep the value DB-stable (NL).
const DEVICE_LABEL_KEY: Record<DeviceType, StringKey> = {
  'Grote koelkast': 'fridge.device-large',
  'Tafelmodel koelkast': 'fridge.device-table',
};
const DEVICE_LABEL_LOWER_KEY: Record<DeviceType, StringKey> = {
  'Grote koelkast': 'fridge.device-large-lower',
  'Tafelmodel koelkast': 'fridge.device-table-lower',
};
const DEVICE_PLURAL_KEY: Record<DeviceType, StringKey> = {
  'Grote koelkast': 'fridge.large-plural',
  'Tafelmodel koelkast': 'fridge.table-plural',
};

export default function KoelkastBestelPagina() {
  const { t, locale } = useLocale();
  const formatEur = (eur: number) =>
    new Intl.NumberFormat(locale === 'nl' ? 'nl-NL' : 'en-IE', {
      style: 'currency',
      currency: 'EUR',
    }).format(eur);
  const [form, setForm] = useState<FormState>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ total: number; days: number } | null>(null);
  const [soldOut, setSoldOut] = useState(false);
  const [waitlistDone, setWaitlistDone] = useState(false);

  const price = useMemo(() => {
    if (!form.start_date || !form.end_date) return null;
    if (new Date(form.end_date) <= new Date(form.start_date)) return null;
    try {
      return calculatePrice(form.device_type, form.start_date, form.end_date);
    } catch { return null; }
  }, [form.device_type, form.start_date, form.end_date]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/order/fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.status === 409 && data.soldOut) {
        setSoldOut(true);
        return;
      }
      if (!res.ok || !data.success) {
        setError(data.error || t('common.something-wrong'));
        return;
      }
      // Als Stripe Checkout beschikbaar is, redirect direct.
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      // Fallback: betaling later geregeld door admin.
      setDone({ total: data.total, days: data.days });
    } catch {
      setError(t('common.connection-error'));
    } finally {
      setSubmitting(false);
    }
  };

  const submitWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/order/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || t('common.something-wrong'));
        return;
      }
      setWaitlistDone(true);
    } catch {
      setError(t('common.connection-error'));
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-medium tracking-tight mb-3">{t('fridge.confirm-title')}</h1>
          <p className="text-text-muted leading-relaxed">
            {t('fridge.confirm-body', done.days, formatEur(done.total))}
          </p>
          <p className="text-sm text-text-muted mt-8">
            {t('common.questions')} <a href="mailto:info@caravanstalling-spanje.com" className="text-text underline-offset-4 hover:underline">info@caravanstalling-spanje.com</a>
          </p>
        </motion.div>
      </main>
    );
  }

  if (waitlistDone) {
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
          <h1 className="text-2xl font-medium tracking-tight mb-3">{t('fridge.waitlist-on-title')}</h1>
          <p className="text-text-muted leading-relaxed">
            {t('fridge.waitlist-on-body-one', t(DEVICE_LABEL_LOWER_KEY[form.device_type]))}
          </p>
        </motion.div>
      </main>
    );
  }

  if (soldOut) {
    return (
      <main className="min-h-screen bg-bg">
        <div className="max-w-md mx-auto px-6 py-12 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-12 h-12 rounded-full bg-warning-soft text-warning flex items-center justify-center mb-6">
              <AlertTriangle size={20} />
            </div>
            <h1 className="text-2xl font-medium tracking-tight mb-2">{t('fridge.sold-out')}</h1>
            <p className="text-text-muted leading-relaxed mb-2">
              {t('fridge.sold-out-body-one', t(DEVICE_PLURAL_KEY[form.device_type]))}
            </p>
            <p className="text-text-muted leading-relaxed mb-8">
              {t('fridge.sold-out-help')}
            </p>
            <form onSubmit={submitWaitlist} className="space-y-3">
              {error && (
                <div className="rounded-[var(--radius-md)] bg-danger-soft text-danger px-4 py-3 text-sm">{error}</div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="press-spring w-full h-12 rounded-[var(--radius-md)] bg-accent text-accent-fg font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {submitting ? t('common.busy') : t('fridge.add-to-waitlist')}
              </button>
              <button
                type="button"
                onClick={() => { setSoldOut(false); setError(''); }}
                className="press-spring w-full h-12 rounded-[var(--radius-md)] border border-border bg-surface hover:border-border-strong text-sm font-medium transition-colors"
              >
                {t('fridge.adjust-period')}
              </button>
            </form>
            <p className="text-xs text-text-muted mt-6">
              {t('fridge.privacy-note')}
            </p>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg">
      <PublicHero
        back={{ href: '/diensten', label: t('common.services-link') }}
        title={t('fridge.heading')}
        intro={t('fridge.intro')}
      />
      <div className="max-w-3xl mx-auto px-6 py-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-[var(--radius-xl)] overflow-hidden border border-border bg-surface aspect-[4/3] sm:aspect-[16/9] relative"
        >
          <Image
            src="/images/koelkast.webp"
            alt="Koelkast op camping"
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </motion.div>

        <div className="mt-8 sm:mt-10">
          <InfoBanner>
            <strong>{t('banner.important')}</strong> {t('banner.match-hint')}
          </InfoBanner>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-8">
          {/* Device choice */}
          <section>
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
              {t('fridge.which')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(PRICES) as DeviceType[]).map(type => {
                const selected = form.device_type === type;
                const dayPrice = Math.ceil((PRICES[type] / 7) * 100) / 100;
                return (
                  <motion.button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, device_type: type })}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                    className={`text-left p-5 rounded-[var(--radius-xl)] border transition-all ${
                      selected
                        ? 'border-accent bg-surface shadow-md'
                        : 'border-border bg-surface hover:border-border-strong'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium">{t(DEVICE_LABEL_KEY[type])}</span>
                      <div className={`w-4 h-4 rounded-full border-2 transition-colors ${selected ? 'border-accent bg-accent' : 'border-border'}`}>
                        {selected && <Check size={10} className="text-accent-fg" strokeWidth={3} />}
                      </div>
                    </div>
                    <div className="text-2xl font-medium tabular-nums">
                      {formatEur(PRICES[type])}
                      <span className="text-sm font-normal text-text-muted"> {t('fridge.per-week')}</span>
                    </div>
                    <div className="text-xs text-text-muted mt-1">{t('fridge.afterwards')} {formatEur(dayPrice)}{t('fridge.per-day')}</div>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Period */}
          <section>
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
              {t('fridge.period')}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('fridge.start-date')} required>
                <input
                  type="date"
                  required
                  value={form.start_date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={e => setForm({ ...form, start_date: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label={t('fridge.end-date')} required>
                <input
                  type="date"
                  required
                  value={form.end_date}
                  min={form.start_date || new Date().toISOString().slice(0, 10)}
                  onChange={e => setForm({ ...form, end_date: e.target.value })}
                  className={inputCls}
                />
              </Field>
            </div>
            <p className="text-xs text-text-muted mt-2">{t('fridge.minimum-days', MIN_DAYS)}</p>
          </section>

          {/* Camping */}
          <section>
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
              {t('fridge.camping')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3">
              <Field label={t('fridge.camping')} required>
                <CampingPicker
                  value={form.camping}
                  onChange={(name) => setForm({ ...form, camping: name })}
                  placeholder={t('fridge.camping-placeholder')}
                  required
                  ariaLabel={t('fridge.camping')}
                />
              </Field>
              <Field label={t('fridge.spot-number')}>
                <input
                  value={form.spot_number}
                  onChange={e => setForm({ ...form, spot_number: e.target.value })}
                  placeholder="A12"
                  className={inputCls}
                />
              </Field>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
              {t('contact.section-heading')}
            </h2>
            <div className="space-y-3">
              <Field label={t('contact.name')} required>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoComplete="name" className={inputCls} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t('contact.email')} required>
                  <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} autoComplete="email" className={inputCls} />
                </Field>
                <Field label={t('contact.phone')} required>
                  <input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} autoComplete="tel" className={inputCls} />
                </Field>
              </div>
              <Field label={`${t('contact.note')} ${t('common.optional')}`}>
                <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputCls + ' min-h-[60px] py-2 resize-none'} />
              </Field>
            </div>
          </section>

          {/* Price summary */}
          <AnimatePresence>
            {price && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="rounded-[var(--radius-xl)] bg-surface-2 border border-border p-5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">{t('fridge.first-week')}</span>
                    <span className="tabular-nums">{formatEur(price.weekPrice)}</span>
                  </div>
                  {price.extraDays > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">
                        {t(price.extraDays === 1 ? 'fridge.extra-days-one' : 'fridge.extra-days-many', price.extraDays, formatEur(price.dayPrice))}
                      </span>
                      <span className="tabular-nums">{formatEur(price.extraTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-medium">{t('fridge.total-days', price.days)}</span>
                    <span className="font-medium tabular-nums text-lg">{formatEur(price.total)}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="rounded-[var(--radius-md)] bg-danger-soft text-danger px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !price}
            className="press-spring w-full h-12 rounded-[var(--radius-md)] bg-accent text-accent-fg font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {submitting ? t('common.forwarding') : t('common.continue-to-pay')}
            {!submitting && <ArrowRight size={16} />}
          </button>
          <p className="text-xs text-text-muted text-center">
            {t('common.stripe-footer-paid')}
          </p>
        </form>
      </div>

      <AnimatePresence>
        {submitting && (
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
              <p className="text-[13px] text-text-muted leading-relaxed">
                {t('common.stripe-secure')}
              </p>
              <div className="flex justify-center mt-5">
                <Loader2 size={16} className="animate-spin text-text-muted" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

const inputCls = 'w-full h-10 px-3 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors placeholder:text-text-subtle';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-text">
        {label}{required && <span className="text-text-subtle ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
