'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Check, Loader2, ShieldCheck, Lock, Pencil,
} from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import { useLocale } from '@/components/LocaleProvider';
import type { StringKey } from '@/lib/i18n';

const EASE = [0.16, 1, 0.3, 1] as const;
type T = (k: StringKey, ...a: (string | number)[]) => string;

type Type = 'binnen' | 'buiten';
type Step = 1 | 2 | 3;

type FormState = {
  type: Type;
  start_date: string;
  brand: string;
  model: string;
  length: string;
  registration: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  vat_number: string;
  notes: string;
};

const empty: FormState = {
  type: 'buiten',
  start_date: '',
  brand: '',
  model: '',
  length: '',
  registration: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  postal_code: '',
  city: '',
  country: 'Nederland',
  vat_number: '',
  notes: '',
};

export default function ConfiguratorPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const canStep1 = form.start_date.length === 10;
  const canStep2 = form.name.length >= 2 && /\S+@\S+\.\S+/.test(form.email) && form.phone.length >= 5
    && form.address.length >= 2 && form.postal_code.length >= 2 && form.city.length >= 2 && form.country.length >= 2;

  async function submit() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/order/stalling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Aanvraag mislukt');
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        router.push(`/diensten/bedankt?ref=${encodeURIComponent(data.ref || '')}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Aanvraag mislukt';
      setError(msg);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1">
        <Hero t={t} />
        <Stepper t={t} step={step} />

        <section className="pb-16 sm:pb-20">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-10 items-start">
              <div>
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <StepCard key="1">
                      <Configurator t={t} form={form} update={update} />
                      <Nav
                        right={
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={!canStep1}
                            onClick={() => setStep(2)}
                            style={{ opacity: canStep1 ? 1 : 0.55, cursor: canStep1 ? 'pointer' : 'not-allowed' }}
                          >
                            {t('bk1.cfg-next')} <ArrowRight size={15} aria-hidden />
                          </button>
                        }
                      />
                    </StepCard>
                  )}
                  {step === 2 && (
                    <StepCard key="2">
                      <Details t={t} form={form} update={update} />
                      <Nav
                        left={
                          <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                            <ArrowLeft size={14} aria-hidden /> {t('bk1.det-back')}
                          </button>
                        }
                        right={
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={!canStep2}
                            onClick={() => setStep(3)}
                            style={{ opacity: canStep2 ? 1 : 0.55, cursor: canStep2 ? 'pointer' : 'not-allowed' }}
                          >
                            {t('bk1.det-next')} <ArrowRight size={15} aria-hidden />
                          </button>
                        }
                      />
                    </StepCard>
                  )}
                  {step === 3 && (
                    <StepCard key="3">
                      <Summary t={t} form={form} onEdit={(s) => setStep(s)} />
                      {error && (
                        <div
                          role="alert"
                          style={{
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            color: '#991B1B',
                            padding: 14,
                            borderRadius: 10,
                            marginTop: 16,
                            fontSize: 13.5,
                          }}
                        >
                          <strong>{t('bk1.error-prefix')}</strong> {error}
                        </div>
                      )}
                      <Nav
                        left={
                          <button type="button" className="btn btn-ghost" onClick={() => setStep(2)} disabled={submitting}>
                            <ArrowLeft size={14} aria-hidden /> {t('bk1.det-back')}
                          </button>
                        }
                        right={
                          <button type="button" className="btn btn-primary" onClick={submit} disabled={submitting}>
                            {submitting ? (
                              <>
                                <Loader2 size={15} className="animate-spin" aria-hidden /> ...
                              </>
                            ) : (
                              <>
                                <Lock size={14} aria-hidden /> {t('bk1.sum-submit')}
                              </>
                            )}
                          </button>
                        }
                      />
                    </StepCard>
                  )}
                </AnimatePresence>
              </div>

              <Sidebar t={t} form={form} step={step} />
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

// ─── Hero ─────────────────────────────────────
function Hero({ t }: { t: T }) {
  const reduce = useReducedMotion();
  const fade = (delay = 0) =>
    reduce
      ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: EASE, delay } };

  return (
    <section className="section-bg-sky-soft">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-12 sm:py-16">
        <div className="max-w-[820px]">
          <motion.span {...fade(0)} className="eyebrow-mk">{t('bk1.hero-eyebrow')}</motion.span>
          <motion.h1 {...fade(0.06)} className="h1-mk" style={{ marginTop: 4 }}>{t('bk1.hero-h1')}</motion.h1>
          <motion.p {...fade(0.14)} className="lead-mk" style={{ marginTop: 14, maxWidth: 700 }}>{t('bk1.hero-lead')}</motion.p>
        </div>
      </div>
    </section>
  );
}

// ─── Stepper ──────────────────────────────────
function Stepper({ t, step }: { t: T; step: Step }) {
  const labels: StringKey[] = ['bk1.step-1', 'bk1.step-2', 'bk1.step-3', 'bk1.step-4'];
  return (
    <div className="border-t border-b" style={{ background: '#fff', borderColor: 'var(--line)' }}>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-5">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
          {labels.map((labelKey, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            return (
              <div key={labelKey} className="flex items-center gap-2 sm:gap-3" style={{ flex: '0 0 auto' }}>
                <span
                  aria-hidden
                  style={{
                    width: 28, height: 28, borderRadius: 999,
                    display: 'grid', placeItems: 'center',
                    fontFamily: 'var(--sora)', fontWeight: 700, fontSize: 12.5,
                    background: done ? 'var(--green)' : active ? 'var(--navy)' : 'var(--bg)',
                    color: done || active ? '#fff' : 'var(--muted)',
                    border: done || active ? 'none' : '1px solid var(--line)',
                  }}
                >
                  {done ? <Check size={14} /> : n}
                </span>
                <span
                  className={active ? 'stepper-label active' : 'stepper-label'}
                  style={{
                    fontFamily: 'var(--sora)',
                    fontWeight: active || done ? 600 : 500,
                    fontSize: 13,
                    color: active ? 'var(--navy)' : done ? 'var(--green)' : 'var(--muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t(labelKey)}
                </span>
                {i < labels.length - 1 && (
                  <span aria-hidden className="stepper-sep" style={{ width: 24, height: 1, background: 'var(--line)' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── StepCard wrapper (animation) ─────────────
function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="card-mk"
      style={{ padding: 28 }}
    >
      {children}
    </motion.div>
  );
}

function Nav({ left, right }: { left?: React.ReactNode; right: React.ReactNode }) {
  return (
    <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

// ─── Step 1: Configurator ─────────────────────
function Configurator({
  t, form, update,
}: {
  t: T;
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  const types: Array<{ value: Type; tKey: StringKey; dKey: StringKey }> = [
    { value: 'buiten', tKey: 'bk1.cfg-type-buiten-t', dKey: 'bk1.cfg-type-buiten-d' },
    { value: 'binnen', tKey: 'bk1.cfg-type-binnen-t', dKey: 'bk1.cfg-type-binnen-d' },
  ];
  return (
    <div>
      <h2 className="h2-mk" style={{ fontSize: '1.5rem', margin: '0 0 18px' }}>{t('bk1.cfg-h2')}</h2>

      <div className="field-mk" style={{ marginBottom: 20 }}>
        <label>{t('bk1.cfg-type-label')}</label>
        {types.map((tp) => {
          const sel = form.type === tp.value;
          return (
            <button
              key={tp.value}
              type="button"
              onClick={() => update('type', tp.value)}
              className={sel ? 'radio-card selected' : 'radio-card'}
              style={{ width: '100%', textAlign: 'left' }}
              aria-pressed={sel}
            >
              <span className="dot" aria-hidden />
              <div className="info">
                <h4>{t(tp.tKey)} <span className="price">{t('bk1.side-on-request')}</span></h4>
                <p>{t(tp.dKey)}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="field-mk">
        <label htmlFor="bk-start">{t('bk1.cfg-start-label')}</label>
        <input
          id="bk-start"
          type="date"
          value={form.start_date}
          onChange={(e) => update('start_date', e.target.value)}
        />
        <div className="hint">{t('bk1.cfg-start-hint')}</div>
      </div>

      <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 15, color: 'var(--navy)', margin: '24px 0 12px' }}>
        {t('bk1.cfg-caravan-h3')}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <div className="field-mk">
          <label htmlFor="bk-brand">{t('bk1.cfg-brand')}</label>
          <input id="bk-brand" type="text" value={form.brand} onChange={(e) => update('brand', e.target.value)} placeholder="Hobby" />
        </div>
        <div className="field-mk">
          <label htmlFor="bk-model">{t('bk1.cfg-model')}</label>
          <input id="bk-model" type="text" value={form.model} onChange={(e) => update('model', e.target.value)} placeholder="De Luxe 460" />
        </div>
        <div className="field-mk">
          <label htmlFor="bk-length">{t('bk1.cfg-length')}</label>
          <input id="bk-length" type="text" value={form.length} onChange={(e) => update('length', e.target.value)} placeholder="6.5" />
        </div>
        <div className="field-mk">
          <label htmlFor="bk-reg">{t('bk1.cfg-registration')}</label>
          <input id="bk-reg" type="text" value={form.registration} onChange={(e) => update('registration', e.target.value)} placeholder="WL-AB-12" />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Details ──────────────────────────
function Details({
  t, form, update,
}: {
  t: T;
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div>
      <h2 className="h2-mk" style={{ fontSize: '1.5rem', margin: '0 0 18px' }}>{t('bk1.det-h2')}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <div className="field-mk sm:col-span-2">
          <label htmlFor="bk-name">{t('bk1.det-name')}</label>
          <input id="bk-name" type="text" value={form.name} onChange={(e) => update('name', e.target.value)} required />
        </div>
        <div className="field-mk">
          <label htmlFor="bk-email">{t('bk1.det-email')}</label>
          <input id="bk-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
        </div>
        <div className="field-mk">
          <label htmlFor="bk-phone">{t('bk1.det-phone')}</label>
          <input id="bk-phone" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} required />
        </div>
      </div>

      <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 15, color: 'var(--navy)', margin: '12px 0 12px' }}>
        {t('bk1.det-address-h3')}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <div className="field-mk sm:col-span-2">
          <label htmlFor="bk-address">{t('bk1.det-address')}</label>
          <input id="bk-address" type="text" value={form.address} onChange={(e) => update('address', e.target.value)} required />
        </div>
        <div className="field-mk">
          <label htmlFor="bk-postal">{t('bk1.det-postal')}</label>
          <input id="bk-postal" type="text" value={form.postal_code} onChange={(e) => update('postal_code', e.target.value)} required />
        </div>
        <div className="field-mk">
          <label htmlFor="bk-city">{t('bk1.det-city')}</label>
          <input id="bk-city" type="text" value={form.city} onChange={(e) => update('city', e.target.value)} required />
        </div>
        <div className="field-mk">
          <label htmlFor="bk-country">{t('bk1.det-country')}</label>
          <input id="bk-country" type="text" value={form.country} onChange={(e) => update('country', e.target.value)} required />
        </div>
        <div className="field-mk">
          <label htmlFor="bk-vat">{t('bk1.det-vat')}</label>
          <input id="bk-vat" type="text" value={form.vat_number} onChange={(e) => update('vat_number', e.target.value)} />
        </div>
        <div className="field-mk sm:col-span-2">
          <label htmlFor="bk-notes">{t('bk1.det-notes')}</label>
          <textarea id="bk-notes" value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} />
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Summary ──────────────────────────
function Summary({
  t, form, onEdit,
}: {
  t: T;
  form: FormState;
  onEdit: (step: Step) => void;
}) {
  const typeLabel = form.type === 'binnen' ? t('bk1.cfg-type-binnen-t') : t('bk1.cfg-type-buiten-t');
  return (
    <div>
      <h2 className="h2-mk" style={{ fontSize: '1.5rem', margin: '0 0 8px' }}>{t('bk1.sum-h2')}</h2>
      <p style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.6, margin: '0 0 22px' }}>{t('bk1.sum-intro')}</p>

      <SumSection title={t('bk1.sum-section-conf')} onEdit={() => onEdit(1)} editLabel={t('bk1.sum-edit')}>
        <SumRow k={t('bk1.side-type')} v={typeLabel} />
        <SumRow k={t('bk1.side-start')} v={form.start_date} />
        {(form.brand || form.model) && <SumRow k={t('bk1.side-caravan')} v={`${form.brand} ${form.model}`.trim()} />}
        {form.length && <SumRow k={t('bk1.cfg-length')} v={form.length} />}
        {form.registration && <SumRow k={t('bk1.cfg-registration')} v={form.registration} />}
      </SumSection>

      <SumSection title={t('bk1.sum-section-cust')} onEdit={() => onEdit(2)} editLabel={t('bk1.sum-edit')}>
        <SumRow k={t('bk1.det-name')} v={form.name} />
        <SumRow k={t('bk1.det-email')} v={form.email} />
        <SumRow k={t('bk1.det-phone')} v={form.phone} />
        <SumRow k={t('bk1.det-address')} v={`${form.address}, ${form.postal_code} ${form.city}, ${form.country}`} />
        {form.vat_number && <SumRow k={t('bk1.det-vat')} v={form.vat_number} />}
        {form.notes && <SumRow k={t('bk1.det-notes')} v={form.notes} />}
      </SumSection>

      <div
        style={{
          marginTop: 18,
          background: 'var(--sky-soft)',
          border: '1px solid rgba(47,66,84,0.10)',
          borderRadius: 10,
          padding: 16,
          fontSize: 13.5,
          color: 'var(--navy)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}
      >
        <ShieldCheck size={18} aria-hidden style={{ flexShrink: 0, marginTop: 1 }} />
        <span>{t('bk1.sum-pay-info')}</span>
      </div>
    </div>
  );
}

function SumSection({
  title, children, onEdit, editLabel,
}: {
  title: string;
  children: React.ReactNode;
  onEdit: () => void;
  editLabel: string;
}) {
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 18, marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 14, color: 'var(--navy)', margin: 0, letterSpacing: 0.3 }}>
          {title}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 12,
            color: 'var(--orange-d)', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <Pencil size={12} aria-hidden /> {editLabel}
        </button>
      </div>
      <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: 8, columnGap: 14, fontSize: 13.5 }}>
        {children}
      </dl>
    </div>
  );
}

function SumRow({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt style={{ color: 'var(--muted)' }}>{k}</dt>
      <dd style={{ color: 'var(--ink)', margin: 0 }}>{v || '—'}</dd>
    </>
  );
}

// ─── Sidebar ──────────────────────────────────
function Sidebar({ t, form, step }: { t: T; form: FormState; step: Step }) {
  const empty = step === 1 && !form.start_date;
  const typeLabel = form.type === 'binnen' ? t('bk1.cfg-type-binnen-t') : t('bk1.cfg-type-buiten-t');
  return (
    <aside className="config-panel-wrap" style={{ position: 'sticky', top: 20 }}>
      <div className="card-mk card-lift" style={{ padding: 24 }}>
        <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 15, color: 'var(--navy)', margin: '0 0 16px' }}>
          {t('bk1.side-title')}
        </h3>

        {empty ? (
          <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{t('bk1.side-empty')}</p>
        ) : (
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '110px 1fr', rowGap: 10, columnGap: 12, fontSize: 13 }}>
            <dt style={{ color: 'var(--muted)' }}>{t('bk1.side-type')}</dt>
            <dd style={{ color: 'var(--ink)', margin: 0, fontFamily: 'var(--sora)', fontWeight: 600 }}>{typeLabel}</dd>
            {form.start_date && (
              <>
                <dt style={{ color: 'var(--muted)' }}>{t('bk1.side-start')}</dt>
                <dd style={{ color: 'var(--ink)', margin: 0 }}>{form.start_date}</dd>
              </>
            )}
            {(form.brand || form.model) && (
              <>
                <dt style={{ color: 'var(--muted)' }}>{t('bk1.side-caravan')}</dt>
                <dd style={{ color: 'var(--ink)', margin: 0 }}>{`${form.brand} ${form.model}`.trim()}</dd>
              </>
            )}
            {form.name && (
              <>
                <dt style={{ color: 'var(--muted)' }}>{t('bk1.side-name')}</dt>
                <dd style={{ color: 'var(--ink)', margin: 0 }}>{form.name}</dd>
              </>
            )}
          </dl>
        )}

        <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 13, color: 'var(--muted)', letterSpacing: 0.3 }}>
            {t('bk1.side-total')}
          </span>
          <span style={{ fontFamily: 'var(--sora)', fontWeight: 700, fontSize: 18, color: 'var(--navy)' }}>
            {t('bk1.side-on-request')}
          </span>
        </div>

        <div style={{ marginTop: 14, fontSize: 11.5, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Lock size={12} aria-hidden /> {t('bk1.side-secure')}
        </div>
      </div>
    </aside>
  );
}
