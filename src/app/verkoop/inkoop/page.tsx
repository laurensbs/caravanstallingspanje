'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Send, Loader2, AlertCircle, ArrowLeft, Tag, Check } from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import PhotoDropzone, { type UploadedFile } from '@/components/PhotoDropzone';

const EASE = [0.16, 1, 0.3, 1] as const;

type FormState = {
  kind: 'caravan' | 'camper';
  brand: string;
  model: string;
  year: string;
  registration: string;
  km: string;
  asking_price_eur: string;
  condition_note: string;
  name: string;
  email: string;
  phone: string;
};

const empty: FormState = {
  kind: 'caravan', brand: '', model: '', year: '', registration: '', km: '',
  asking_price_eur: '', condition_note: '',
  name: '', email: '', phone: '',
};

export default function InkoopPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(empty);
  const [photos, setPhotos] = useState<UploadedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ ref: string } | null>(null);

  const uploadRef = useMemo(
    () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        kind: form.kind,
        brand: form.brand.trim() || undefined,
        model: form.model.trim() || undefined,
        year: form.year ? Number(form.year) : null,
        registration: form.registration.trim() || undefined,
        km: form.km ? Number(form.km) : null,
        asking_price_eur: form.asking_price_eur ? Number(form.asking_price_eur) : null,
        condition_note: form.condition_note.trim() || undefined,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        photos: photos.map((p) => ({
          url: p.url, webUrl: p.webUrl, fileName: p.fileName, sizeKb: p.sizeKb,
        })),
      };
      const res = await fetch('/api/order/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Versturen mislukt.');
        return;
      }
      setDone({ ref: data.ref });
    } catch {
      setError('Verbindingsfout. Probeer het zo opnieuw.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <Shell>
        <main id="main" className="flex-1">
          <section className="section-bg-sky-soft">
            <div className="max-w-[700px] mx-auto px-5 sm:px-10 py-16 sm:py-20 text-center">
              <div
                style={{
                  width: 96, height: 96, margin: '0 auto 20px',
                  borderRadius: 999, background: 'var(--green-soft)',
                  border: '2px solid var(--green)', color: 'var(--green)',
                  display: 'grid', placeItems: 'center',
                }}
              >
                <Check size={44} strokeWidth={3} aria-hidden />
              </div>
              <h1 className="h1-mk" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>Inkoop-aanvraag ontvangen</h1>
              <p className="lead-mk" style={{ marginTop: 12 }}>
                We bekijken je foto&apos;s en gegevens en sturen binnen 48u een indicatief bod.
              </p>
              <div
                style={{
                  marginTop: 28, display: 'inline-flex', alignItems: 'center', gap: 12,
                  padding: '14px 22px', borderRadius: 14, background: '#fff',
                  border: '1px solid var(--line)', boxShadow: 'var(--shadow-card-mk)',
                }}
              >
                <span style={{ fontSize: 11.5, fontFamily: 'var(--sora)', fontWeight: 600, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' }}>
                  Referentie
                </span>
                <span style={{ fontFamily: 'var(--sora)', fontWeight: 700, fontSize: 18, color: 'var(--navy)' }}>
                  {done.ref}
                </span>
              </div>
              <div style={{ marginTop: 28 }}>
                <Link href="/verkoop" className="btn btn-ghost">Bekijk onze voorraad</Link>
              </div>
            </div>
          </section>
        </main>
      </Shell>
    );
  }

  return (
    <Shell>
      <main id="main" className="flex-1">
        <Hero />

        <section className="py-12 sm:py-16">
          <div className="max-w-[820px] mx-auto px-5 sm:px-10">
            <motion.form
              onSubmit={submit}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="card-mk"
              style={{ padding: 28 }}
            >
              <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 18, color: 'var(--navy)', margin: '0 0 18px' }}>
                Vertel ons over je caravan / camper
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="field-mk">
                  <label htmlFor="ik-kind">Type</label>
                  <select
                    id="ik-kind"
                    value={form.kind}
                    onChange={(e) => set('kind', e.target.value as 'caravan' | 'camper')}
                  >
                    <option value="caravan">Caravan</option>
                    <option value="camper">Camper</option>
                  </select>
                </div>
                <div className="field-mk">
                  <label htmlFor="ik-year">Bouwjaar</label>
                  <input id="ik-year" inputMode="numeric" value={form.year} onChange={(e) => set('year', e.target.value)} placeholder="2018" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="field-mk">
                  <label htmlFor="ik-brand">Merk</label>
                  <input id="ik-brand" type="text" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Hobby" />
                </div>
                <div className="field-mk">
                  <label htmlFor="ik-model">Model</label>
                  <input id="ik-model" type="text" value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="De Luxe 460" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="field-mk">
                  <label htmlFor="ik-reg">Kenteken</label>
                  <input id="ik-reg" type="text" value={form.registration} onChange={(e) => set('registration', e.target.value)} placeholder="WL-AB-12" />
                </div>
                <div className="field-mk">
                  <label htmlFor="ik-km">Kilometerstand (alleen camper)</label>
                  <input id="ik-km" inputMode="numeric" value={form.km} onChange={(e) => set('km', e.target.value)} placeholder="64500" />
                </div>
              </div>
              <div className="field-mk">
                <label htmlFor="ik-price">Vraagprijs (€) — optioneel</label>
                <input id="ik-price" inputMode="decimal" value={form.asking_price_eur} onChange={(e) => set('asking_price_eur', e.target.value)} placeholder="14500" />
              </div>
              <div className="field-mk">
                <label htmlFor="ik-cond">Conditie / bijzonderheden</label>
                <textarea
                  id="ik-cond"
                  rows={4}
                  value={form.condition_note}
                  onChange={(e) => set('condition_note', e.target.value)}
                  placeholder="Bv: Klein lekje rechts achter, recent nieuwe banden, boekwerk compleet, eigen sinds 2018, geen schade-historie."
                />
              </div>

              <div style={{ marginTop: 8, marginBottom: 12 }}>
                <PhotoDropzone
                  kind="purchase"
                  ref={uploadRef}
                  value={photos}
                  onChange={setPhotos}
                  label="Foto's (sterk aanbevolen)"
                  hint="JPG/PNG/HEIC of PDF · max 10 MB · max 8 stuks. Buitenkant + binnenkant + technische details geven het beste bod."
                />
              </div>

              <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '20px 0 12px' }}>
                Jouw gegevens
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="field-mk sm:col-span-2">
                  <label htmlFor="ik-name">
                    Naam <span style={{ color: 'var(--orange-d)' }}>*</span>
                  </label>
                  <input id="ik-name" type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required />
                </div>
                <div className="field-mk">
                  <label htmlFor="ik-email">
                    E-mail <span style={{ color: 'var(--orange-d)' }}>*</span>
                  </label>
                  <input id="ik-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
                </div>
                <div className="field-mk">
                  <label htmlFor="ik-phone">Telefoon</label>
                  <input id="ik-phone" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
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
                  {submitting ? 'Versturen…' : 'Vraag eerlijk bod'}
                </button>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
                  Indicatief bod binnen 48u, definitief na fysieke keuring.
                </p>
              </div>
            </motion.form>
          </div>
        </section>
      </main>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const fade = (delay = 0) =>
    reduce
      ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: EASE, delay } };
  return (
    <section className="section-bg-sky-soft">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-12 sm:py-16">
        <motion.span {...fade(0)} className="eyebrow-mk">
          <Tag size={11} aria-hidden style={{ marginRight: 6 }} /> Inkoop
        </motion.span>
        <motion.h1 {...fade(0.06)} className="h1-mk" style={{ marginTop: 4 }}>
          Klaar met je caravan? Wij doen een eerlijk bod.
        </motion.h1>
        <motion.p {...fade(0.14)} className="lead-mk" style={{ marginTop: 14, maxWidth: 700 }}>
          Stuur foto&apos;s en wat info, dan komen we binnen 48 uur met een indicatief bod terug. Geen gedoe met privé-verkoop, advertenties of bezichtigingen.
        </motion.p>
      </div>
    </section>
  );
}
