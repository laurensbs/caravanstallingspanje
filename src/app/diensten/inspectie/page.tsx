'use client';

import { useState } from 'react';
import {
  ContactFields, ServicePageShell, Section, Field, fieldCls,
  emptyContact, useServiceSubmit,
} from '@/components/ServiceForm';

export default function InspectiePage() {
  const [contact, setContact] = useState(emptyContact);
  const [preferredDate, setPreferredDate] = useState('');
  const [description, setDescription] = useState('');

  const { submit, submitting, error, done, publicCode } = useServiceSubmit('/api/order/inspection');

  return (
    <ServicePageShell
      title="Inspectie aanvragen"
      intro="Technische keuring met rapport — geschikt voor vóór het seizoen, na schade of voor verkoop."
      onSubmit={(e) => {
        e.preventDefault();
        submit({ ...contact, preferredDate, description });
      }}
      submitting={submitting}
      error={error}
      done={done}
      publicCode={publicCode}
    >
      <Section title="Wanneer?">
        <Field label="Voorkeursdatum (optioneel)">
          <input
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            className={fieldCls}
          />
        </Field>
        <Field label="Toelichting (optioneel)">
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Specifieke aandachtspunten, gebruiksdoel, etc."
            className={`${fieldCls} min-h-[80px] py-2 resize-none`}
          />
        </Field>
      </Section>

      <Section title="Contactgegevens">
        <ContactFields state={contact} onChange={setContact} />
      </Section>
    </ServicePageShell>
  );
}
