'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, AlertCircle, ShieldCheck, Wrench, ClipboardCheck, Tag,
  MessageSquare, ArrowLeft, Phone, Mail, Check,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import MotionPageTransition from '@/components/motion/MotionPageTransition';
import PhotoDropzone, { type UploadedFile } from '@/components/PhotoDropzone';
import { useLocale } from '@/components/LocaleProvider';
import type { StringKey } from '@/lib/i18n';

const EASE = [0.16, 1, 0.3, 1] as const;
type T = (k: StringKey, ...a: (string | number)[]) => string;

type Topic = 'storage' | 'repair' | 'inspection' | 'sales' | 'general';

const TOPICS: Array<{ id: Topic; icon: LucideIcon; tKey: StringKey; dKey: StringKey; allowsPhotos: boolean }> = [
  { id: 'storage',    icon: ShieldCheck,    tKey: 'ct1.topic-storage-t',    dKey: 'ct1.topic-storage-d',    allowsPhotos: false },
  { id: 'repair',     icon: Wrench,         tKey: 'ct1.topic-repair-t',     dKey: 'ct1.topic-repair-d',     allowsPhotos: true  },
  { id: 'inspection', icon: ClipboardCheck, tKey: 'ct1.topic-inspection-t', dKey: 'ct1.topic-inspection-d', allowsPhotos: true  },
  { id: 'sales',      icon: Tag,            tKey: 'ct1.topic-sales-t',      dKey: 'ct1.topic-sales-d',      allowsPhotos: true  },
  { id: 'general',    icon: MessageSquare,  tKey: 'ct1.topic-general-t',    dKey: 'ct1.topic-general-d',    allowsPhotos: false },
];

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactInner />
    </Suspense>
  );
}

function ContactInner() {
  const { t } = useLocale();
  const params = useSearchParams();
  const initialSubject = params.get('subject') ?? '';
  const initialTopicParam = params.get('topic');

  const [topic, setTopic] = useState<Topic | null>(
    initialTopicParam && TOPICS.some((tp) => tp.id === initialTopicParam) ? initialTopicParam as Topic : null,
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState('');
  const [registration, setRegistration] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [photos, setPhotos] = useState<UploadedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ ref: string } | null>(null);

  // Stabiele groeperings-key voor uploads — pakt 1 keer bij mount.
  const uploadRef = useMemo(
    () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );

  useEffect(() => {
    if (initialSubject) setSubject(initialSubject);
  }, [initialSubject]);

  const allowsPhotos = !!topic && TOPICS.find((tp) => tp.id === topic)?.allowsPhotos;
  const showUnit = topic === 'repair' || topic === 'inspection' || topic === 'sales';

  const messagePh = (() => {
    switch (topic) {
      case 'repair': return t('ct1.message-ph-repair');
      case 'inspection': return t('ct1.message-ph-inspection');
      case 'storage': return t('ct1.message-ph-storage');
      case 'sales': return t('ct1.message-ph-sales');
      default: return t('ct1.message-ph-general');
    }
  })();

  const successBody = (() => {
    switch (topic) {
      case 'repair': return t('ct1.success-body-repair');
      case 'inspection': return t('ct1.success-body-inspection');
      case 'storage': return t('ct1.success-body-storage');
      default: return t('ct1.success-body-default');
    }
  })();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        topic,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        message: message.trim(),
        registration: registration.trim() || undefined,
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        attachments: photos.map((p) => ({
          url: p.url, webUrl: p.webUrl, fileName: p.fileName, sizeKb: p.sizeKb,
        })),
      };
      const res = await fetch('/api/order/contact', {
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
      <PageShell>
        <SuccessCard t={t} body={successBody} reference={done.ref} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main id="main" className="flex-1">
        <MotionPageTransition>
        <Hero t={t} />

        <section className="py-12 sm:py-16">
          <div className="max-w-[820px] mx-auto px-5 sm:px-10">

            {!topic && <TopicPicker t={t} onPick={setTopic} />}

            {topic && (
              <motion.form
                onSubmit={submit}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="card-mk"
                style={{ padding: 28 }}
              >
                {/* Topic-tag + wijzig knop */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
                  <TopicChip topic={topic} t={t} />
                  <button
                    type="button"
                    onClick={() => setTopic(null)}
                    className="btn btn-ghost"
                    style={{ padding: '8px 14px', fontSize: 13 }}
                  >
                    <ArrowLeft size={13} aria-hidden /> Ander onderwerp
                  </button>
                </div>

                <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 18, color: 'var(--navy)', margin: '0 0 16px' }}>
                  Vertel ons meer
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                  <div className="field-mk sm:col-span-2">
                    <label htmlFor="ct-name">Naam <span style={{ color: 'var(--orange-d)' }}>*</span></label>
                    <input id="ct-name" type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
                  </div>
                  <div className="field-mk">
                    <label htmlFor="ct-email">E-mail <span style={{ color: 'var(--orange-d)' }}>*</span></label>
                    <input id="ct-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                  </div>
                  <div className="field-mk">
                    <label htmlFor="ct-phone">Telefoon</label>
                    <input id="ct-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
                  </div>
                </div>

                {showUnit && (
                  <>
                    <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '12px 0 12px' }}>
                      {t('ct1.unit-h3')}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
                      <div className="field-mk">
                        <label htmlFor="ct-reg">Kenteken</label>
                        <input id="ct-reg" type="text" value={registration} onChange={(e) => setRegistration(e.target.value)} placeholder="WL-AB-12" />
                      </div>
                      <div className="field-mk">
                        <label htmlFor="ct-brand">Merk</label>
                        <input id="ct-brand" type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Hobby" />
                      </div>
                      <div className="field-mk">
                        <label htmlFor="ct-model">Model</label>
                        <input id="ct-model" type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="De Luxe 460" />
                      </div>
                    </div>
                    <p style={{ fontSize: 11.5, color: 'var(--muted)', margin: '0 0 8px' }}>{t('ct1.unit-help')}</p>
                  </>
                )}

                <div className="field-mk" style={{ marginTop: 12 }}>
                  <label htmlFor="ct-subject">{t('ct1.subject-label')}</label>
                  <input id="ct-subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t('ct1.subject-ph')} />
                </div>

                <div className="field-mk">
                  <label htmlFor="ct-message">
                    {t('ct1.message-label')} <span style={{ color: 'var(--orange-d)' }}>*</span>
                  </label>
                  <textarea
                    id="ct-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    placeholder={messagePh}
                    required
                  />
                </div>

                {allowsPhotos && (
                  <div style={{ marginTop: 8 }}>
                    <PhotoDropzone
                      kind={topic === 'repair' ? 'repair-intake' : topic === 'inspection' ? 'inspection-intake' : 'contact'}
                      ref={uploadRef}
                      value={photos}
                      onChange={setPhotos}
                      label={t('ct1.photos-label')}
                      hint={t('ct1.photos-hint')}
                    />
                  </div>
                )}

                {error && (
                  <div role="alert" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: 12, borderRadius: 10, fontSize: 13, margin: '14px 0' }}>
                    <AlertCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />
                    <span>{error}</span>
                  </div>
                )}

                <div style={{ paddingTop: 20, borderTop: '1px solid var(--line)', marginTop: 16 }}>
                  <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-50">
                    {submitting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Send size={15} aria-hidden />}
                    {submitting ? 'Versturen…' : t('ct1.submit')}
                  </button>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
                    Bevestiging in je inbox binnen enkele minuten.
                  </p>
                </div>
              </motion.form>
            )}
          </div>
        </section>
        </MotionPageTransition>
      </main>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}

function Hero({ t }: { t: T }) {
  const reduce = useReducedMotion();
  const fade = (delay = 0) =>
    reduce
      ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: EASE, delay } };
  return (
    <section className="section-bg-sky-soft">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-14 sm:py-20">
        <div className="max-w-[820px]">
          <motion.span {...fade(0)} className="eyebrow-mk">{t('ct1.hero-eyebrow')}</motion.span>
          <motion.h1 {...fade(0.06)} className="h1-mk" style={{ marginTop: 4 }}>{t('ct1.hero-h1')}</motion.h1>
          <motion.p {...fade(0.14)} className="lead-mk" style={{ marginTop: 14, maxWidth: 700 }}>{t('ct1.hero-lead')}</motion.p>
        </div>
      </div>
    </section>
  );
}

function TopicPicker({ t, onPick }: { t: T; onPick: (id: Topic) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 18, color: 'var(--navy)', margin: '0 0 18px' }}>
        {t('ct1.topic-h2')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TOPICS.map(({ id, icon: Icon, tKey, dKey }, i) => (
          <motion.button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE, delay: i * 0.04 }}
            whileTap={{ scale: 0.98 }}
            className="card-mk text-left is-clickable"
            style={{ padding: 18, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span
                aria-hidden
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'var(--sky-soft)', color: 'var(--navy)',
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                }}
              >
                <Icon size={18} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 14.5, color: 'var(--navy)', marginBottom: 3 }}>
                  {t(tKey)}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  {t(dKey)}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Direct-contact rij onderin */}
      <div style={{ marginTop: 22, padding: 18, borderRadius: 12, background: 'var(--bg-2, var(--bg))', display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Liever direct?</span>
        <a href="tel:+34633778699" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--navy)', fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 13.5, textDecoration: 'none' }}>
          <Phone size={14} aria-hidden /> +34 633 77 86 99
        </a>
        <a href="mailto:info@caravanstalling-spanje.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--navy)', fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 13.5, textDecoration: 'none' }}>
          <Mail size={14} aria-hidden /> info@caravanstalling-spanje.com
        </a>
      </div>
    </motion.div>
  );
}

function TopicChip({ topic, t }: { topic: Topic; t: T }) {
  const cfg = TOPICS.find((tp) => tp.id === topic)!;
  const Icon = cfg.icon;
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '6px 12px', borderRadius: 999,
        background: 'var(--sky-soft)', color: 'var(--navy)',
        fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 12.5,
      }}
    >
      <Icon size={13} aria-hidden /> {t(cfg.tKey)}
    </span>
  );
}

function SuccessCard({ t, body, reference }: { t: T; body: string; reference: string }) {
  const reduce = useReducedMotion();
  return (
    <main id="main" className="flex-1">
      <section className="section-bg-sky-soft">
        <div className="max-w-[700px] mx-auto px-5 sm:px-10 py-16 sm:py-20 text-center">
          <motion.div
            initial={reduce ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{
              width: 96, height: 96,
              margin: '0 auto 20px',
              borderRadius: 999,
              background: 'var(--green-soft)',
              border: '2px solid var(--green)',
              color: 'var(--green)',
              display: 'grid', placeItems: 'center',
            }}
          >
            <Check size={44} strokeWidth={3} aria-hidden />
          </motion.div>
          <h1 className="h1-mk" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>{t('ct1.success-title')}</h1>
          <p className="lead-mk" style={{ marginTop: 12 }}>{body}</p>

          <div
            style={{
              marginTop: 28,
              display: 'inline-flex', alignItems: 'center', gap: 12,
              padding: '14px 22px', borderRadius: 14,
              background: '#fff', border: '1px solid var(--line)',
              boxShadow: 'var(--shadow-card-mk)',
            }}
          >
            <span style={{ fontSize: 11.5, fontFamily: 'var(--sora)', fontWeight: 600, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' }}>
              Referentie
            </span>
            <span style={{ fontFamily: 'var(--sora)', fontWeight: 700, fontSize: 18, color: 'var(--navy)' }}>
              {reference}
            </span>
          </div>

          <div style={{ marginTop: 28 }}>
            <Link href="/" className="btn btn-ghost">Terug naar home</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
