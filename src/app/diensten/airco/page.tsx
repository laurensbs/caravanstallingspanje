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
          <p className="text-[color:var(--muted)] leading-relaxed">{t('fridge.confirm-body', done.days, formatEur(done.total))}</p>
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
          <p className="text-[color:var(--muted)] leading-relaxed mb-2">{t('fridge.sold-out-dates')}</p>
          <p className="text-[color:var(--muted)] leading-relaxed mb-8">{t('fridge.sold-out-help')}</p>
          <button
            type="button"
            onClick={() => setSoldOut(false)}
            className="press-spring w-full h-12 rounded-[var(--radius-md)] border border-[color:var(--line)] bg-white hover:border-[color:var(--line-2)] text-[14px] font-medium transition-colors"
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
        <div
          className="card-mk"
          style={{
            padding: 22,
            border: '2px solid var(--navy)',
            boxShadow: '0 0 0 3px rgba(47,66,84,0.08), var(--shadow-card-mk)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <span
              aria-hidden
              style={{
                width: 44, height: 44, borderRadius: 10,
                background: 'var(--sky-soft)', color: 'var(--navy)',
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}
            >
              <AnimatedServiceIcon kind="airco" size={20} loop />
            </span>
            <span style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 16, color: 'var(--navy)' }}>
              {t('airco.device-name')}
            </span>
          </div>
          <div style={{ fontFamily: 'var(--sora)', fontWeight: 700, fontSize: 28, color: 'var(--navy)', lineHeight: 1.1 }}>
            {formatEur(aircoWeekPrice)}
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)' }}> {t('fridge.per-week')}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
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
        <p className="text-[12px] text-[color:var(--muted)]">{t('fridge.minimum-days', MIN_DAYS)}</p>
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
            <div
              className="card-mk space-y-2"
              style={{ padding: 20, background: 'var(--bg)' }}
            >
              <div className="flex justify-between text-[14px]">
                <span className="text-[color:var(--muted)]">{t('fridge.first-week')}</span>
                <span className="tabular-nums">{formatEur(price.weekPrice)}</span>
              </div>
              {price.extraDays > 0 && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-[color:var(--muted)]">
                    {t(price.extraDays === 1 ? 'fridge.extra-days-one' : 'fridge.extra-days-many', price.extraDays, formatEur(price.dayPrice))}
                  </span>
                  <span className="tabular-nums">{formatEur(price.extraTotal)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-[color:var(--line)]">
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

  const preForm = (
    <div className="flex flex-wrap gap-3">
      <span className="spec-chip">
        <span className="v">{formatEur(aircoWeekPrice)}</span>
        <span className="l">Per week</span>
      </span>
      <span className="spec-chip">
        <span className="v">≥ 7</span>
        <span className="l">Dagen min.</span>
      </span>
      <span className="spec-chip">
        <span className="v">230V</span>
        <span className="l">Standaard stekker</span>
      </span>
      <span className="spec-chip">
        <span className="v">Stil</span>
        <span className="l">Slaapkamer-modus</span>
      </span>
    </div>
  );

  const aside = (
    <div className="space-y-4">
      <div className="card-mk" style={{ padding: 22 }}>
        <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 12px' }}>
          Wat krijg je?
        </h3>
        <ul className="checklist-mk">
          <li><span className="v" aria-hidden /><span>Mobiele airco-unit, bezorgd op je staanplaats</span></li>
          <li><span className="v" aria-hidden /><span>Compleet met afvoerslang en raamkit</span></li>
          <li><span className="v" aria-hidden /><span>230V — direct aansluiten</span></li>
          <li><span className="v" aria-hidden /><span>Ophalen aan einde verhuur</span></li>
        </ul>
      </div>

      <div className="card-mk" style={{ padding: 22 }}>
        <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 14px' }}>
          Zo werkt het
        </h3>
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { n: 1, t: 'Kies periode + camping' },
            { n: 2, t: 'Vul je gegevens in' },
            { n: 3, t: 'Betaal veilig via Stripe' },
            { n: 4, t: 'Wij bezorgen op je staanplaats' },
          ].map((s) => (
            <li key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span
                aria-hidden
                style={{
                  width: 26, height: 26, borderRadius: 999,
                  background: 'var(--sky-soft)', color: 'var(--navy)',
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                  fontFamily: 'var(--sora)', fontWeight: 700, fontSize: 12,
                }}
              >
                {s.n}
              </span>
              <span style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5, paddingTop: 4 }}>
                {s.t}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
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
      preForm={preForm}
      aside={aside}
    />
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-baseline gap-3 py-2 border-b border-[color:var(--line)] last:border-b-0">
      <span className="text-[13px] text-[color:var(--muted)]">{label}</span>
      <span className={`text-[14px] tabular-nums text-right ${bold ? 'font-semibold' : ''}`}>{value}</span>
    </div>
  );
}
