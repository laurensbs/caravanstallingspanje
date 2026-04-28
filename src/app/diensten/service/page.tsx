'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import {
  ContactFields, ServicePageShell, Section, Field, fieldCls,
  emptyContact, useServiceSubmit,
} from '@/components/ServiceForm';
import { Skeleton } from '@/components/ui';

type CatalogService = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price_eur: number;
};

function formatEur(eur: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(eur);
}

export default function ServicePage() {
  const [catalog, setCatalog] = useState<CatalogService[] | null>(null);
  const [contact, setContact] = useState(emptyContact);
  const [serviceSlug, setServiceSlug] = useState<string>('');
  const [description, setDescription] = useState('');

  const { submit, submitting, error, done } = useServiceSubmit('/api/order/service');

  useEffect(() => {
    fetch('/api/order/services-catalog')
      .then((r) => r.json())
      .then((d) => setCatalog(d.services || []))
      .catch(() => setCatalog([]));
  }, []);

  const selected = catalog?.find((s) => s.slug === serviceSlug);

  return (
    <ServicePageShell
      paid
      title="Service aanvragen"
      intro="Kies een service en betaal direct online."
      onSubmit={(e) => {
        e.preventDefault();
        if (!serviceSlug) return;
        submit({ ...contact, serviceCategory: serviceSlug, description });
      }}
      submitting={submitting}
      error={error}
      done={done}
      doneTitle="Doorsturen naar betaling…"
    >
      <Section title="Welke service?">
        {catalog === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" delayMs={i * 40} />
            ))}
          </div>
        ) : catalog.length === 0 ? (
          <div className="card-surface p-8 text-center">
            <p className="text-sm text-text-muted">
              Er zijn op dit moment geen services beschikbaar. Neem contact op via{' '}
              <a
                href="mailto:info@caravanstalling-spanje.com"
                className="text-text underline-offset-4 hover:underline"
              >
                info@caravanstalling-spanje.com
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {catalog.map((s) => {
              const sel = serviceSlug === s.slug;
              return (
                <motion.button
                  key={s.id}
                  type="button"
                  onClick={() => setServiceSlug(s.slug)}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                  className={`text-left p-4 rounded-[var(--radius-lg)] border transition-all ${
                    sel
                      ? 'border-accent bg-surface shadow-md'
                      : 'border-border bg-surface hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <span className="text-sm font-medium">{s.name}</span>
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-colors shrink-0 ${
                        sel ? 'border-accent bg-accent' : 'border-border'
                      }`}
                    >
                      {sel && <Check size={10} className="text-accent-fg" strokeWidth={3} />}
                    </div>
                  </div>
                  {s.description && (
                    <p className="text-xs text-text-muted leading-relaxed mb-2">{s.description}</p>
                  )}
                  <div className="text-sm font-semibold tabular-nums">{formatEur(s.price_eur)}</div>
                </motion.button>
              );
            })}
          </div>
        )}
      </Section>

      {selected && (
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
      )}

      <Section title="Contactgegevens">
        <ContactFields state={contact} onChange={setContact} />
      </Section>

      {selected && (
        <div className="rounded-[var(--radius-xl)] bg-surface-2 border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Te betalen</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatEur(selected.price_eur)}
            </span>
          </div>
          <p className="text-[11px] text-text-muted mt-2">
            Je gaat na verzenden naar onze beveiligde Stripe-betaalpagina.
          </p>
        </div>
      )}
    </ServicePageShell>
  );
}
