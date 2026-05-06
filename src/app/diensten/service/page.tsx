'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
  return (
    <Suspense fallback={null}>
      <ServiceContent />
    </Suspense>
  );
}

function ServiceContent() {
  const { t, locale } = useLocale();
  const formatEur = (eur: number) => fmtEur(eur, locale, 2);
  const [catalog, setCatalog] = useState<CatalogService[] | null>(null);
  const params = useSearchParams();
  const presetType = params.get('type') || '';

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
      .then((d) => {
        const list = d.services || [];
        setCatalog(list);
        // Pre-select via ?type=<slug> uit /tarieven-link. Pas pre-selecten
        // als de slug ook bestaat in de gefetchte catalog — anders blijft 't
        // veld leeg en kiest klant zelf.
        if (presetType && list.some((s: CatalogService) => s.slug === presetType)) {
          setValue('serviceCategory', presetType, { shouldValidate: false, shouldDirty: false });
        }
      })
      .catch(() => setCatalog([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetType]);

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
            <p className="text-sm text-[color:var(--muted)]">
              {t('service.empty')}{' '}
              <a
                href="mailto:info@caravanstalling-spanje.com"
                className="text-[color:var(--ink)] underline-offset-4 hover:underline"
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
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                  className={sel ? 'radio-card selected' : 'radio-card'}
                  style={{ width: '100%', textAlign: 'left' }}
                >
                  <span className="dot" aria-hidden style={{ marginTop: 4 }} />
                  <div className="info">
                    <h4>
                      <span>{s.name}</span>
                      <span className="price">{formatEur(s.price_eur)}</span>
                    </h4>
                    {s.description && <p>{s.description}</p>}
                  </div>
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

  const preForm = (
    <div className="flex flex-wrap gap-3">
      <span className="spec-chip">
        <span className="v">{catalog?.length || '—'}</span>
        <span className="l">Beschikbare diensten</span>
      </span>
      <span className="spec-chip">
        <span className="v">Eigen werkplaats</span>
        <span className="l">Geen externe partijen</span>
      </span>
      <span className="spec-chip">
        <span className="v">PDF-rapport</span>
        <span className="l">Foto&apos;s vóór + na</span>
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
          <li><span className="v" aria-hidden /><span>Eigen monteurs in onze 850 m² werkplaats</span></li>
          <li><span className="v" aria-hidden /><span>Foto-rapport vóór en na</span></li>
          <li><span className="v" aria-hidden /><span>Vaste prijs per dienst — geen verrassingen</span></li>
          <li><span className="v" aria-hidden /><span>Klaar tussen 1–5 werkdagen</span></li>
        </ul>
      </div>

      <div className="card-mk" style={{ padding: 22 }}>
        <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 14px' }}>
          Zo werkt het
        </h3>
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { n: 1, t: 'Kies de dienst die je wil' },
            { n: 2, t: 'Vul je gegevens in' },
            { n: 3, t: 'Betaal veilig via Stripe' },
            { n: 4, t: 'Wij plannen + leveren rapport' },
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
