'use client';

import { useEffect, useState } from 'react';
import {
  ContactFields, ServicePageShell, Section, Field, fieldCls,
  emptyContact, useServiceSubmit,
} from '@/components/ServiceForm';

function formatEur(eur: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(eur);
}

export default function TransportPage() {
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
      title="Transport aanvragen"
      intro="Ophalen of brengen tussen camping en stalling, of NL ↔ Spanje."
      doneTitle="Doorsturen naar betaling…"
      onSubmit={(e) => {
        e.preventDefault();
        submit({ ...contact, fromLocation, toLocation, preferredDate, description });
      }}
      submitting={submitting}
      error={error}
      done={done}
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

      {price !== null && price > 0 && (
        <div className="rounded-[var(--radius-xl)] bg-surface-2 border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Transport (vast bedrag)</span>
            <span className="text-lg font-semibold tabular-nums">{formatEur(price)}</span>
          </div>
          <p className="text-[11px] text-text-muted mt-2">
            Je gaat na verzenden naar onze beveiligde Stripe-betaalpagina.
          </p>
        </div>
      )}
    </ServicePageShell>
  );
}
