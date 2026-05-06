'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Truck, KeyRound } from 'lucide-react';
import {
  MultiStepShell, Section, Field, fieldCls,
  emptyContact, useServiceSubmit,
} from '@/components/ServiceForm';
import RhfContactFields from '@/components/RhfContactFields';
import CampingPicker from '@/components/CampingPicker';
import { useLocale } from '@/components/LocaleProvider';
import { ArrowRight as ArrowRightIcon } from 'lucide-react';
import AnimatedServiceIcon from '@/components/AnimatedServiceIcon';
import { formatEur as fmtEur } from '@/lib/format';
import { useZodForm, focusFirstError, summaryError } from '@/lib/forms';
import { transportOrderSchema } from '@/lib/validations';
import type { z } from 'zod';

type TransportForm = z.input<typeof transportOrderSchema>;

export default function TransportPage() {
  const { t, locale } = useLocale();
  const formatEur = (eur: number) => fmtEur(eur, locale, 2);

  const [prices, setPrices] = useState<{ wij_rijden: number; zelf: number }>({ wij_rijden: 100, zelf: 50 });

  const form = useZodForm<TransportForm>(transportOrderSchema, {
    defaultValues: {
      ...emptyContact,
      mode: 'wij_rijden',
      camping: '',
      outboundDate: '',
      outboundTime: '',
      returnDate: '',
      returnTime: '',
      description: '',
    },
  });
  const {
    register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitted },
  } = form;

  const inlineError = isSubmitted ? summaryError(form) : null;
  const [shakeTick, setShakeTick] = useState(0);

  // useController voor mode (we starten met null-state via een sentinel: lege string).
  // Mode is required volgens schema; we forceren een keuze via UI-validation.
  const mode = watch('mode');
  const camping = watch('camping') || '';
  const outboundDate = watch('outboundDate') || '';
  const outboundTime = watch('outboundTime') || '';
  const returnDate = watch('returnDate') || '';
  const returnTime = watch('returnTime') || '';
  const description = watch('description') || '';
  const [modeChosen, setModeChosen] = useState(false);

  useEffect(() => {
    fetch('/api/order/prices')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.transport_price_wij_rijden || d?.transport_price_zelf) {
          setPrices({
            wij_rijden: Number(d.transport_price_wij_rijden ?? 100),
            zelf: Number(d.transport_price_zelf ?? 50),
          });
        }
      })
      .catch(() => { /* fallback blijft */ });
  }, []);

  const { submit, submitting, error, done, publicCode } = useServiceSubmit<TransportForm>('/api/order/transport');

  const step1Valid = !!(modeChosen && camping && outboundDate && returnDate);
  const isZelf = mode === 'zelf';
  const currentPrice = isZelf ? prices.zelf : prices.wij_rijden;

  const pickupLabel = isZelf ? 'Ophaal-datum (uit stalling)' : 'Ophaal-datum (op camping)';
  const returnLabel = isZelf ? 'Terugbreng-datum (naar stalling)' : 'Terug-datum (terug naar stalling)';
  const campingHelperText = isZelf
    ? 'De camping waar je naartoe gaat — wij weten dan voor de terugrit waar de caravan staat als jij hem zelf later weer brengt.'
    : 'De camping waar wij je caravan komen halen.';

  const today = new Date().toISOString().slice(0, 10);

  const setCamping = (v: string) => setValue('camping', v, { shouldValidate: true, shouldDirty: true });
  const setMode = (m: 'wij_rijden' | 'zelf') => {
    setValue('mode', m, { shouldValidate: true, shouldDirty: true });
    setModeChosen(true);
  };

  const step1 = (
    <>
      <Section title="Hoe wil je het regelen?">
        <div role="radiogroup" aria-label="Transport-optie" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ModeCard
            selected={modeChosen && mode === 'wij_rijden'}
            onClick={() => setMode('wij_rijden')}
            icon={Truck}
            title="Wij halen op"
            desc="Wij komen je caravan ophalen bij de camping en brengen 'm na de vakantie terug naar de stalling."
            price={formatEur(prices.wij_rijden)}
          />
          <ModeCard
            selected={modeChosen && mode === 'zelf'}
            onClick={() => setMode('zelf')}
            icon={KeyRound}
            title="Ik haal zelf op"
            desc="Je komt zelf langs onze stalling om je caravan op te halen — wij verzorgen sleuteloverdracht."
            price={formatEur(prices.zelf)}
          />
        </div>
      </Section>

      <AnimatePresence initial={false}>
        {modeChosen && (
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pt-2">
              <Section title={isZelf ? 'Ophalen bij Stalling' : 'Ophalen op camping'}>
                <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--bg)] p-3 flex items-center justify-between text-[12px] text-[color:var(--muted)] gap-3">
                  <span className="inline-flex items-center gap-1.5">
                    <AnimatedServiceIcon kind="transport" size={14} loop /> Stalling
                  </span>
                  <ArrowRightIcon size={12} className="text-[color:var(--muted-2)]" />
                  <span className="truncate text-[color:var(--ink)]">{camping || '—'}</span>
                  <ArrowRightIcon size={12} className="text-[color:var(--muted-2)] rotate-180" />
                  <span className="inline-flex items-center gap-1.5">
                    <AnimatedServiceIcon kind="transport" size={14} loop /> Stalling
                  </span>
                </div>

                <Field label="Camping" required hint={campingHelperText}>
                  <CampingPicker
                    value={camping}
                    onChange={setCamping}
                    placeholder={t('fridge.camping-placeholder')}
                    required
                    ariaLabel="Camping"
                  />
                  {errors.camping?.message && (
                    <p role="alert" className="mt-1 text-[12px] text-danger">{errors.camping.message}</p>
                  )}
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label={pickupLabel} required hint={isZelf ? 'Wanneer kom je langs?' : 'Wanneer mogen wij komen?'}>
                    <div className="grid grid-cols-[1fr_110px] gap-2">
                      <input
                        {...register('outboundDate', {
                          onChange: (e) => {
                            const v = e.target.value;
                            if (!returnDate || returnDate < v) {
                              setValue('returnDate', v, { shouldValidate: true });
                            }
                          },
                        })}
                        type="date"
                        min={today}
                        aria-invalid={!!errors.outboundDate}
                        className={fieldCls}
                      />
                      <input
                        {...register('outboundTime')}
                        type="time"
                        className={fieldCls}
                        aria-label="Ongeveer hoe laat"
                      />
                    </div>
                    {errors.outboundDate?.message && (
                      <p role="alert" className="mt-1 text-[12px] text-danger">{errors.outboundDate.message}</p>
                    )}
                  </Field>
                  <Field label={returnLabel} required hint="Ongeveer wanneer komt hij terug?">
                    <div className="grid grid-cols-[1fr_110px] gap-2">
                      <input
                        {...register('returnDate')}
                        type="date"
                        min={outboundDate || today}
                        aria-invalid={!!errors.returnDate}
                        className={fieldCls}
                      />
                      <input
                        {...register('returnTime')}
                        type="time"
                        className={fieldCls}
                        aria-label="Ongeveer hoe laat"
                      />
                    </div>
                    {errors.returnDate?.message && (
                      <p role="alert" className="mt-1 text-[12px] text-danger">{errors.returnDate.message}</p>
                    )}
                  </Field>
                </div>

                <Field label={`${t('contact.note')} ${t('common.optional')}`}>
                  <textarea
                    {...register('description')}
                    rows={3}
                    placeholder={isZelf
                      ? 'Bv. tijd kan flexibel, ik bel je dezelfde ochtend nog'
                      : 'Bv. caravan staat op plek 12, achterzijde'}
                    className={`${fieldCls} min-h-[80px] py-2 resize-none`}
                  />
                </Field>
              </Section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!modeChosen && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-[13px] text-[color:var(--muted)] text-center"
        >
          ↑ Kies eerst hoe je het wilt regelen
        </motion.p>
      )}
    </>
  );

  const step2 = (
    <>
      <Section title={t('contact.section-heading')}>
        <RhfContactFields<TransportForm>
          register={register}
          errors={errors}
          control={control}
          showLocation={false}
        />
      </Section>

      <Section title={t('common.summary')}>
        <SummaryRow label="Optie" value={isZelf ? 'Ik haal zelf op uit Stalling' : 'Wij komen ophalen op camping'} />
        <SummaryRow label="Camping" value={camping} />
        <SummaryRow label={isZelf ? 'Ophaal-locatie' : 'Wij halen op bij'} value={isZelf ? 'Stalling' : camping || '—'} />
        <SummaryRow label={isZelf ? 'Ophaal-moment' : 'Wij komen langs'} value={`${outboundDate}${outboundTime ? ` · ${outboundTime}` : ''}`} />
        <SummaryRow label={isZelf ? 'Terugbreng-moment' : 'Terug-rit'} value={`${returnDate}${returnTime ? ` · ${returnTime}` : ''}`} />
        <SummaryRow label="Totaal" value={formatEur(currentPrice)} bold />
      </Section>
    </>
  );

  const preForm = (
    <div className="flex flex-wrap gap-3">
      <span className="spec-chip">
        <span className="v">{formatEur(prices.wij_rijden)}</span>
        <span className="l">Wij halen op</span>
      </span>
      <span className="spec-chip">
        <span className="v">{formatEur(prices.zelf)}</span>
        <span className="l">Zelf ophalen</span>
      </span>
      <span className="spec-chip">
        <span className="v">Heen + terug</span>
        <span className="l">In één boeking</span>
      </span>
    </div>
  );

  const aside = (
    <div className="space-y-4">
      <div className="card-mk" style={{ padding: 22 }}>
        <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 12px' }}>
          Wat we regelen
        </h3>
        <ul className="checklist-mk">
          <li><span className="v" aria-hidden /><span>Eigen vrachtwagens en vaste chauffeurs</span></li>
          <li><span className="v" aria-hidden /><span>Sleuteloverdracht — geen gedoe op de camping</span></li>
          <li><span className="v" aria-hidden /><span>Verzekerd transport (alle merken)</span></li>
          <li><span className="v" aria-hidden /><span>Heen en terug binnen één afspraak</span></li>
        </ul>
      </div>

      <div className="card-mk" style={{ padding: 22 }}>
        <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 14px' }}>
          Hoe het werkt
        </h3>
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { n: 1, t: 'Kies optie + camping + datums' },
            { n: 2, t: 'Vul je gegevens in' },
            { n: 3, t: 'Betaal via Stripe' },
            { n: 4, t: 'Wij bevestigen tijdslot' },
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
      paid
      title={t('transport.heading')}
      intro={t('transport.intro')}
      eyebrow="Stalling ↔ camping"
      eyebrowIcon={<Truck size={11} />}
      icon={Truck}
      accent="violet"
      step1={step1}
      step2={step2}
      step1Valid={step1Valid}
      onSubmit={handleSubmit((values) => submit(values), () => {
        setShakeTick((n) => n + 1);
        focusFirstError(form);
      })}
      submitting={submitting}
      error={error}
      inlineError={inlineError}
      errorTrigger={shakeTick}
      done={done}
      publicCode={publicCode}
      preForm={preForm}
      aside={aside}
    />
  );
}

function ModeCard({
  selected, onClick, icon: Icon, title, desc, price,
}: {
  selected: boolean;
  onClick: () => void;
  icon: typeof Truck;
  title: string;
  desc: string;
  price: string;
}) {
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className={selected ? 'radio-card selected' : 'radio-card'}
      style={{ width: '100%', textAlign: 'left', display: 'flex', gap: 14 }}
    >
      <span
        aria-hidden
        style={{
          width: 44, height: 44, borderRadius: 10,
          background: 'var(--sky-soft)', color: 'var(--navy)',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}
      >
        <Icon size={20} />
      </span>
      <div className="info" style={{ flex: 1, minWidth: 0 }}>
        <h4>
          <span>{title}</span>
          <span className="price">{price}</span>
        </h4>
        <p>{desc}</p>
      </div>
      <span className="dot" aria-hidden style={{ marginTop: 6 }} />
    </motion.button>
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
