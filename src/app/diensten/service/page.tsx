'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import {
  ContactFields, ServicePageShell, Section, Field, fieldCls,
  emptyContact, useServiceSubmit,
} from '@/components/ServiceForm';

// Hardcoded v1 service catalog. Later vervangen door GET op reparatiepanel.
const CATALOG: { name: string; description: string }[] = [
  { name: 'Waxen', description: 'Volledige wax-behandeling van de buitenkant.' },
  { name: 'Schoonmaak (uitgebreid)', description: 'Binnen + buiten — geschikt voor seizoensstart of -eind.' },
  { name: 'Ozonbehandeling', description: 'Geur en bacteriën verwijderen uit de leefruimte.' },
  { name: 'Banden controleren', description: 'Profieldiepte, leeftijd, slijtage en spanning.' },
  { name: 'Imperiaal / dakcheck', description: 'Inspectie van naden, ventilatie en luiken.' },
  { name: 'Anders', description: 'Vermeld het in de omschrijving.' },
];

export default function ServicePage() {
  const [contact, setContact] = useState(emptyContact);
  const [serviceCategory, setServiceCategory] = useState<string>('');
  const [description, setDescription] = useState('');

  const { submit, submitting, error, done, publicCode } = useServiceSubmit('/api/order/service');

  return (
    <ServicePageShell
      title="Service aanvragen"
      intro="Kies wat je wilt laten doen. We bevestigen prijs en planning."
      onSubmit={(e) => {
        e.preventDefault();
        submit({ ...contact, serviceCategory, description });
      }}
      submitting={submitting}
      error={error}
      done={done}
      publicCode={publicCode}
    >
      <Section title="Welke service?">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CATALOG.map((s) => {
            const selected = serviceCategory === s.name;
            return (
              <motion.button
                key={s.name}
                type="button"
                onClick={() => setServiceCategory(s.name)}
                whileTap={{ scale: 0.99 }}
                className={`text-left p-4 rounded-[var(--radius-lg)] border transition-all ${
                  selected
                    ? 'border-accent bg-surface shadow-md'
                    : 'border-border bg-surface hover:border-border-strong'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium">{s.name}</span>
                  <div className={`w-4 h-4 rounded-full border-2 transition-colors ${selected ? 'border-accent bg-accent' : 'border-border'}`}>
                    {selected && <Check size={10} className="text-accent-fg" strokeWidth={3} />}
                  </div>
                </div>
                <div className="text-xs text-text-muted leading-relaxed">{s.description}</div>
              </motion.button>
            );
          })}
        </div>
      </Section>

      <Section title="Toelichting">
        <Field label="Omschrijving (optioneel)">
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Aanvullende info, voorkeursdatum, etc."
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
