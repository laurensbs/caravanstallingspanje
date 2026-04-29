'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Warehouse, Sun } from 'lucide-react';
import {
  MultiStepShell, Section, Field, fieldCls, useServiceSubmit,
} from '@/components/ServiceForm';
import { useLocale } from '@/components/LocaleProvider';

type FormState = {
  type: 'binnen' | 'buiten';
  name: string;
  email: string;
  phone: string;
  start_date: string;
  end_date: string;
  registration: string;
  brand: string;
  model: string;
  length: string;
  notes: string;
};

const empty: FormState = {
  type: 'buiten',
  name: '',
  email: '',
  phone: '',
  start_date: '',
  end_date: '',
  registration: '',
  brand: '',
  model: '',
  length: '',
  notes: '',
};

export default function StallingPage() {
  const { t, locale } = useLocale();
  const formatEur = (eur: number) =>
    new Intl.NumberFormat(locale === 'nl' ? 'nl-NL' : 'en-IE', {
      style: 'currency',
      currency: 'EUR',
    }).format(eur);

  const [form, setForm] = useState<FormState>(empty);
  const [prices, setPrices] = useState<{ binnen: number; buiten: number } | null>(null);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm({ ...form, [key]: value });

  const { submit, submitting, error, done } = useServiceSubmit<FormState>('/api/order/stalling');

  useEffect(() => {
    fetch('/api/order/prices')
      .then((r) => r.json())
      .then((d) => setPrices({ binnen: Number(d.stalling_binnen ?? 0), buiten: Number(d.stalling_buiten ?? 0) }))
      .catch(() => setPrices({ binnen: 0, buiten: 0 }));
  }, []);

  const currentPrice = prices ? (form.type === 'binnen' ? prices.binnen : prices.buiten) : null;
  const step1Valid = !!form.start_date;

  const step1 = (
    <>
      <Section title={t('storage.section-type')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {([
            { value: 'binnen' as const, label: t('storage.indoor'),  icon: Warehouse, description: t('storage.indoor-desc') },
            { value: 'buiten' as const, label: t('storage.outdoor'), icon: Sun,        description: t('storage.outdoor-desc') },
          ]).map((opt) => {
            const selected = form.type === opt.value;
            const Icon = opt.icon;
            const optPrice = prices ? prices[opt.value] : null;
            return (
              <motion.button
                key={opt.value}
                type="button"
                onClick={() => set('type', opt.value)}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                className={`text-left p-5 rounded-[var(--radius-xl)] border-2 transition-all ${
                  selected
                    ? 'border-accent bg-surface shadow-md'
                    : 'border-border bg-surface hover:border-border-strong'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <motion.div
                    whileHover={{ rotate: [-2, 2, 0], transition: { duration: 0.5 } }}
                    className="w-11 h-11 rounded-[var(--radius-md)] bg-surface-2 text-text flex items-center justify-center border border-border"
                  >
                    <Icon size={20} />
                  </motion.div>
                  <div className={`w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center ${selected ? 'border-accent bg-accent' : 'border-border'}`}>
                    {selected && <Check size={11} className="text-accent-fg" strokeWidth={3} />}
                  </div>
                </div>
                <div className="text-[15px] font-semibold">{opt.label}</div>
                <div className="text-[13px] text-text-muted mt-1">{opt.description}</div>
                {optPrice !== null && optPrice > 0 && (
                  <div className="text-[20px] font-semibold tabular-nums mt-3">
                    {formatEur(optPrice)}
                    <span className="text-[13px] font-normal text-text-muted"> {t('storage.per-year')}</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </Section>

      <Section title={t('storage.start-section')}>
        <Field label={t('storage.start-from')} required hint={t('storage.start-help')}>
          <input
            type="date"
            required
            min={new Date().toISOString().slice(0, 10)}
            value={form.start_date}
            onChange={(e) => set('start_date', e.target.value)}
            className={fieldCls}
          />
        </Field>
      </Section>

      <Section title={t('storage.caravan-section')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={t('contact.registration')}>
            <input value={form.registration} onChange={(e) => set('registration', e.target.value)} className={fieldCls} />
          </Field>
          <Field label={t('storage.length-meters')}>
            <input value={form.length} onChange={(e) => set('length', e.target.value)} placeholder="6.5" className={fieldCls} />
          </Field>
          <Field label={t('contact.brand')}>
            <input value={form.brand} onChange={(e) => set('brand', e.target.value)} className={fieldCls} />
          </Field>
          <Field label={t('contact.model')}>
            <input value={form.model} onChange={(e) => set('model', e.target.value)} className={fieldCls} />
          </Field>
        </div>
      </Section>
    </>
  );

  const step2 = (
    <>
      <Section title={t('contact.section-heading')}>
        <Field label={t('contact.name')} required>
          <input required value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" className={fieldCls} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={t('contact.email')} required>
            <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" className={fieldCls} />
          </Field>
          <Field label={t('contact.phone')} required>
            <input required type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" className={fieldCls} />
          </Field>
        </div>
        <Field label={`${t('contact.note')} ${t('common.optional')}`}>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            className={`${fieldCls} min-h-[80px] py-2 resize-none`}
          />
        </Field>
      </Section>

      <Section title={t('common.summary')}>
        <SummaryRow label={t('storage.section-type')} value={form.type === 'binnen' ? t('storage.indoor') : t('storage.outdoor')} />
        <SummaryRow label={t('storage.start-from')} value={form.start_date} />
        {form.registration && <SummaryRow label={t('contact.registration')} value={form.registration} />}
        {currentPrice !== null && currentPrice > 0 && (
          <SummaryRow
            label={form.type === 'binnen' ? t('storage.summary-indoor') : t('storage.summary-outdoor')}
            value={formatEur(currentPrice)}
            bold
          />
        )}
      </Section>
    </>
  );

  return (
    <MultiStepShell
      paid
      title={t('storage.heading')}
      intro={t('storage.intro')}
      doneTitle={t('service.done-title')}
      step1={step1}
      step2={step2}
      step1Valid={step1Valid}
      onSubmit={(e) => {
        e.preventDefault();
        submit(form);
      }}
      submitting={submitting}
      error={error}
      done={done}
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
