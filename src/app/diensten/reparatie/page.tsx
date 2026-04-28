'use client';

import { useState } from 'react';
import {
  ContactFields, ServicePageShell, Section, Field, fieldCls,
  emptyContact, useServiceSubmit,
} from '@/components/ServiceForm';

export default function ReparatiePage() {
  const [contact, setContact] = useState(emptyContact);
  const [description, setDescription] = useState('');

  const { submit, submitting, error, done, publicCode } = useServiceSubmit('/api/order/repair');

  return (
    <ServicePageShell
      title="Reparatie aanvragen"
      intro="Beschrijf wat er moet gebeuren. We koppelen het aan een werkbon in het werkplaats-systeem en nemen contact op."
      onSubmit={(e) => {
        e.preventDefault();
        submit({ ...contact, description });
      }}
      submitting={submitting}
      error={error}
      done={done}
      publicCode={publicCode}
      doneBody="Bedankt! Onze werkplaats heeft je aanvraag ontvangen en bekijkt 'm zo snel mogelijk."
    >
      <Section title="Wat is er aan de hand?">
        <Field label="Omschrijving" required hint="Wees zo specifiek mogelijk: locatie van de schade, wanneer ontstaan, etc.">
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Bv. lekkage bij het frontraam links, ontdekt na regen vorige week."
            className={`${fieldCls} min-h-[120px] py-2 resize-none`}
          />
        </Field>
        {/* TODO: foto-upload (Vercel Blob of S3) */}
      </Section>

      <Section title="Contactgegevens">
        <ContactFields state={contact} onChange={setContact} />
      </Section>
    </ServicePageShell>
  );
}
