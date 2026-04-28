'use client';

import { useState } from 'react';
import {
  ContactFields, ServicePageShell, Section, Field, fieldCls,
  emptyContact, useServiceSubmit,
} from '@/components/ServiceForm';
import { useLocale } from '@/components/LocaleProvider';

export default function InspectiePage() {
  const { t } = useLocale();
  const [contact, setContact] = useState(emptyContact);
  const [preferredDate, setPreferredDate] = useState('');
  const [description, setDescription] = useState('');

  const { submit, submitting, error, done, publicCode } = useServiceSubmit('/api/order/inspection');

  return (
    <ServicePageShell
      title={t('inspection.heading')}
      intro={t('inspection.intro')}
      onSubmit={(e) => {
        e.preventDefault();
        submit({ ...contact, preferredDate, description });
      }}
      submitting={submitting}
      error={error}
      done={done}
      publicCode={publicCode}
    >
      <Section title={t('inspection.when')}>
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
            placeholder={t('inspection.note-placeholder')}
            className={`${fieldCls} min-h-[80px] py-2 resize-none`}
          />
        </Field>
      </Section>

      <Section title={t('contact.section-heading')}>
        <ContactFields state={contact} onChange={setContact} />
      </Section>
    </ServicePageShell>
  );
}
