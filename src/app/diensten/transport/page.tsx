'use client';

import { useState } from 'react';
import {
  ContactFields, ServicePageShell, Section, Field, fieldCls,
  emptyContact, useServiceSubmit,
} from '@/components/ServiceForm';

export default function TransportPage() {
  const [contact, setContact] = useState(emptyContact);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [description, setDescription] = useState('');

  const { submit, submitting, error, done, publicCode } = useServiceSubmit('/api/order/transport');

  return (
    <ServicePageShell
      title="Transport aanvragen"
      intro="Ophalen of brengen tussen camping en stalling, of NL ↔ Spanje."
      onSubmit={(e) => {
        e.preventDefault();
        submit({ ...contact, fromLocation, toLocation, preferredDate, description });
      }}
      submitting={submitting}
      error={error}
      done={done}
      publicCode={publicCode}
    >
      <Section title="Route">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Van" required>
            <input
              required
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              placeholder="Camping Eurocamping plek 12"
              className={fieldCls}
            />
          </Field>
          <Field label="Naar" required>
            <input
              required
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              placeholder="Stalling Cruïlles"
              className={fieldCls}
            />
          </Field>
        </div>
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
            placeholder="Bv. afmetingen, contactpersoon ter plaatse, etc."
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
