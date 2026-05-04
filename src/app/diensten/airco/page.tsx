'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle, Wind } from 'lucide-react';
import AnimatedServiceIcon from '@/components/AnimatedServiceIcon';
import { calculatePriceWith, PRICES, MIN_DAYS } from '@/lib/pricing';
import {
  MultiStepShell, Section, Field, fieldCls, emptyContact,
} from '@/components/ServiceForm';
import RhfContactFields from '@/components/RhfContactFields';
import CampingPicker from '@/components/CampingPicker';
import PublicHero from '@/components/PublicHero';
import { useLocale } from '@/components/LocaleProvider';
import { formatEur as fmtEur } from '@/lib/format';
import { useZodForm, focusFirstError, summaryError } from '@/lib/forms';
import { fridgeOrderSchema } from '@/lib/validations';
import type { z } from 'zod';

type AircoForm = z.input<typeof fridgeOrderSchema>;

export default function AircoPage() {
  const { t, locale } = useLocale();
  const formatEur = (eur: number) => fmtEur(eur, locale, 2);

  const form = useZodForm<AircoForm>(fridgeOrderSchema, {
    defaultValues: {
      ...emptyContact,
      device_type: 'Airco',
      start_date: '',
      end_date: '',
      camping: '',
      spot_number: '',
      notes: '',
    },
  });
  const { register, handleSubmit, setValue, watch, control, formState: { errors, isSubmitted } } = form;
  const inlineError = isSubmitted ? summaryError(form) : null;
  const [shakeTick, setShakeTick] = useState(0);

  const startDate = watch('start_date') || '';
  const endDate = watch('end_date') || '';
  const camping = watch('camping') || '';
  const spotNumber = watch('spot_number') || '';

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState<{ total: number; days: number } | null>(null);
  const [soldOut, setSoldOut] = useState(false);
  const [aircoWeekPrice, setAircoWeekPrice] = useState<number>(PRICES.Airco);

  useEffect(() => {
    fetch('/api/order/prices')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.fridge?.Airco) setAircoWeekPrice(Number(d.fridge.Airco));
      })
      .catch(() => { /* fallback blijft */ });
  }, []);

  const price = useMemo(() => {
    if (!startDate || !endDate) return null;
    if (new Date(endDate) <= new Date(startDate)) return null;
    try {
      return calculatePriceWith(aircoWeekPrice, startDate, endDate);
    } catch {
      return null;
    }
  }, [startDate, endDate, aircoWeekPrice]);

  const step1Valid = !!(startDate && endDate && camping && price);

  const submit = async (values: AircoForm) => {
    setServerError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/order/fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, device_type: 'Airco' }),
      });
      const data = await res.json();
      if (res.status === 409 && data.soldOut) {
        setSoldOut(true);
        return;
      }
      if (!res.ok || !data.success) {
        setServerError(data.error || t('common.something-wrong'));
        return;
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setDone({ total: data.total, days: data.days });
    } catch {
      setServerError(t('common.connection-error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <main id="main" className="min-h-screen flex items-center justify-center bg-bg page-public px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-success-soft text-success flex items-center justify-center mx-auto mb-6">
            <Check size={22} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-3">{t('fridge.confirm-title')}</h1>
          <p className="text-text-muted leading-relaxed">{t('fridge.confirm-body', done.days, formatEur(done.total))}</p>
        </motion.div>
      </main>
    );
  }

  if (soldOut) {
    return (
      <main id="main" className="min-h-screen bg-bg page-public">
        <PublicHero back={{ href: '/diensten', label: t('common.services-link') }} title={t('fridge.sold-out')} />
        <div className="max-w-md mx-auto px-6 py-10 sm:py-14">
          <div className="w-12 h-12 rounded-full bg-warning-soft text-warning flex items-center justify-center mb-5">
            <AlertTriangle size={20} />
          </div>
          <p className="text-text-muted leading-relaxed mb-2">{t('fridge.sold-out-dates')}</p>
          <p className="text-text-muted leading-relaxed mb-8">{t('fridge.sold-out-help')}</p>
          <button
            type="button"
            onClick={() => setSoldOut(false)}
            className="press-spring w-full h-12 rounded-[var(--radius-md)] border border-border bg-surface hover:border-border-strong text-[14px] font-medium transition-colors"
          >
            {t('fridge.adjust-period')}
          </button>
        </div>
      </main>
    );
  }

  const dayPrice = Math.ceil((aircoWeekPrice / 7) * 100) / 100;
  const today = new Date().toISOString().slice(0, 10);

  const step1 = (
    <>
      <Section title={t('airco.heading')}>
        <div className="rounded-[var(--radius-xl)] border-2 border-accent bg-surface shadow-md p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[var(--radius-md)] bg-surface-2 border border-border flex items-center justify-center text-text">
                <AnimatedServiceIcon kind="airco" size={20} loop />
              </div>
              <span className="text-[15px] font-semibold">{t('airco.device-name')}</span>
            </div>
          </div>
          <div className="text-[26px] font-semibold tabular-nums mt-1">
            {formatEur(aircoWeekPrice)}
            <span className="text-[14px] font-normal text-text-muted"> {t('fridge.per-week')}</span>
          </div>
          <div className="text-[13px] text-text-muted mt-1">
            {t('fridge.afterwards')} {formatEur(dayPrice)}{t('fridge.per-day')}
          </div>
        </div>
      </Section>

      <Section title={t('fridge.period')}>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('fridge.start-date')} required>
            <input
              {...register('start_date')}
              type="date"
              min={today}
              aria-invalid={!!errors.start_date}
              className={fieldCls}
            />
            {errors.start_date?.message && (
              <p role="alert" className="mt-1 text-[12px] text-danger">{errors.start_date.message}</p>
            )}
          </Field>
          <Field label={t('fridge.end-date')} required>
            <input
              {...register('end_date')}
              type="date"
              min={(() => {
                if (!startDate) return today;
                const ts = new Date(startDate).getTime();
                if (!Number.isFinite(ts)) return today;
                return new Date(ts + MIN_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
              })()}
              aria-invalid={!!errors.end_date}
              className={fieldCls}
            />
            {errors.end_date?.message && (
              <p role="alert" className="mt-1 text-[12px] text-danger">{errors.end_date.message}</p>
            )}
          </Field>
        </div>
        <p className="text-[12px] text-text-muted">{t('fridge.minimum-days', MIN_DAYS)}</p>
      </Section>

      <Section title={t('fridge.camping')}>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-3">
          <Field label={t('fridge.camping')} required>
            <CampingPicker
              value={camping}
              onChange={(name) => setValue('camping', name, { shouldValidate: true, shouldDirty: true })}
              placeholder={t('fridge.camping-placeholder')}
              required
              ariaLabel={t('fridge.camping')}
            />
            {errors.camping?.message && (
              <p role="alert" className="mt-1 text-[12px] text-danger">{errors.camping.message}</p>
            )}
          </Field>
          <Field label={t('fridge.spot-number')}>
            <input {...register('spot_number')} placeholder="A12" className={fieldCls} />
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

  const step2 = (
    <>
      <Section title={t('contact.section-heading')}>
        <RhfContactFields<AircoForm>
          register={register}
          errors={errors}
          control={control}
          showRegistration={false}
          showLocation={false}
        />
      </Section>
      <Section title={t('common.summary')}>
        <SummaryRow label={t('airco.heading')} value={t('airco.device-name')} />
        <SummaryRow label={t('fridge.period')} value={`${startDate} → ${endDate}`} />
        <SummaryRow label={t('fridge.camping')} value={camping + (spotNumber ? ` · ${spotNumber}` : '')} />
        {price && <SummaryRow label={t('fridge.total-days', price.days)} value={formatEur(price.total)} bold />}
      </Section>
    </>
  );

  return (
    <MultiStepShell
      title={t('airco.heading')}
      intro={t('airco.intro')}
      eyebrow="Direct verkoeling"
      eyebrowIcon={<Wind size={11} />}
      icon={Wind}
      accent="amber"
      step1={step1}
      step2={step2}
      step1Valid={step1Valid}
      onSubmit={handleSubmit(submit, () => {
        setShakeTick((n) => n + 1);
        focusFirstError(form);
      })}
      submitting={submitting}
      error={serverError}
      inlineError={inlineError}
      errorTrigger={shakeTick}
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
