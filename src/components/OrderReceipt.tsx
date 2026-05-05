'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Clock, Mail, ArrowRight, Phone } from 'lucide-react';
import Topbar from './marketing/Topbar';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
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
  const distance = 70 + (i % 3) * 10;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    size: 5 + (i % 3) * 2,
    delay: 0.2 + (i % 4) * 0.04,
    color: i % 3 === 0 ? 'var(--orange)' : 'var(--green)',
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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1">
        {/* Sky-soft hero met big checkmark + reservering-nummer */}
        <section className="section-bg-sky-soft">
          <div className="max-w-[820px] mx-auto px-5 sm:px-10 py-14 sm:py-20 text-center">
            <div className="relative mx-auto mb-10" style={{ width: 120, height: 120 }}>
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
                animate={{ scale: [0.6, 1.4, 1.4], opacity: [0, 0.35, 0] }}
                transition={{ duration: 1.6, ease: 'easeOut', times: [0, 0.4, 1] }}
                className="absolute inset-0 rounded-full"
                style={{ background: 'var(--green)', opacity: 0.18 }}
              />
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
                className="absolute inset-3 rounded-full flex items-center justify-center"
                style={{ background: 'var(--green-soft)', border: '2px solid var(--green)' }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.25, type: 'spring', stiffness: 380, damping: 20 }}
                  style={{ color: 'var(--green)' }}
                >
                  <Check size={48} strokeWidth={3} />
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4, ease: EASE }}
            >
              <span className="eyebrow-mk" style={{ display: 'inline-flex', justifyContent: 'center' }}>
                {data?.status ?? 'Ontvangen'}
              </span>
              <h1 className="h1-mk" style={{ marginTop: 4, fontSize: 'clamp(1.8rem, 3.6vw, 2.6rem)' }}>{title}</h1>
              {fallbackBody && !data && (
                <p className="lead-mk" style={{ marginTop: 14 }}>{fallbackBody}</p>
              )}
              {refCode && (
                <div
                  style={{
                    marginTop: 28,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 22px',
                    borderRadius: 14,
                    background: '#fff',
                    border: '1px solid var(--line)',
                    boxShadow: 'var(--shadow-card-mk)',
                  }}
                >
                  <span style={{ fontSize: 11.5, fontFamily: 'var(--sora)', fontWeight: 600, color: 'var(--muted)', letterSpacing: 1 }}>
                    {t('common.reference')}
                  </span>
                  <span style={{ fontFamily: 'var(--sora)', fontWeight: 700, fontSize: 18, color: 'var(--navy)', letterSpacing: 0.5 }}>
                    {refCode}
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Detail + steps + contact */}
        <section className="py-14">
          <div className="max-w-[820px] mx-auto px-5 sm:px-10 space-y-5">
            {data && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4, ease: EASE }}
                className="card-mk"
                style={{ padding: 24 }}
              >
                <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 12px' }}>
                  Reservering
                </h2>
                <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: 10, columnGap: 14, fontSize: 13.5 }}>
                  <DetailRow label="Dienst" value={data.service} />
                  {data.period && <DetailRow label="Periode" value={data.period} />}
                  {data.customerName && <DetailRow label="Naam" value={data.customerName} />}
                  {data.customerEmail && <DetailRow label="E-mail" value={data.customerEmail} />}
                </dl>
              </motion.div>
            )}

            {loaded && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4, ease: EASE }}
                className="card-mk"
                style={{ padding: 24 }}
              >
                <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 6px' }}>
                  Wat gebeurt er nu?
                </h2>
                <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 16px', lineHeight: 1.6 }}>
                  We gaan aan de slag — we koppelen terug zodra het klaar is.
                </p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {steps.map((s, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <span
                        aria-hidden
                        style={{
                          width: 26, height: 26, borderRadius: 999,
                          display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 1,
                          background: s.done ? 'var(--green-soft)' : 'var(--bg)',
                          color: s.done ? 'var(--green)' : 'var(--muted)',
                          border: s.done ? 'none' : '1px solid var(--line)',
                        }}
                      >
                        {s.done ? <Check size={14} strokeWidth={3} /> : <Clock size={13} />}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 14, color: s.done ? 'var(--ink)' : 'var(--ink-2)', lineHeight: 1.5 }}>{s.label}</div>
                        {s.detail && (
                          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{s.detail}</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4, ease: EASE }}
              className="card-mk"
              style={{ padding: 24 }}
            >
              <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 16, color: 'var(--navy)', margin: '0 0 14px' }}>
                Vragen of toelichting?
              </h2>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <Mail size={15} aria-hidden style={{ color: 'var(--orange)' }} />
                  <a href="mailto:info@caravanstalling-spanje.com" style={{ color: 'var(--ink)', textDecoration: 'none' }}>
                    info@caravanstalling-spanje.com
                  </a>
                </li>
                <li style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <Phone size={15} aria-hidden style={{ color: 'var(--orange)' }} />
                  <a href="tel:+34633778699" style={{ color: 'var(--ink)', textDecoration: 'none' }}>
                    +34 633 77 86 99
                  </a>
                </li>
              </ul>
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                <Link href="/" className="btn btn-ghost">
                  {t('common.back-to-website')} <ArrowRight size={14} aria-hidden />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt style={{ color: 'var(--muted)', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.4, fontFamily: 'var(--sora)', fontWeight: 600 }}>{label}</dt>
      <dd style={{ color: 'var(--ink)', margin: 0, textAlign: 'right' }}>{value}</dd>
    </>
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

