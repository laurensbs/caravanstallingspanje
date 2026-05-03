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
import { useZodForm } from '@/lib/forms';
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
    register, handleSubmit, control, watch, setValue, formState: { errors },
  } = form;

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
                <div className="rounded-[var(--radius-lg)] border border-border bg-surface-2 p-3 flex items-center justify-between text-[12px] text-text-muted gap-3">
                  <span className="inline-flex items-center gap-1.5">
                    <AnimatedServiceIcon kind="transport" size={14} loop /> Stalling
                  </span>
                  <ArrowRightIcon size={12} className="text-text-subtle" />
                  <span className="truncate text-text">{camping || '—'}</span>
                  <ArrowRightIcon size={12} className="text-text-subtle rotate-180" />
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
          className="text-[13px] text-text-muted text-center"
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

  return (
    <MultiStepShell
      paid
      title={t('transport.heading')}
      intro={t('transport.intro')}
      eyebrow="Stalling ↔ camping"
      eyebrowIcon={<Truck size={11} />}
      accent="violet"
      step1={step1}
      step2={step2}
      step1Valid={step1Valid}
      onSubmit={handleSubmit((values) => submit(values))}
      submitting={submitting}
      error={error}
      done={done}
      publicCode={publicCode}
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
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className={`text-left p-5 rounded-[var(--radius-xl)] border-2 transition-all ${
        selected
          ? 'border-accent bg-surface shadow-md'
          : 'border-border bg-surface hover:border-border-strong'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-[var(--radius-md)] bg-surface-2 border border-border flex items-center justify-center text-text">
          <Icon size={20} />
        </div>
        <div aria-hidden className={`w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center ${selected ? 'border-accent bg-accent' : 'border-border'}`}>
          {selected && <Check size={11} className="text-accent-fg" strokeWidth={3} />}
        </div>
      </div>
      <div className="text-[15px] font-semibold">{title}</div>
      <div className="text-[13px] text-text-muted mt-1">{desc}</div>
      <div className="text-[20px] font-semibold tabular-nums mt-3">{price}</div>
    </motion.button>
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
