'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import {
  MultiStepShell, Section, Field, fieldCls,
  emptyContact, useServiceSubmit,
} from '@/components/ServiceForm';
import RhfContactFields from '@/components/RhfContactFields';
import { Skeleton } from '@/components/ui';
import { useLocale } from '@/components/LocaleProvider';
import { formatEur as fmtEur } from '@/lib/format';
import { useZodForm, focusFirstError, summaryError } from '@/lib/forms';
import { serviceOrderSchema } from '@/lib/validations';
import type { z } from 'zod';

type CatalogService = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price_eur: number;
};

type ServiceForm = z.input<typeof serviceOrderSchema>;

export default function ServicePage() {
  const { t, locale } = useLocale();
  const formatEur = (eur: number) => fmtEur(eur, locale, 2);
  const [catalog, setCatalog] = useState<CatalogService[] | null>(null);

  const form = useZodForm<ServiceForm>(serviceOrderSchema, {
    defaultValues: {
      ...emptyContact,
      serviceCategory: '',
      description: '',
    },
  });
  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitted } } = form;
  const inlineError = isSubmitted ? summaryError(form) : null;
  const [shakeTick, setShakeTick] = useState(0);

  const serviceSlug = watch('serviceCategory') || '';
  const description = watch('description') || '';

  const { submit, submitting, error, done } = useServiceSubmit<ServiceForm>('/api/order/service');

  useEffect(() => {
    fetch('/api/order/services-catalog')
      .then((r) => r.json())
      .then((d) => setCatalog(d.services || []))
      .catch(() => setCatalog([]));
  }, []);

  const selected = catalog?.find((s) => s.slug === serviceSlug);
  const step1Valid = !!selected;

  const step1 = (
    <>
      <Section title={t('service.which')}>
        {catalog === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" delayMs={i * 40} />
            ))}
          </div>
        ) : catalog.length === 0 ? (
          <div className="card-surface p-8 text-center">
            <p className="text-sm text-text-muted">
              {t('service.empty')}{' '}
              <a
                href="mailto:info@caravanstalling-spanje.com"
                className="text-text underline-offset-4 hover:underline"
              >
                info@caravanstalling-spanje.com
              </a>
              .
            </p>
          </div>
        ) : (
          <div
            role="radiogroup"
            aria-label={t('service.which')}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {catalog.map((s) => {
              const sel = serviceSlug === s.slug;
              return (
                <motion.button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  onClick={() => setValue('serviceCategory', s.slug, { shouldValidate: true, shouldDirty: true })}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                  className={`text-left p-4 rounded-[var(--radius-lg)] border transition-all ${
                    sel
                      ? 'border-accent bg-surface shadow-md'
                      : 'border-border bg-surface hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <span className="text-[15px] font-semibold">{s.name}</span>
                    <div
                      aria-hidden
                      className={`w-5 h-5 rounded-full border-2 transition-colors shrink-0 flex items-center justify-center ${
                        sel ? 'border-accent bg-accent' : 'border-border'
                      }`}
                    >
                      {sel && <Check size={11} className="text-accent-fg" strokeWidth={3} />}
                    </div>
                  </div>
                  {s.description && (
                    <p className="text-[13px] text-text-muted leading-relaxed mb-2">{s.description}</p>
                  )}
                  <div className="text-[16px] font-semibold tabular-nums">{formatEur(s.price_eur)}</div>
                </motion.button>
              );
            })}
          </div>
        )}
      </Section>

      {selected && (
        <Section title={t('service.note-section')}>
          <Field label={`${t('contact.description')} ${t('common.optional')}`}>
            <textarea
              {...register('description')}
              rows={3}
              placeholder={t('service.note-placeholder')}
              className={`${fieldCls} min-h-[80px] py-2 resize-none`}
            />
          </Field>
        </Section>
      )}
    </>
  );

  const step2 = (
    <>
      <Section title={t('contact.section-heading')}>
        <RhfContactFields<ServiceForm> register={register} errors={errors} control={control} />
      </Section>
      {selected && (
        <Section title={t('common.summary')}>
          <SummaryRow label={t('service.which')} value={selected.name} />
          {description && <SummaryRow label={t('contact.description')} value={description} />}
          <SummaryRow label={t('service.amount-label')} value={formatEur(selected.price_eur)} bold />
        </Section>
      )}
    </>
  );

  return (
    <MultiStepShell
      paid
      title={t('service.heading')}
      intro={t('service.intro')}
      eyebrow="Onderhoud & verzorging"
      eyebrowIcon={<Sparkles size={11} />}
      icon={Sparkles}
      accent="cyan"
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
      doneTitle={t('service.done-title')}
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
