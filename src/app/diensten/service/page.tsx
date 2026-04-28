'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import {
  ContactFields, MultiStepShell, Section, Field, fieldCls,
  emptyContact, useServiceSubmit,
} from '@/components/ServiceForm';
import { Skeleton } from '@/components/ui';
import { useLocale } from '@/components/LocaleProvider';

type CatalogService = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price_eur: number;
};

export default function ServicePage() {
  const { t, locale } = useLocale();
  const formatEur = (eur: number) =>
    new Intl.NumberFormat(locale === 'nl' ? 'nl-NL' : 'en-IE', {
      style: 'currency',
      currency: 'EUR',
    }).format(eur);
  const [catalog, setCatalog] = useState<CatalogService[] | null>(null);
  const [contact, setContact] = useState(emptyContact);
  const [serviceSlug, setServiceSlug] = useState<string>('');
  const [description, setDescription] = useState('');

  const { submit, submitting, error, done } = useServiceSubmit('/api/order/service');

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {catalog.map((s) => {
              const sel = serviceSlug === s.slug;
              return (
                <motion.button
                  key={s.id}
                  type="button"
                  onClick={() => setServiceSlug(s.slug)}
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
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
        <ContactFields state={contact} onChange={setContact} />
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
      step1={step1}
      step2={step2}
      step1Valid={step1Valid}
      onSubmit={(e) => {
        e.preventDefault();
        if (!serviceSlug) return;
        submit({ ...contact, serviceCategory: serviceSlug, description });
      }}
      submitting={submitting}
      error={error}
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
