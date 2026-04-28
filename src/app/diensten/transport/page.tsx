'use client';

import { useEffect, useState } from 'react';
import {
  ContactFields, ServicePageShell, Section, Field, fieldCls,
  emptyContact, useServiceSubmit,
} from '@/components/ServiceForm';
import CampingPicker from '@/components/CampingPicker';
import { useLocale } from '@/components/LocaleProvider';

export default function TransportPage() {
  const { t, locale } = useLocale();
  const formatEur = (eur: number) =>
    new Intl.NumberFormat(locale === 'nl' ? 'nl-NL' : 'en-IE', {
      style: 'currency',
      currency: 'EUR',
    }).format(eur);

  const [contact, setContact] = useState(emptyContact);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | null>(null);

  const { submit, submitting, error, done } = useServiceSubmit('/api/order/transport');

  useEffect(() => {
    fetch('/api/order/prices')
      .then((r) => r.json())
      .then((d) => setPrice(Number(d.transport ?? 0)))
      .catch(() => setPrice(0));
  }, []);

  return (
    <ServicePageShell
      paid
      title={t('transport.heading')}
      intro={t('transport.intro')}
      doneTitle={t('service.done-title')}
      onSubmit={(e) => {
        e.preventDefault();
        submit({ ...contact, fromLocation, toLocation, preferredDate, description });
      }}
      submitting={submitting}
      error={error}
      done={done}
    >
      <Section title={t('transport.section-route')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={t('transport.from')} required>
            <CampingPicker
              value={fromLocation}
              onChange={setFromLocation}
              placeholder={t('transport.from-placeholder')}
              required
              ariaLabel={t('transport.from')}
              filter={(c) => c.name !== toLocation}
            />
          </Field>
          <Field label={t('transport.to')} required>
            <CampingPicker
              value={toLocation}
              onChange={setToLocation}
              placeholder={t('transport.to-placeholder')}
              required
              ariaLabel={t('transport.to')}
              filter={(c) => c.name !== fromLocation}
            />
          </Field>
        </div>
        <Field label={`${t('inspection.preferred-date')} ${t('common.optional')}`}>
          <input
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            className={fieldCls}
          />
        </Field>
        <Field label={`${t('contact.note')} ${t('common.optional')}`}>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('transport.note-placeholder')}
            className={`${fieldCls} min-h-[80px] py-2 resize-none`}
          />
        </Field>
      </Section>

      <Section title={t('contact.section-heading')}>
        <ContactFields state={contact} onChange={setContact} />
      </Section>

      {price !== null && price > 0 && (
        <div className="rounded-[var(--radius-xl)] bg-surface-2 border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">{t('transport.amount-label')}</span>
            <span className="text-lg font-semibold tabular-nums">{formatEur(price)}</span>
          </div>
          <p className="text-[11px] text-text-muted mt-2">{t('service.checkout-hint')}</p>
        </div>
      )}
    </ServicePageShell>
  );
}
