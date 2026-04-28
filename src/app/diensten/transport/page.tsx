'use client';

import { useState } from 'react';
import {
  ContactFields, MultiStepShell, Section, Field, fieldCls,
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
  const [outboundTime, setOutboundTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [description, setDescription] = useState('');

  const { submit, submitting, error, done, publicCode } = useServiceSubmit('/api/order/transport');

  const step1Valid = !!(camping && outboundDate && returnDate);

  const step1 = (
    <Section title={t('transport.section-route')}>
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
          <div className="grid grid-cols-[1fr_110px] gap-2">
            <input
              type="date"
              required
              value={outboundDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => {
                const v = e.target.value;
                setOutboundDate(v);
                if (!returnDate || returnDate < v) setReturnDate(v);
              }}
              className={fieldCls}
            />
            <input
              type="time"
              value={outboundTime}
              onChange={(e) => setOutboundTime(e.target.value)}
              className={fieldCls}
              aria-label="Tijd heen"
            />
          </div>
        </Field>
        <Field label={t('transport.return-date')} required>
          <div className="grid grid-cols-[1fr_110px] gap-2">
            <input
              type="date"
              required
              value={returnDate}
              min={outboundDate || new Date().toISOString().slice(0, 10)}
              onChange={(e) => setReturnDate(e.target.value)}
              className={fieldCls}
            />
            <input
              type="time"
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              className={fieldCls}
              aria-label="Tijd terug"
            />
          </div>
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
  );

  const step2 = (
    <>
      <Section title={t('contact.section-heading')}>
        <ContactFields state={contact} onChange={setContact} showLocation={false} />
      </Section>

      <Section title={t('common.summary')}>
        <SummaryRow label={t('transport.camping-label')} value={camping} />
        <SummaryRow label={t('transport.outbound-date')} value={`${outboundDate}${outboundTime ? ` · ${outboundTime}` : ''}`} />
        <SummaryRow label={t('transport.return-date')} value={`${returnDate}${returnTime ? ` · ${returnTime}` : ''}`} />
      </Section>

      <div className="rounded-[var(--radius-xl)] bg-surface-2 border border-border p-4">
        <p className="text-[12px] text-text-muted leading-relaxed">
          <strong className="text-text">{t('transport.billing-note-title')}</strong>{' '}
          {t('transport.billing-note-body')}
        </p>
      </div>
    </>
  );

  return (
    <MultiStepShell
      title={t('transport.heading')}
      intro={t('transport.intro')}
      step1={step1}
      step2={step2}
      step1Valid={step1Valid}
      onSubmit={(e) => {
        e.preventDefault();
        submit({
          ...contact,
          camping,
          outboundDate,
          outboundTime,
          returnDate,
          returnTime,
          description,
        });
      }}
      submitting={submitting}
      error={error}
      done={done}
      publicCode={publicCode}
    />
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-baseline gap-3 py-2 border-b border-border last:border-b-0">
      <span className="text-[13px] text-text-muted">{label}</span>
      <span className={`text-[14px] tabular-nums text-right ${bold ? 'font-semibold' : ''}`}>{value}</span>
    </div>
  );
}
