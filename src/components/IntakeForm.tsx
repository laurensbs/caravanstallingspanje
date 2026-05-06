'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import PhotoDropzone, { type UploadedFile } from './PhotoDropzone';

const EASE = [0.16, 1, 0.3, 1] as const;

interface IntakeFormProps {
  /** Endpoint waar we POSTen, bv. '/api/order/repair'. */
  endpoint: string;
  /** Voor de OneDrive folder, bv. 'repair-intake' of 'inspection-intake'. */
  uploadKind: 'repair-intake' | 'inspection-intake';
  /** Heading boven de form-fields. */
  title: string;
  /** Sub-tekst onder de heading. */
  intro?: string;
  /** Placeholder voor het beschrijving-veld. */
  descriptionPlaceholder: string;
  /** Toon datum-veld voor inspectie? */
  withPreferredDate?: boolean;
  /** Submit-button tekst. */
  submitLabel?: string;
}

type FormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  vat_number: string;
  registration: string;
  brand: string;
  model: string;
  description: string;
  preferredDate: string;
};

const empty: FormState = {
  name: '', email: '', phone: '',
  address: '', postal_code: '', city: '', country: 'Nederland', vat_number: '',
  registration: '', brand: '', model: '',
  description: '',
  preferredDate: '',
};

export default function IntakeForm({
  endpoint, uploadKind, title, intro, descriptionPlaceholder,
  withPreferredDate = false, submitLabel = 'Aanvraag versturen',
}: IntakeFormProps) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [form, setForm] = useState<FormState>(empty);
  const [photos, setPhotos] = useState<UploadedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const uploadRef = useMemo(
    () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        postal_code: form.postal_code.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
        vat_number: form.vat_number.trim() || undefined,
        registration: form.registration.trim() || undefined,
        brand: form.brand.trim() || undefined,
        model: form.model.trim() || undefined,
        description: form.description.trim(),
        attachments: photos.map((p) => ({
          url: p.url, webUrl: p.webUrl, fileName: p.fileName, sizeKb: p.sizeKb,
        })),
      };
      if (withPreferredDate) payload.preferredDate = form.preferredDate || undefined;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Versturen mislukt.');
        return;
      }
      router.push(`/diensten/bedankt?ref=${encodeURIComponent(data.ref || data.publicCode)}`);
    } catch {
      setError('Verbindingsfout. Probeer het zo opnieuw.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: EASE }}
      className="card-mk"
      style={{ padding: 28 }}
    >
      <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 20, color: 'var(--navy)', margin: '0 0 6px' }}>
        {title}
      </h2>
      {intro && (
        <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, margin: '0 0 18px' }}>{intro}</p>
      )}

      {/* Beschrijving + foto's eerst — dat is de waarde van het formulier */}
      <div className="field-mk">
        <label htmlFor="if-desc">
          Beschrijving <span style={{ color: 'var(--orange-d)' }}>*</span>
        </label>
        <textarea
          id="if-desc"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={6}
          placeholder={descriptionPlaceholder}
          required
        />
      </div>

      {withPreferredDate && (
        <div className="field-mk">
          <label htmlFor="if-date">Voorkeursdatum</label>
          <input
            id="if-date"
            type="date"
            value={form.preferredDate}
            onChange={(e) => set('preferredDate', e.target.value)}
          />
          <div className="hint">Optioneel — wij sturen anders een voorstel.</div>
        </div>
      )}

      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <PhotoDropzone
          kind={uploadKind}
          ref={uploadRef}
          value={photos}
          onChange={setPhotos}
          label="Foto's toevoegen (sterk aanbevolen)"
          hint="JPG/PNG/HEIC of PDF · max 10 MB · max 8 stuks"
        />
      </div>

      {/* Caravan-info */}
      <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '20px 0 12px' }}>
        Je caravan
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
        <div className="field-mk">
          <label htmlFor="if-reg">Kenteken</label>
          <input id="if-reg" type="text" value={form.registration} onChange={(e) => set('registration', e.target.value)} placeholder="WL-AB-12" />
        </div>
        <div className="field-mk">
          <label htmlFor="if-brand">Merk</label>
          <input id="if-brand" type="text" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Hobby" />
        </div>
        <div className="field-mk">
          <label htmlFor="if-model">Model</label>
          <input id="if-model" type="text" value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="De Luxe 460" />
        </div>
      </div>

      {/* Klantgegevens */}
      <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '12px 0 12px' }}>
        Jouw gegevens
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <div className="field-mk sm:col-span-2">
          <label htmlFor="if-name">
            Naam <span style={{ color: 'var(--orange-d)' }}>*</span>
          </label>
          <input id="if-name" type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div className="field-mk">
          <label htmlFor="if-email">
            E-mail <span style={{ color: 'var(--orange-d)' }}>*</span>
          </label>
          <input id="if-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
        </div>
        <div className="field-mk">
          <label htmlFor="if-phone">
            Telefoon <span style={{ color: 'var(--orange-d)' }}>*</span>
          </label>
          <input id="if-phone" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
        </div>
      </div>

      <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '12px 0 12px' }}>
        Factuuradres
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <div className="field-mk sm:col-span-2">
          <label htmlFor="if-address">
            Adres <span style={{ color: 'var(--orange-d)' }}>*</span>
          </label>
          <input id="if-address" type="text" value={form.address} onChange={(e) => set('address', e.target.value)} required />
        </div>
        <div className="field-mk">
          <label htmlFor="if-postal">
            Postcode <span style={{ color: 'var(--orange-d)' }}>*</span>
          </label>
          <input id="if-postal" type="text" value={form.postal_code} onChange={(e) => set('postal_code', e.target.value)} required />
        </div>
        <div className="field-mk">
          <label htmlFor="if-city">
            Plaats <span style={{ color: 'var(--orange-d)' }}>*</span>
          </label>
          <input id="if-city" type="text" value={form.city} onChange={(e) => set('city', e.target.value)} required />
        </div>
        <div className="field-mk">
          <label htmlFor="if-country">
            Land <span style={{ color: 'var(--orange-d)' }}>*</span>
          </label>
          <input id="if-country" type="text" value={form.country} onChange={(e) => set('country', e.target.value)} required />
        </div>
        <div className="field-mk">
          <label htmlFor="if-vat">BTW-nummer (optioneel)</label>
          <input id="if-vat" type="text" value={form.vat_number} onChange={(e) => set('vat_number', e.target.value)} />
        </div>
      </div>

      {error && (
        <div role="alert" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: 12, borderRadius: 10, fontSize: 13, margin: '14px 0' }}>
          <AlertCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />
          <span>{error}</span>
        </div>
      )}

      <div style={{ paddingTop: 20, borderTop: '1px solid var(--line)', marginTop: 16 }}>
        <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-50">
          {submitting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Send size={15} aria-hidden />}
          {submitting ? 'Versturen…' : submitLabel}
        </button>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
          We koppelen binnen 48u terug met een offerte. Bevestiging gaat direct naar je inbox.
        </p>
      </div>
    </motion.form>
  );
}
