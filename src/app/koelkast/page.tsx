'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { calculatePrice, formatEur, PRICES, MIN_DAYS, type DeviceType } from '@/lib/pricing';

type FormState = {
  device_type: DeviceType;
  name: string;
  email: string;
  phone: string;
  camping: string;
  spot_number: string;
  start_date: string;
  end_date: string;
  notes: string;
};

const empty: FormState = {
  device_type: 'Grote koelkast',
  name: '',
  email: '',
  phone: '',
  camping: '',
  spot_number: '',
  start_date: '',
  end_date: '',
  notes: '',
};

export default function KoelkastBestelPagina() {
  const [form, setForm] = useState<FormState>(empty);
  const [campings, setCampings] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ total: number; days: number } | null>(null);
  const [soldOut, setSoldOut] = useState(false);
  const [waitlistDone, setWaitlistDone] = useState(false);

  useEffect(() => {
    fetch('/api/order/campings')
      .then(r => r.json())
      .then(d => setCampings(d.campings || []))
      .catch(() => setCampings([]));
  }, []);

  const price = useMemo(() => {
    if (!form.start_date || !form.end_date) return null;
    if (new Date(form.end_date) <= new Date(form.start_date)) return null;
    try {
      return calculatePrice(form.device_type, form.start_date, form.end_date);
    } catch { return null; }
  }, [form.device_type, form.start_date, form.end_date]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/order/fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.status === 409 && data.soldOut) {
        setSoldOut(true);
        return;
      }
      if (!res.ok || !data.success) {
        setError(data.error || 'Er ging iets mis');
        return;
      }
      // Als Stripe Checkout beschikbaar is, redirect direct.
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      // Fallback: betaling later geregeld door admin.
      setDone({ total: data.total, days: data.days });
    } catch {
      setError('Verbindingsfout');
    } finally {
      setSubmitting(false);
    }
  };

  const submitWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/order/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Aanmelden mislukt');
        return;
      }
      setWaitlistDone(true);
    } catch {
      setError('Verbindingsfout');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md text-center"
        >
          <div className="w-12 h-12 rounded-full bg-success-soft text-success flex items-center justify-center mx-auto mb-6">
            <Check size={20} />
          </div>
          <h1 className="text-2xl font-medium tracking-tight mb-3">Aanvraag ontvangen</h1>
          <p className="text-text-muted leading-relaxed">
            Bedankt! We hebben je aanvraag voor {done.days} dagen ontvangen — totaalbedrag {formatEur(done.total)}.
            We nemen binnen één werkdag contact op om de huur te bevestigen.
          </p>
          <p className="text-sm text-text-muted mt-8">
            Vragen? <a href="mailto:info@caravanstalling-spanje.com" className="text-text underline-offset-4 hover:underline">info@caravanstalling-spanje.com</a>
          </p>
        </motion.div>
      </main>
    );
  }

  if (waitlistDone) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md text-center"
        >
          <div className="w-12 h-12 rounded-full bg-success-soft text-success flex items-center justify-center mx-auto mb-6">
            <Check size={20} />
          </div>
          <h1 className="text-2xl font-medium tracking-tight mb-3">Op de wachtlijst</h1>
          <p className="text-text-muted leading-relaxed">
            We hebben je gegevens genoteerd. Zodra er voor jouw periode een {form.device_type.toLowerCase()} vrijkomt, mailen we je direct.
          </p>
        </motion.div>
      </main>
    );
  }

  if (soldOut) {
    return (
      <main className="min-h-screen bg-bg">
        <div className="max-w-md mx-auto px-6 py-12 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-12 h-12 rounded-full bg-warning-soft text-warning flex items-center justify-center mb-6">
              <AlertTriangle size={20} />
            </div>
            <h1 className="text-2xl font-medium tracking-tight mb-2">Helaas vol</h1>
            <p className="text-text-muted leading-relaxed mb-2">
              Voor de gevraagde periode zijn alle {form.device_type.toLowerCase()}en al gereserveerd.
            </p>
            <p className="text-text-muted leading-relaxed mb-8">
              Laat je gegevens achter en we mailen je zodra er een vrijkomt — of pas je periode aan.
            </p>
            <form onSubmit={submitWaitlist} className="space-y-3">
              {error && (
                <div className="rounded-[var(--radius-md)] bg-danger-soft text-danger px-4 py-3 text-sm">{error}</div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-[var(--radius-md)] bg-accent text-accent-fg font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {submitting ? 'Bezig...' : 'Plaats me op de wachtlijst'}
              </button>
              <button
                type="button"
                onClick={() => { setSoldOut(false); setError(''); }}
                className="w-full h-12 rounded-[var(--radius-md)] border border-border bg-surface hover:border-border-strong text-sm font-medium transition-colors"
              >
                Periode aanpassen
              </button>
            </form>
            <p className="text-xs text-text-muted mt-6">
              Je gegevens (naam, e-mail, gewenste periode) worden alleen gebruikt om contact op te nemen zodra er plek is.
            </p>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-3xl mx-auto px-6 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-text-muted">
              Caravanstalling
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight">
            Bestel een koelkast
          </h1>
          <p className="text-text-muted mt-3 text-base sm:text-lg leading-relaxed max-w-xl">
            Bezorgd op je staanplaats aan de Costa Brava. Minimum één week,
            daarna per dag.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mt-8 sm:mt-10 rounded-[var(--radius-xl)] overflow-hidden border border-border bg-surface aspect-[4/3] sm:aspect-[16/9] relative"
        >
          <Image
            src="/images/koelkast.webp"
            alt="Koelkast op camping"
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </motion.div>

        <form onSubmit={submit} className="mt-10 space-y-8">
          {/* Device choice */}
          <section>
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
              Welke koelkast?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(PRICES) as DeviceType[]).map(type => {
                const selected = form.device_type === type;
                const dayPrice = Math.ceil((PRICES[type] / 7) * 100) / 100;
                return (
                  <motion.button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, device_type: type })}
                    whileTap={{ scale: 0.99 }}
                    className={`text-left p-5 rounded-[var(--radius-xl)] border transition-all ${
                      selected
                        ? 'border-accent bg-surface shadow-md'
                        : 'border-border bg-surface hover:border-border-strong'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium">{type}</span>
                      <div className={`w-4 h-4 rounded-full border-2 transition-colors ${selected ? 'border-accent bg-accent' : 'border-border'}`}>
                        {selected && <Check size={10} className="text-accent-fg" strokeWidth={3} />}
                      </div>
                    </div>
                    <div className="text-2xl font-medium tabular-nums">{formatEur(PRICES[type])}<span className="text-sm font-normal text-text-muted"> /week</span></div>
                    <div className="text-xs text-text-muted mt-1">Daarna {formatEur(dayPrice)}/dag</div>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Period */}
          <section>
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
              Periode
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Startdatum" required>
                <input
                  type="date"
                  required
                  value={form.start_date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={e => setForm({ ...form, start_date: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Einddatum" required>
                <input
                  type="date"
                  required
                  value={form.end_date}
                  min={form.start_date || new Date().toISOString().slice(0, 10)}
                  onChange={e => setForm({ ...form, end_date: e.target.value })}
                  className={inputCls}
                />
              </Field>
            </div>
            <p className="text-xs text-text-muted mt-2">Minimum {MIN_DAYS} dagen.</p>
          </section>

          {/* Camping */}
          <section>
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
              Camping
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3">
              <Field label="Camping" required>
                <input
                  list="campings-list"
                  required
                  value={form.camping}
                  onChange={e => setForm({ ...form, camping: e.target.value })}
                  placeholder="Bijv. Eurocamping"
                  className={inputCls}
                />
                <datalist id="campings-list">
                  {campings.map(c => <option key={c} value={c} />)}
                </datalist>
              </Field>
              <Field label="Pleknummer">
                <input
                  value={form.spot_number}
                  onChange={e => setForm({ ...form, spot_number: e.target.value })}
                  placeholder="A12"
                  className={inputCls}
                />
              </Field>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
              Contactgegevens
            </h2>
            <div className="space-y-3">
              <Field label="Naam" required>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoComplete="name" className={inputCls} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="E-mail" required>
                  <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} autoComplete="email" className={inputCls} />
                </Field>
                <Field label="Telefoon" required>
                  <input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} autoComplete="tel" className={inputCls} />
                </Field>
              </div>
              <Field label="Opmerking (optioneel)">
                <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputCls + ' min-h-[60px] py-2 resize-none'} />
              </Field>
            </div>
          </section>

          {/* Price summary */}
          <AnimatePresence>
            {price && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="rounded-[var(--radius-xl)] bg-surface-2 border border-border p-5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Eerste week</span>
                    <span className="tabular-nums">{formatEur(price.weekPrice)}</span>
                  </div>
                  {price.extraDays > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">{price.extraDays} extra {price.extraDays === 1 ? 'dag' : 'dagen'} × {formatEur(price.dayPrice)}</span>
                      <span className="tabular-nums">{formatEur(price.extraTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-medium">Totaal · {price.days} dagen</span>
                    <span className="font-medium tabular-nums text-lg">{formatEur(price.total)}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="rounded-[var(--radius-md)] bg-danger-soft text-danger px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !price}
            className="w-full h-12 rounded-[var(--radius-md)] bg-accent text-accent-fg font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {submitting ? 'Doorsturen…' : 'Doorgaan naar betalen'}
            {!submitting && <ArrowRight size={16} />}
          </button>
          <p className="text-xs text-text-muted text-center">
            Je gaat door naar onze beveiligde Stripe-betaalpagina.
          </p>
        </form>
      </div>
    </main>
  );
}

const inputCls = 'w-full h-10 px-3 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors placeholder:text-text-subtle';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-text">
        {label}{required && <span className="text-text-subtle ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
