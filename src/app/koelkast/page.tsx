'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, AlertTriangle, Refrigerator } from 'lucide-react';
import { calculatePrice, PRICES, MIN_DAYS, type DeviceType } from '@/lib/pricing';
import {
  ContactFields, MultiStepShell, Section, Field, fieldCls, emptyContact,
  type ContactState,
} from '@/components/ServiceForm';
import CampingPicker from '@/components/CampingPicker';
import PublicHero from '@/components/PublicHero';
import { useLocale } from '@/components/LocaleProvider';
import type { StringKey } from '@/lib/i18n';

const DEVICE_LABEL_KEY: Record<DeviceType, StringKey> = {
  'Grote koelkast': 'fridge.device-large',
  'Tafelmodel koelkast': 'fridge.device-table',
  'Airco': 'airco.device-name',
};
const DEVICE_LABEL_LOWER_KEY: Record<DeviceType, StringKey> = {
  'Grote koelkast': 'fridge.device-large-lower',
  'Tafelmodel koelkast': 'fridge.device-table-lower',
  'Airco': 'airco.device-name',
};
const DEVICE_PLURAL_KEY: Record<DeviceType, StringKey> = {
  'Grote koelkast': 'fridge.large-plural',
  'Tafelmodel koelkast': 'fridge.table-plural',
  'Airco': 'airco.device-name',
};

type FormState = {
  device_type: DeviceType;
  start_date: string;
  end_date: string;
  camping: string;
  spot_number: string;
  notes: string;
};

const empty: FormState = {
  device_type: 'Grote koelkast',
  start_date: '',
  end_date: '',
  camping: '',
  spot_number: '',
  notes: '',
};

export default function KoelkastBestelPagina() {
  const { t, locale } = useLocale();
  const formatEur = (eur: number) =>
    new Intl.NumberFormat(locale === 'nl' ? 'nl-NL' : 'en-IE', {
      style: 'currency',
      currency: 'EUR',
    }).format(eur);

  const [form, setForm] = useState<FormState>(empty);
  const [contact, setContact] = useState<ContactState>(emptyContact);
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
    } catch {
      return null;
    }
  }, [form.device_type, form.start_date, form.end_date]);

  const step1Valid = !!(form.start_date && form.end_date && form.camping && price);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/order/fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_type: form.device_type,
          start_date: form.start_date,
          end_date: form.end_date,
          camping: form.camping,
          spot_number: form.spot_number,
          notes: form.notes,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
        }),
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
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
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
        body: JSON.stringify({
          device_type: form.device_type,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          camping: form.camping,
          spot_number: form.spot_number,
          start_date: form.start_date,
          end_date: form.end_date,
          notes: form.notes,
        }),
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

  // ── Done states ─────────────────────────────────────────
  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg page-public px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md text-center"
        >
          <div className="w-14 h-14 rounded-full bg-success-soft text-success flex items-center justify-center mx-auto mb-6">
            <Check size={22} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-3">{t('fridge.confirm-title')}</h1>
          <p className="text-text-muted leading-relaxed">
            {t('fridge.confirm-body', done.days, formatEur(done.total))}
          </p>
          <p className="text-[14px] text-text-muted mt-8">
            {t('common.questions')}{' '}
            <a href="mailto:info@caravanstalling-spanje.com" className="text-text underline-offset-4 hover:underline">
              info@caravanstalling-spanje.com
            </a>
          </p>
        </motion.div>
      </main>
    );
  }

  if (waitlistDone) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg page-public px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md text-center"
        >
          <div className="w-14 h-14 rounded-full bg-success-soft text-success flex items-center justify-center mx-auto mb-6">
            <Check size={22} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-3">{t('fridge.waitlist-on-title')}</h1>
          <p className="text-text-muted leading-relaxed">
            {t('fridge.waitlist-on-body-one', t(DEVICE_LABEL_LOWER_KEY[form.device_type]))}
          </p>
        </motion.div>
      </main>
    );
  }

  // ── Sold-out (full page) ─────────────────────────────────
  if (soldOut) {
    return (
      <main className="min-h-screen bg-bg page-public">
        <PublicHero
          back={{ href: '/diensten', label: t('common.services-link') }}
          title={t('fridge.sold-out')}
        />
        <div className="max-w-md mx-auto px-6 py-10 sm:py-14">
          <div className="w-12 h-12 rounded-full bg-warning-soft text-warning flex items-center justify-center mb-5">
            <AlertTriangle size={20} />
          </div>
          <p className="text-text-muted leading-relaxed mb-2">
            {t('fridge.sold-out-body-one', t(DEVICE_PLURAL_KEY[form.device_type]))}
          </p>
          <p className="text-text-muted leading-relaxed mb-8">{t('fridge.sold-out-help')}</p>
          <form onSubmit={submitWaitlist} className="space-y-3">
            {error && (
              <div className="rounded-[var(--radius-md)] bg-danger-soft text-danger px-4 py-3 text-[14px]">{error}</div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="press-spring w-full h-14 rounded-[var(--radius-lg)] bg-accent text-accent-fg font-semibold text-[15px] hover:bg-accent-hover transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {submitting ? t('common.busy') : t('fridge.add-to-waitlist')}
            </button>
            <button
              type="button"
              onClick={() => { setSoldOut(false); setError(''); }}
              className="press-spring w-full h-12 rounded-[var(--radius-md)] border border-border bg-surface hover:border-border-strong text-[14px] font-medium transition-colors"
            >
              {t('fridge.adjust-period')}
            </button>
          </form>
          <p className="text-[12px] text-text-muted mt-6">{t('fridge.privacy-note')}</p>
        </div>
      </main>
    );
  }

  // ── Step 1 — kies koelkast + periode + camping ──────────
  const step1 = (
    <>
      <Section title={t('fridge.which')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.keys(PRICES) as DeviceType[]).filter(t => t !== 'Airco').map(type => {
            const selected = form.device_type === type;
            const dayPrice = Math.ceil((PRICES[type] / 7) * 100) / 100;
            return (
              <motion.button
                key={type}
                type="button"
                onClick={() => setForm({ ...form, device_type: type })}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                className={`text-left p-5 rounded-[var(--radius-xl)] border-2 transition-all ${
                  selected
                    ? 'border-accent bg-surface shadow-md'
                    : 'border-border bg-surface hover:border-border-strong'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[var(--radius-md)] bg-surface-2 border border-border flex items-center justify-center">
                      <Refrigerator size={18} className="text-text" />
                    </div>
                    <span className="text-[15px] font-semibold">{t(DEVICE_LABEL_KEY[type])}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center ${selected ? 'border-accent bg-accent' : 'border-border'}`}>
                    {selected && <Check size={11} className="text-accent-fg" strokeWidth={3} />}
                  </div>
                </div>
                <div className="text-[26px] font-semibold tabular-nums mt-1">
                  {formatEur(PRICES[type])}
                  <span className="text-[14px] font-normal text-text-muted"> {t('fridge.per-week')}</span>
                </div>
                <div className="text-[13px] text-text-muted mt-1">
                  {t('fridge.afterwards')} {formatEur(dayPrice)}{t('fridge.per-day')}
                </div>
              </motion.button>
            );
          })}
        </div>
      </Section>

      <Section title={t('fridge.period')}>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('fridge.start-date')} required>
            <input
              type="date"
              required
              value={form.start_date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={e => setForm({ ...form, start_date: e.target.value })}
              className={fieldCls}
            />
          </Field>
          <Field label={t('fridge.end-date')} required>
            <input
              type="date"
              required
              value={form.end_date}
              min={form.start_date || new Date().toISOString().slice(0, 10)}
              onChange={e => setForm({ ...form, end_date: e.target.value })}
              className={fieldCls}
            />
          </Field>
        </div>
        <p className="text-[12px] text-text-muted">{t('fridge.minimum-days', MIN_DAYS)}</p>
      </Section>

      <Section title={t('fridge.camping')}>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-3">
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
              className={fieldCls}
            />
          </Field>
        </div>
      </Section>

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
              <div className="flex justify-between text-[14px]">
                <span className="text-text-muted">{t('fridge.first-week')}</span>
                <span className="tabular-nums">{formatEur(price.weekPrice)}</span>
              </div>
              {price.extraDays > 0 && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-text-muted">
                    {t(price.extraDays === 1 ? 'fridge.extra-days-one' : 'fridge.extra-days-many', price.extraDays, formatEur(price.dayPrice))}
                  </span>
                  <span className="tabular-nums">{formatEur(price.extraTotal)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-border">
                <span className="font-semibold">{t('fridge.total-days', price.days)}</span>
                <span className="font-semibold tabular-nums text-xl">{formatEur(price.total)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  // ── Step 2 — contact + bevestigen ────────────────────────
  const step2 = (
    <>
      <Section title={t('contact.section-heading')}>
        <ContactFields state={contact} onChange={setContact} showRegistration={false} showLocation={false} />
      </Section>
      <Section title={t('common.summary')}>
        <SummaryRow label={t('fridge.which')} value={t(DEVICE_LABEL_KEY[form.device_type])} />
        <SummaryRow label={t('fridge.period')} value={`${form.start_date} → ${form.end_date}`} />
        <SummaryRow label={t('fridge.camping')} value={form.camping + (form.spot_number ? ` · ${form.spot_number}` : '')} />
        {price && <SummaryRow label={t('fridge.total-days', price.days)} value={formatEur(price.total)} bold />}
      </Section>
    </>
  );

  return (
    <MultiStepShell
      title={t('fridge.heading')}
      intro={t('fridge.intro')}
      step1={step1}
      step2={step2}
      step1Valid={step1Valid}
      onSubmit={submit}
      submitting={submitting}
      error={error}
      done={false}
      paid
    />
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-baseline gap-3 py-2 border-b border-border last:border-b-0">
      <span className="text-[13px] text-text-muted">{label}</span>
      <span className={`text-[14px] tabular-nums text-right ${bold ? 'font-semibold' : ''}`}>{value}</span>
    </div>
  );
}

