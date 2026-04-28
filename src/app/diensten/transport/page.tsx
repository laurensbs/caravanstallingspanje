'use client';

import { useState } from 'react';
import {
  ContactFields, ServicePageShell, Section, Field, fieldCls,
  emptyContact, useServiceSubmit,
} from '@/components/ServiceForm';
import CampingPicker from '@/components/CampingPicker';
import { useLocale } from '@/components/LocaleProvider';
import { Truck, ArrowRight as ArrowRightIcon } from 'lucide-react';

export default function TransportPage() {
  const { t } = useLocale();

  const [contact, setContact] = useState(emptyContact);
  const [camping, setCamping] = useState('');
  const [outboundDate, setOutboundDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [description, setDescription] = useState('');

  const { submit, submitting, error, done, publicCode } = useServiceSubmit('/api/order/transport');

  return (
    <ServicePageShell
      title={t('transport.heading')}
      intro={t('transport.intro')}
      onSubmit={(e) => {
        e.preventDefault();
        submit({
          ...contact,
          camping,
          outboundDate,
          returnDate,
          description,
        });
      }}
      submitting={submitting}
      error={error}
      done={done}
      publicCode={publicCode}
    >
      <Section title={t('transport.section-route')}>
        {/* Visuele samenvatting van de route — stalling ↔ camping. */}
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface-2 p-3 flex items-center justify-between text-[12px] text-text-muted gap-3">
          <span className="inline-flex items-center gap-1.5">
            <Truck size={13} /> Stalling Cruïlles
          </span>
          <ArrowRightIcon size={12} className="text-text-subtle" />
          <span className="truncate text-text">{camping || '—'}</span>
          <ArrowRightIcon size={12} className="text-text-subtle rotate-180" />
          <span className="inline-flex items-center gap-1.5">
            <Truck size={13} /> Stalling
          </span>
        </div>

        <Field label={t('transport.camping-label')} required>
          <CampingPicker
            value={camping}
            onChange={setCamping}
            placeholder={t('fridge.camping-placeholder')}
            required
            ariaLabel={t('transport.camping-label')}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={t('transport.outbound-date')} required>
            <input
              type="date"
              required
              value={outboundDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => {
                const v = e.target.value;
                setOutboundDate(v);
                // Auto-vul de terug-datum als die nog leeg is of vóór de heen-datum ligt.
                if (!returnDate || returnDate < v) setReturnDate(v);
              }}
              className={fieldCls}
            />
          </Field>
          <Field label={t('transport.return-date')} required>
            <input
              type="date"
              required
              value={returnDate}
              min={outboundDate || new Date().toISOString().slice(0, 10)}
              onChange={(e) => setReturnDate(e.target.value)}
              className={fieldCls}
            />
          </Field>
        </div>

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
        <ContactFields state={contact} onChange={setContact} showLocation={false} />
      </Section>

      <div className="rounded-[var(--radius-xl)] bg-surface-2 border border-border p-4">
        <p className="text-[12px] text-text-muted leading-relaxed">
          <strong className="text-text">{t('transport.billing-note-title')}</strong>{' '}
          {t('transport.billing-note-body')}
        </p>
      </div>
    </ServicePageShell>
  );
}
