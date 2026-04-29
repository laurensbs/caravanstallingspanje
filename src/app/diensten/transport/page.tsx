'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Truck, KeyRound } from 'lucide-react';
import {
  ContactFields, MultiStepShell, Section, Field, fieldCls,
  emptyContact, useServiceSubmit,
} from '@/components/ServiceForm';
import CampingPicker from '@/components/CampingPicker';
import { useLocale } from '@/components/LocaleProvider';
import { ArrowRight as ArrowRightIcon } from 'lucide-react';
import AnimatedServiceIcon from '@/components/AnimatedServiceIcon';

type Mode = 'wij_rijden' | 'zelf';

export default function TransportPage() {
  const { t, locale } = useLocale();
  const formatEur = (eur: number) =>
    new Intl.NumberFormat(locale === 'nl' ? 'nl-NL' : 'en-IE', {
      style: 'currency',
      currency: 'EUR',
    }).format(eur);

  const [mode, setMode] = useState<Mode>('wij_rijden');
  const [contact, setContact] = useState(emptyContact);
  const [camping, setCamping] = useState('');
  const [outboundDate, setOutboundDate] = useState('');
  const [outboundTime, setOutboundTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [description, setDescription] = useState('');
  const [prices, setPrices] = useState<{ wij_rijden: number; zelf: number }>({ wij_rijden: 100, zelf: 50 });

  useEffect(() => {
    fetch('/api/order/prices')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.transport_price_wij_rijden || d?.transport_price_zelf) {
          setPrices({
            wij_rijden: Number(d.transport_price_wij_rijden ?? 100),
            zelf: Number(d.transport_price_zelf ?? 50),
          });
        }
      })
      .catch(() => { /* fallback blijft */ });
  }, []);

  const { submit, submitting, error, done, publicCode } = useServiceSubmit('/api/order/transport');

  const step1Valid = !!(camping && outboundDate && returnDate);
  const currentPrice = mode === 'wij_rijden' ? prices.wij_rijden : prices.zelf;

  const step1 = (
    <>
      <Section title={t('transport.section-route')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ModeCard
            selected={mode === 'wij_rijden'}
            onClick={() => setMode('wij_rijden')}
            icon={Truck}
            title="Wij rijden voor je"
            desc="We halen je caravan op bij de camping en brengen 'm na de stalling-periode terug."
            price={formatEur(prices.wij_rijden)}
          />
          <ModeCard
            selected={mode === 'zelf'}
            onClick={() => setMode('zelf')}
            icon={KeyRound}
            title="Ik breng/haal zelf"
            desc="Jij rijdt zelf van/naar de stalling — wij verzorgen sleuteloverdracht en administratie."
            price={formatEur(prices.zelf)}
          />
        </div>
      </Section>

      <Section title={t('transport.camping-label')}>
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface-2 p-3 flex items-center justify-between text-[12px] text-text-muted gap-3">
          <span className="inline-flex items-center gap-1.5">
            <AnimatedServiceIcon kind="transport" size={14} loop /> Stalling Cruïlles
          </span>
          <ArrowRightIcon size={12} className="text-text-subtle" />
          <span className="truncate text-text">{camping || '—'}</span>
          <ArrowRightIcon size={12} className="text-text-subtle rotate-180" />
          <span className="inline-flex items-center gap-1.5">
            <AnimatedServiceIcon kind="transport" size={14} loop /> Stalling
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
    </>
  );

  const step2 = (
    <>
      <Section title={t('contact.section-heading')}>
        <ContactFields state={contact} onChange={setContact} showLocation={false} />
      </Section>

      <Section title={t('common.summary')}>
        <SummaryRow label="Optie" value={mode === 'wij_rijden' ? 'Wij rijden voor je' : 'Ik breng/haal zelf'} />
        <SummaryRow label={t('transport.camping-label')} value={camping} />
        <SummaryRow label={t('transport.outbound-date')} value={`${outboundDate}${outboundTime ? ` · ${outboundTime}` : ''}`} />
        <SummaryRow label={t('transport.return-date')} value={`${returnDate}${returnTime ? ` · ${returnTime}` : ''}`} />
        <SummaryRow label="Totaal" value={formatEur(currentPrice)} bold />
      </Section>
    </>
  );

  return (
    <MultiStepShell
      paid
      title={t('transport.heading')}
      intro={t('transport.intro')}
      step1={step1}
      step2={step2}
      step1Valid={step1Valid}
      onSubmit={(e) => {
        e.preventDefault();
        submit({
          ...contact,
          mode,
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

function ModeCard({
  selected, onClick, icon: Icon, title, desc, price,
}: {
  selected: boolean;
  onClick: () => void;
  icon: typeof Truck;
  title: string;
  desc: string;
  price: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className={`text-left p-5 rounded-[var(--radius-xl)] border-2 transition-all ${
        selected
          ? 'border-accent bg-surface shadow-md'
          : 'border-border bg-surface hover:border-border-strong'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-[var(--radius-md)] bg-surface-2 border border-border flex items-center justify-center text-text">
          <Icon size={20} />
        </div>
        <div className={`w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center ${selected ? 'border-accent bg-accent' : 'border-border'}`}>
          {selected && <Check size={11} className="text-accent-fg" strokeWidth={3} />}
        </div>
      </div>
      <div className="text-[15px] font-semibold">{title}</div>
      <div className="text-[13px] text-text-muted mt-1">{desc}</div>
      <div className="text-[20px] font-semibold tabular-nums mt-3">{price}</div>
    </motion.button>
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
