'use client';

import { useState } from 'react';
import {
  ContactFields, ServicePageShell, Section, Field, fieldCls,
  emptyContact, useServiceSubmit,
} from '@/components/ServiceForm';
import { useLocale } from '@/components/LocaleProvider';

export default function ReparatiePage() {
  const { t } = useLocale();
  const [contact, setContact] = useState(emptyContact);
  const [description, setDescription] = useState('');

  const { submit, submitting, error, done, publicCode } = useServiceSubmit('/api/order/repair');

  return (
    <ServicePageShell
      title={t('repair.heading')}
      intro={t('repair.intro')}
      onSubmit={(e) => {
        e.preventDefault();
        submit({ ...contact, description });
      }}
      submitting={submitting}
      error={error}
      done={done}
      publicCode={publicCode}
      doneBody={t('repair.done-body')}
    >
      <Section title={t('repair.section-issue')}>
        <Field label={t('contact.description')} required hint={t('repair.description-help')}>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('repair.description-placeholder')}
            className={`${fieldCls} min-h-[120px] py-2 resize-none`}
          />
        </Field>
        {/* TODO: foto-upload (Vercel Blob of S3) */}
      </Section>

      <Section title={t('contact.section-heading')}>
        <ContactFields state={contact} onChange={setContact} />
      </Section>
    </ServicePageShell>
  );
}
