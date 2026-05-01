'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Clock, Mail, Sparkles } from 'lucide-react';
import { useLocale } from './LocaleProvider';

type Lookup = {
  kind: 'koelkast' | 'airco' | 'stalling' | 'transport' | 'service' | 'reparatie' | 'inspectie' | 'contact';
  ref: string;
  status: string;
  service: string;
  mode?: string | null;
  period: string | null;
  customerEmail: string | null;
  customerName: string | null;
  invoiceCreated: boolean;
  invoiceNumber: string | null;
  forwardedToWorkshop: boolean;
  forwardCode?: string;
};

interface Props {
  refCode: string | null;
  /** Statische fallback als ref niet aanwezig of niet vindbaar is. */
  fallbackTitle?: string;
  fallbackBody?: string;
}

const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const distance = 60 + (i % 3) * 8;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    size: 4 + (i % 3) * 2,
    delay: 0.2 + (i % 4) * 0.04,
    color: i % 3 === 0 ? 'var(--color-warning)' : 'var(--color-success)',
  };
});

const EASE = [0.16, 1, 0.3, 1] as const;

export default function OrderReceipt({ refCode, fallbackTitle, fallbackBody }: Props) {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  const [data, setData] = useState<Lookup | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!refCode) { setLoaded(true); return; }
    fetch(`/api/order/lookup?ref=${encodeURIComponent(refCode)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setData(d); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [refCode]);

  const title = data
    ? data.kind === 'transport' ? t('thanks.request-title') : t('thanks.payment-title')
    : (fallbackTitle ?? t('thanks.payment-title'));

  const steps = buildSteps(data, t as unknown as TFn);

  return (
    <main
      className="min-h-screen flex items-start justify-center page-public page-public-dark px-5 sm:px-6 py-10 sm:py-16"
      style={{ background: 'linear-gradient(180deg, #0A1929 0%, #050D18 100%)' }}
    >
      <div className="max-w-lg w-full">
        {/* Confetti badge */}
        <div className="relative w-24 h-24 mx-auto mb-7">
          {!reduce && SPARKS.map((s, i) => (
            <motion.span
              key={i}
              aria-hidden
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], x: s.x, y: s.y, scale: [0, 1, 0.8] }}
              transition={{ duration: 1.1, delay: s.delay, ease: 'easeOut' }}
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: s.size, height: s.size,
                marginLeft: -s.size / 2, marginTop: -s.size / 2,
                background: s.color,
              }}
            />
          ))}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.5, 1.5], opacity: [0, 0.45, 0] }}
            transition={{ duration: 1.6, ease: 'easeOut', times: [0, 0.4, 1] }}
            className="absolute inset-0 rounded-full"
            style={{ background: 'var(--color-success)', opacity: 0.18 }}
          />
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
            className="absolute inset-2 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-success-soft)' }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 380, damping: 20 }}
              style={{ color: 'var(--color-success)' }}
            >
              <Check size={32} strokeWidth={3} />
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
            <Sparkles size={11} /> {data?.status ?? 'Ontvangen'}
          </div>
          <h1 className="text-[28px] sm:text-3xl font-semibold tracking-tight mb-2 leading-tight">{title}</h1>
          {fallbackBody && !data && (
            <p className="text-text-muted leading-relaxed text-[15px]">{fallbackBody}</p>
          )}
          {refCode && (
            <p className="text-[13px] text-text-muted mt-3 font-mono">
              {t('common.reference')} <span className="text-text font-semibold">{refCode}</span>
            </p>
          )}
        </motion.div>

        {/* Detail-blok */}
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4, ease: EASE }}
            className="card-surface p-5 mb-6"
          >
            <div className="space-y-2.5">
              <DetailRow label="Dienst" value={data.service} />
              {data.period && <DetailRow label="Periode" value={data.period} />}
              {data.customerName && <DetailRow label="Naam" value={data.customerName} />}
              {data.customerEmail && <DetailRow label="E-mail" value={data.customerEmail} />}
            </div>
          </motion.div>
        )}

        {/* Wat gebeurt er nu? */}
        {loaded && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4, ease: EASE }}
            className="card-surface p-5 mb-8"
          >
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-2">
              Wat gebeurt er nu?
            </h2>
            <p className="text-[14px] text-text mb-4 leading-relaxed">
              We gaan aan de slag — we koppelen terug zodra het klaar is.
            </p>
            <ul className="space-y-3">
              {steps.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: s.done ? 'var(--color-success-soft)' : 'var(--color-surface-2)',
                      color: s.done ? 'var(--color-success)' : 'var(--color-text-muted)',
                    }}
                  >
                    {s.done ? <Check size={13} strokeWidth={3} /> : <Clock size={12} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-[14px] ${s.done ? 'text-text' : 'text-text-muted'}`}>{s.label}</div>
                    {s.detail && (
                      <div className="text-[12px] text-text-subtle mt-0.5">{s.detail}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4, ease: EASE }}
          className="text-center pt-5 border-t border-border space-y-3"
        >
          <p className="text-[13px] text-text-muted">Vragen? We helpen je graag verder.</p>
          <p className="text-[12px] text-text-muted inline-flex items-center justify-center gap-1.5 pt-1">
            <Mail size={12} />
            <a href="mailto:info@caravanstalling-spanje.com" className="text-text-muted hover:text-text underline-offset-4 hover:underline">
              info@caravanstalling-spanje.com
            </a>
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block text-[13px] text-text-muted hover:text-text underline-offset-4 hover:underline transition-colors"
            >
              {t('common.back-to-website')}
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-3">
      <span className="text-[12px] text-text-muted uppercase tracking-[0.14em]">{label}</span>
      <span className="text-[14px] text-text text-right">{value}</span>
    </div>
  );
}

type Step = { label: string; detail?: string; done: boolean };

type TFn = (k: never, ...args: (string | number)[]) => string;

function buildSteps(data: Lookup | null, _t: TFn): Step[] {
  void _t;
  if (!data) {
    return [
      { label: 'Aanvraag ontvangen', done: true },
      { label: 'We koppelen terug zodra het klaar is', done: false },
    ];
  }

  // Contact-bericht heeft een eigen, simpel pad.
  if (data.kind === 'contact') {
    return [
      { label: 'Bericht ontvangen', done: true },
      { label: 'We sturen je snel een persoonlijke reactie', done: false },
    ];
  }

  const steps: Step[] = [];
  // 1. Ontvangen / betaald
  if (data.kind === 'reparatie' || data.kind === 'inspectie') {
    steps.push({ label: 'Aanvraag ontvangen', done: true });
  } else {
    steps.push({
      label: 'Betaling ontvangen',
      done: data.status === 'betaald' || data.status === 'doorgestuurd',
    });
  }

  // 2. Mail
  steps.push({
    label: 'Bevestigingsmail verstuurd',
    detail: data.customerEmail ? `naar ${data.customerEmail}` : undefined,
    done: !!data.customerEmail,
  });

  // 3. Bestelling vastgelegd in ons systeem — vervangt de oude
  //    'pro forma'-step want klant hoeft dat niet te zien (boekhouding-only).
  if (data.kind === 'koelkast' || data.kind === 'airco' || data.kind === 'stalling' || data.kind === 'service' || data.kind === 'transport') {
    steps.push({
      label: 'Bestelling vastgelegd in ons systeem',
      done: data.invoiceCreated,
    });
  }

  // 4. Doorgezet naar werkplaats — alleen voor service (intake naar reparatiepanel)
  if (data.kind === 'service') {
    steps.push({
      label: 'Doorgegeven aan onze werkplaats',
      detail: data.forwardCode ? `intern: ${data.forwardCode}` : undefined,
      done: data.forwardedToWorkshop,
    });
  }

  // 5. Volgende stap — kind-specifieke copy
  let nextLabel = '';
  switch (data.kind) {
    case 'koelkast':
    case 'airco':
      nextLabel = 'Onze monteur bezorgt op je staanplaats. Je hoort van ons als hij klaar staat.';
      break;
    case 'service':
      nextLabel = 'Onze werkplaats gaat aan de slag — je caravan staat hier al. We sturen je binnenkort de factuur met de uitgevoerde reparatie.';
      break;
    case 'stalling':
      nextLabel = 'We bekijken je aanvraag. Bij akkoord krijg je het adres en kun je langskomen; helaas niet toegekend? Dan laten we het ook weten.';
      break;
    case 'transport':
      nextLabel = 'We zorgen dat hij op de bestemming staat. Je hoort van ons zodra het is gepland of uitgevoerd.';
      break;
    case 'reparatie':
    case 'inspectie':
      nextLabel = 'Onze werkplaats gaat aan de slag! Je hoort binnenkort van ons.';
      break;
  }
  if (nextLabel) {
    steps.push({ label: nextLabel, done: false });
  }
  return steps;
}

