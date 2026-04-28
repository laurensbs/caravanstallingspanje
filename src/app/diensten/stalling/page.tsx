'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Warehouse, Sun } from 'lucide-react';
import {
  ServicePageShell, Section, Field, fieldCls, useServiceSubmit,
} from '@/components/ServiceForm';

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
  const [form, setForm] = useState<FormState>(empty);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm({ ...form, [key]: value });

  const { submit, submitting, error, done } = useServiceSubmit<FormState>('/api/order/stalling');

  return (
    <ServicePageShell
      title="Stalling aanvragen"
      intro="Caravan stallen op ons terrein aan de Costa Brava — overdekt of buiten."
      onSubmit={(e) => {
        e.preventDefault();
        submit(form);
      }}
      submitting={submitting}
      error={error}
      done={done}
      doneBody="Bedankt! We bekijken beschikbaarheid en mailen je terug met een bevestiging en prijs."
    >
      <Section title="Soort stalling">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {([
            { value: 'binnen', label: 'Binnen', icon: Warehouse, description: 'Overdekt — beschermd tegen weer en zon.' },
            { value: 'buiten', label: 'Buiten', icon: Sun, description: 'Vaste plek op afgesloten terrein.' },
          ] as const).map((opt) => {
            const selected = form.type === opt.value;
            const Icon = opt.icon;
            return (
              <motion.button
                key={opt.value}
                type="button"
                onClick={() => set('type', opt.value)}
                whileTap={{ scale: 0.99 }}
                className={`text-left p-4 rounded-[var(--radius-lg)] border transition-all ${
                  selected
                    ? 'border-accent bg-surface shadow-md'
                    : 'border-border bg-surface hover:border-border-strong'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-full bg-surface-2 text-text flex items-center justify-center border border-border">
                    <Icon size={16} />
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 transition-colors ${selected ? 'border-accent bg-accent' : 'border-border'}`}>
                    {selected && <Check size={10} className="text-accent-fg" strokeWidth={3} />}
                  </div>
                </div>
                <div className="text-sm font-medium">{opt.label}</div>
                <div className="text-xs text-text-muted mt-1">{opt.description}</div>
              </motion.button>
            );
          })}
        </div>
      </Section>

      <Section title="Gewenste periode">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Startdatum" required>
            <input
              type="date"
              required
              min={new Date().toISOString().slice(0, 10)}
              value={form.start_date}
              onChange={(e) => set('start_date', e.target.value)}
              className={fieldCls}
            />
          </Field>
          <Field label="Einddatum (optioneel)" hint="Laat leeg voor onbepaalde duur">
            <input
              type="date"
              min={form.start_date || new Date().toISOString().slice(0, 10)}
              value={form.end_date}
              onChange={(e) => set('end_date', e.target.value)}
              className={fieldCls}
            />
          </Field>
        </div>
      </Section>

      <Section title="Caravan">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Kenteken">
            <input value={form.registration} onChange={(e) => set('registration', e.target.value)} className={fieldCls} />
          </Field>
          <Field label="Lengte (meter)">
            <input value={form.length} onChange={(e) => set('length', e.target.value)} placeholder="6.5" className={fieldCls} />
          </Field>
          <Field label="Merk">
            <input value={form.brand} onChange={(e) => set('brand', e.target.value)} className={fieldCls} />
          </Field>
          <Field label="Model">
            <input value={form.model} onChange={(e) => set('model', e.target.value)} className={fieldCls} />
          </Field>
        </div>
      </Section>

      <Section title="Contactgegevens">
        <Field label="Naam" required>
          <input required value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" className={fieldCls} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="E-mail" required>
            <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" className={fieldCls} />
          </Field>
          <Field label="Telefoon" required>
            <input required type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" className={fieldCls} />
          </Field>
        </div>
        <Field label="Opmerking (optioneel)">
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            className={`${fieldCls} min-h-[80px] py-2 resize-none`}
          />
        </Field>
      </Section>
    </ServicePageShell>
  );
}
