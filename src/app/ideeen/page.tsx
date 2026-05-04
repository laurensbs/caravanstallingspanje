'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Lightbulb, Send, Loader2, Check, ArrowRight, ArrowLeft, Sparkles,
  Wrench, Tent, Coffee, Bike, Sun, Wind, ThumbsUp, ThumbsDown, Star,
  AlertCircle, X,
} from 'lucide-react';
import PublicFooter from '@/components/PublicFooter';
import LocaleSwitch from '@/components/LocaleSwitch';
import { Field, fieldCls } from '@/components/ServiceForm';
import { useLocale } from '@/components/LocaleProvider';
import { useZodForm, focusFirstError, summaryError } from '@/lib/forms';
import { ideaSchema } from '@/lib/validations';
import { MotionShake, MotionBounce } from '@/components/motion/MotionPrimitives';
import type { StringKey } from '@/lib/i18n';
import type { z } from 'zod';

// ──────────────────────────────────────────────────────────────
// Categorieën met eigen accent-tint per item. Elk gebruikt een token
// uit het Costa Brava paleet zodat ze als chips visueel onderscheidbaar
// zijn maar niet luidruchtig.
// ──────────────────────────────────────────────────────────────
type CatAccent = 'amber' | 'sea' | 'coral' | 'lavender' | 'amber-bright';

const CATEGORIES: Array<{
  value: string;
  labelKey: StringKey;
  icon: typeof Wrench;
  accent: CatAccent;
}> = [
  { value: 'service',  labelKey: 'ideas.cat-service',  icon: Wrench,   accent: 'sea' },
  { value: 'camping',  labelKey: 'ideas.cat-camping',  icon: Tent,     accent: 'amber' },
  { value: 'comfort',  labelKey: 'ideas.cat-comfort',  icon: Coffee,   accent: 'coral' },
  { value: 'verhuur',  labelKey: 'ideas.cat-verhuur',  icon: Bike,     accent: 'lavender' },
  { value: 'zomer',    labelKey: 'ideas.cat-zomer',    icon: Sun,      accent: 'amber-bright' },
  { value: 'klimaat',  labelKey: 'ideas.cat-klimaat',  icon: Wind,     accent: 'sea' },
  { value: 'anders',   labelKey: 'ideas.cat-anders',   icon: Sparkles, accent: 'lavender' },
];

const CAT_ACCENT_STYLES: Record<CatAccent, { bg: string; bgActive: string; border: string; borderActive: string; text: string; iconBg: string }> = {
  amber: {
    bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.10)',
    bgActive: 'rgba(242,169,59,0.14)', borderActive: 'rgba(242,169,59,0.5)',
    text: 'rgba(255,210,140,0.95)', iconBg: 'rgba(242,169,59,0.18)',
  },
  'amber-bright': {
    bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.10)',
    bgActive: 'rgba(255,194,90,0.16)', borderActive: 'rgba(255,194,90,0.55)',
    text: 'rgba(255,220,160,0.95)', iconBg: 'rgba(255,194,90,0.18)',
  },
  sea: {
    bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.10)',
    bgActive: 'rgba(79,168,184,0.16)', borderActive: 'rgba(79,168,184,0.55)',
    text: 'rgba(180,225,235,0.95)', iconBg: 'rgba(79,168,184,0.18)',
  },
  coral: {
    bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.10)',
    bgActive: 'rgba(232,132,94,0.16)', borderActive: 'rgba(232,132,94,0.55)',
    text: 'rgba(255,210,190,0.95)', iconBg: 'rgba(232,132,94,0.18)',
  },
  lavender: {
    bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.10)',
    bgActive: 'rgba(180,154,232,0.16)', borderActive: 'rgba(180,154,232,0.55)',
    text: 'rgba(220,205,250,0.95)', iconBg: 'rgba(180,154,232,0.18)',
  },
};

// Inspiratie-prompts per categorie. NL-only — vertaald als gebruiker ze
// kiest worden ze hun eigen tekst, geen i18n-burden.
const SUGGESTIONS: Record<string, string[]> = {
  service: ['Banden-vervanging op locatie', 'Mover-installatie voor caravan', 'Bekleding-reiniging professioneel'],
  camping: ['Vaste partner-kortingen bij Costa-Brava-campings', 'Pakket "stalling + camping-reservering"', 'Welkomstpakket bij aankomst'],
  comfort: ['Verhuur van caravan-voortenten', 'Strandstoelen en parasol-verhuur', 'Buiten-koelkast op zonne-energie'],
  verhuur: ['E-bikes voor onderweg', 'BBQ + tafel + stoelen pakket', 'SUP-board of kayak voor aan zee'],
  zomer:   ['Mobiel zonnescherm voor je staanplaats', 'Mini-zwembadje voor de kinderen', 'Ventilator-set met accu'],
  klimaat: ['Zonnepaneel-set voor op je dak', 'Powerbank-station voor langere kampeertrips', 'Waterbespaar-set'],
  anders:  ['Een idee dat hier niet past?'],
};

type IdeaForm = z.input<typeof ideaSchema>;

// ──────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────
export default function IdeeenPage() {
  const { t } = useLocale();
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(false);

  const form = useZodForm<IdeaForm>(ideaSchema, {
    defaultValues: { name: '', email: '', category: '', title: '', message: '' },
  });
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting, isSubmitted },
  } = form;

  const category = watch('category') || '';
  const inlineSummary = isSubmitted ? summaryError(form) : null;
  const [shakeTick, setShakeTick] = useState(0);

  const submit = async (values: IdeaForm) => {
    setServerError('');
    try {
      const res = await fetch('/api/order/idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setServerError(data.error || t('common.send-failed'));
        return;
      }
      setDone(true);
      // Scroll naar boven zodat done-state zichtbaar is.
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setServerError(t('common.connection-error'));
    }
  };

  const activeSuggestions = category && SUGGESTIONS[category] ? SUGGESTIONS[category] : [];

  return (
    <main
      id="main"
      className="min-h-screen page-public page-public-dark relative overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0A1929 0%, #050D18 100%)' }}
    >
      {/* Ambient orbs — Costa Brava sfeer, zacht ademend. */}
      <div
        aria-hidden
        className="cs-orb-amber pointer-events-none absolute -top-24 -right-24 h-[480px] w-[480px] blur-3xl opacity-50"
        style={{ background: 'var(--gradient-hero-glow-amber)' }}
      />
      <div
        aria-hidden
        className="cs-orb-cyan pointer-events-none absolute top-32 -left-32 h-[420px] w-[420px] blur-3xl opacity-40"
        style={{ background: 'var(--gradient-hero-glow-cyan)' }}
      />
      <div
        aria-hidden
        className="cs-orb-pulse pointer-events-none absolute top-2/3 right-1/4 h-[300px] w-[300px] blur-3xl opacity-30"
        style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(180,154,232,0.16) 0%, transparent 70%)' }}
      />

      {/* Top bar — minimaal, geen logo (header heeft 'm prominenter). */}
      <div className="relative max-w-6xl mx-auto w-full px-5 sm:px-8 pt-5 sm:pt-7 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] transition-opacity hover:opacity-100"
          style={{ color: 'rgba(241,245,249,0.6)' }}
        >
          <ArrowLeft size={14} aria-hidden /> {t('common.brand')}
        </Link>
        <LocaleSwitch />
      </div>

      {/* HERO — eigen ontwerp, niet PublicHero. App-feel: floating glyph
          + live counter, asymmetrische layout. */}
      <IdeasHero />

      {/* CONTENT — twee kolommen op lg+, stacked op mobile. */}
      <section className="relative flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* LINKER KOLOM — compose card */}
          <div className="lg:col-span-7 lg:sticky lg:top-6 lg:self-start">
            <AnimatePresence mode="wait">
              {done ? (
                <DoneCard
                  key="done"
                  onAnother={() => {
                    setDone(false);
                    reset({ name: '', email: '', category: '', title: '', message: '' });
                    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ) : (
                <motion.form
                  key="compose"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  onSubmit={handleSubmit(submit, () => {
                    setShakeTick((n) => n + 1);
                    focusFirstError(form);
                  })}
                  noValidate
                  className="cs-compose-card relative rounded-[var(--radius-2xl)] overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 24px 56px -16px rgba(0,0,0,0.4)',
                  }}
                >
                  {/* Top accent stripe */}
                  <span
                    aria-hidden
                    className="absolute top-0 left-6 right-6 h-[2px] rounded-full"
                    style={{ background: 'var(--gradient-sunset)', opacity: 0.7 }}
                  />

                  <div className="p-5 sm:p-7 space-y-7">

                    {/* Header */}
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.18em] font-medium" style={{ color: 'rgba(255,210,140,0.85)' }}>
                        Stap 1 — {t('ideas.compose-step-cat')}
                      </div>
                      <h2 className="mt-1 text-[18px] sm:text-[20px] font-semibold" style={{ color: '#FFFFFF', letterSpacing: '-0.014em' }}>
                        {t('ideas.compose-title')}
                      </h2>
                      <p className="text-[13px] mt-1" style={{ color: 'rgba(251,245,236,0.6)' }}>
                        {t('ideas.compose-step-cat-hint')}
                      </p>
                    </div>

                    {/* Categorie-chips */}
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((c) => {
                        const Icon = c.icon;
                        const sel = category === c.value;
                        const s = CAT_ACCENT_STYLES[c.accent];
                        return (
                          <motion.button
                            key={c.value}
                            type="button"
                            onClick={() => setValue('category', sel ? '' : c.value, { shouldDirty: true })}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                            className="press-spring inline-flex items-center gap-2 px-3 h-9 rounded-full text-[13px] font-medium transition-colors"
                            style={{
                              background: sel ? s.bgActive : s.bg,
                              border: `1px solid ${sel ? s.borderActive : s.border}`,
                              color: sel ? s.text : 'rgba(251,245,236,0.78)',
                            }}
                            aria-pressed={sel}
                          >
                            <Icon size={13} aria-hidden style={{ color: sel ? s.text : 'rgba(251,245,236,0.6)' }} />
                            {t(c.labelKey)}
                          </motion.button>
                        );
                      })}
                      {category && (
                        <button
                          type="button"
                          onClick={() => setValue('category', '', { shouldDirty: true })}
                          className="press-spring inline-flex items-center gap-1 px-3 h-9 rounded-full text-[12px] font-medium"
                          style={{ color: 'rgba(251,245,236,0.5)' }}
                        >
                          <X size={12} aria-hidden /> {t('ideas.compose-step-cat-skip')}
                        </button>
                      )}
                    </div>

                    {/* Inspiratie panel — alleen als categorie is gekozen */}
                    <AnimatePresence>
                      {activeSuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div
                            className="rounded-[var(--radius-lg)] p-4"
                            style={{
                              background: 'rgba(255,194,90,0.06)',
                              border: '1px solid rgba(255,194,90,0.20)',
                            }}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles size={12} aria-hidden style={{ color: 'var(--color-amber-bright)' }} />
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'rgba(255,220,160,0.95)' }}>
                                {t('ideas.inspire-title')}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {activeSuggestions.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => setValue('title', s, { shouldDirty: true, shouldValidate: true })}
                                  className="press-spring text-[12px] px-2.5 h-7 inline-flex items-center rounded-full transition-colors"
                                  style={{
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.10)',
                                    color: 'rgba(251,245,236,0.85)',
                                  }}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                            <p className="text-[11px] mt-2" style={{ color: 'rgba(251,245,236,0.5)' }}>
                              {t('ideas.inspire-hint')}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

                    {/* Stap 2 — idee */}
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.18em] font-medium mb-1" style={{ color: 'rgba(255,210,140,0.85)' }}>
                        Stap 2 — {t('ideas.compose-step-idea')}
                      </div>
                    </div>

                    <Field label={t('ideas.compose-step-idea-title')} required>
                      <input
                        {...register('title')}
                        placeholder={t('ideas.compose-step-idea-title-placeholder')}
                        aria-invalid={!!errors.title}
                        aria-describedby={errors.title ? 'err-title' : undefined}
                        className={fieldCls}
                      />
                      {errors.title?.message && (
                        <p id="err-title" role="alert" className="mt-1 text-[12px] text-danger">{errors.title.message}</p>
                      )}
                    </Field>

                    <Field
                      label={t('ideas.compose-step-idea-detail')}
                      required
                      hint={t('ideas.compose-step-idea-detail-hint')}
                    >
                      <textarea
                        {...register('message')}
                        rows={6}
                        placeholder={t('ideas.compose-step-idea-detail-placeholder')}
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'err-message' : undefined}
                        className={`${fieldCls} min-h-[140px] py-2 resize-y`}
                      />
                      {errors.message?.message && (
                        <p id="err-message" role="alert" className="mt-1 text-[12px] text-danger">{errors.message.message}</p>
                      )}
                    </Field>

                    <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

                    {/* Stap 3 — wie */}
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.18em] font-medium mb-1" style={{ color: 'rgba(255,210,140,0.85)' }}>
                        Stap 3 — {t('ideas.compose-step-you')}
                      </div>
                      <p className="text-[13px]" style={{ color: 'rgba(251,245,236,0.6)' }}>
                        {t('ideas.compose-step-you-hint')}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label={t('ideas.compose-name')} hint={t('ideas.compose-name-hint')}>
                        <input
                          {...register('name')}
                          autoComplete="name"
                          placeholder={t('ideas.compose-name-placeholder')}
                          className={fieldCls}
                        />
                      </Field>
                      <Field label={t('common.email')} hint={t('ideas.compose-email-hint')}>
                        <input
                          {...register('email')}
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder={t('ideas.compose-email-placeholder')}
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? 'err-email' : undefined}
                          className={fieldCls}
                        />
                        {errors.email?.message && (
                          <p id="err-email" role="alert" className="mt-1 text-[12px] text-danger">{errors.email.message}</p>
                        )}
                      </Field>
                    </div>

                    {/* Error-banner */}
                    {(inlineSummary || serverError) && (
                      <MotionShake trigger={shakeTick + (serverError ? 1000 : 0)}>
                        <div
                          role="alert"
                          aria-live="polite"
                          className="rounded-[var(--radius-md)] px-4 py-3 text-[14px] inline-flex items-start gap-2"
                          style={{
                            background: 'rgba(232,132,94,0.12)',
                            border: '1px solid rgba(232,132,94,0.30)',
                            color: 'rgba(255,210,190,0.95)',
                          }}
                        >
                          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
                          <span>{serverError || inlineSummary}</span>
                        </div>
                      </MotionShake>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="cs-submit-button group relative w-full h-14 rounded-[var(--radius-lg)] font-semibold text-[15px] transition-all overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #F2A93B 0%, #E8845E 100%)',
                        color: '#FFFFFF',
                        boxShadow: '0 8px 24px -8px rgba(242,169,59,0.5), 0 0 0 1px rgba(255,194,90,0.3) inset',
                      }}
                    >
                      <span aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%)' }}
                      />
                      <span className="relative inline-flex items-center justify-center gap-2 w-full h-full">
                        {isSubmitting ? (
                          <Loader2 size={18} className="animate-spin" aria-hidden />
                        ) : (
                          <Send size={16} aria-hidden />
                        )}
                        {isSubmitting ? t('ideas.compose-submit-busy') : t('ideas.compose-submit')}
                      </span>
                    </button>

                    <p className="text-[11px] text-center" style={{ color: 'rgba(251,245,236,0.4)' }}>
                      {t('ideas.compose-disclaimer')}
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* RECHTER KOLOM — feed */}
          <div className="lg:col-span-5">
            <FeaturedIdeasFeed />
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

// ──────────────────────────────────────────────────────────────
// IdeasHero — eigen ontwerp, niet PublicHero
// ──────────────────────────────────────────────────────────────
function IdeasHero() {
  const { t } = useLocale();
  const [count, setCount] = useState<number | null>(null);

  // Lichtgewicht live-counter — telt featured ideas als proxy. Geen
  // dedicated endpoint nodig.
  useEffect(() => {
    fetch('/api/order/idea/list')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (Array.isArray(d?.ideas)) setCount(d.ideas.length);
      })
      .catch(() => { /* niet erg */ });
  }, []);

  return (
    <header className="relative max-w-6xl w-full mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-8 sm:pb-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-end"
      >
        <div className="lg:col-span-8">
          {/* Eyebrow — sunset pill */}
          <div className="cs-brand-eyebrow mb-4">
            <Lightbulb size={12} aria-hidden /> {t('ideas.eyebrow')}
          </div>

          <h1
            className="font-semibold tracking-tight"
            style={{
              color: '#FFFFFF',
              fontSize: 'clamp(2rem, 4vw + 0.75rem, 3.25rem)',
              lineHeight: 1.08,
              letterSpacing: '-0.022em',
            }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FBF5EC 50%, #FFC25A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t('ideas.h1')}
            </span>
          </h1>
          <p className="mt-4 leading-relaxed text-[15px] sm:text-[17px] max-w-xl" style={{ color: 'rgba(251,245,236,0.72)' }}>
            {t('ideas.intro')}
          </p>

          {count !== null && count > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(79,168,184,0.10)',
                border: '1px solid rgba(79,168,184,0.26)',
              }}
            >
              <span aria-hidden className="cs-orb-pulse w-2 h-2 rounded-full" style={{ background: 'var(--color-sea)' }} />
              <span className="text-[12px] font-medium tabular-nums" style={{ color: 'rgba(180,225,235,0.95)' }}>
                {t(count === 1 ? 'ideas.live-count-singular' : 'ideas.live-count', count)}
              </span>
            </motion.div>
          )}
        </div>

        {/* Floating glyph — lightbulb in soft glow circle, alleen op lg+ */}
        <div className="hidden lg:flex lg:col-span-4 justify-end">
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 120, damping: 16 }}
            className="relative"
          >
            <div
              aria-hidden
              className="absolute inset-0 rounded-full blur-2xl"
              style={{ background: 'var(--gradient-sunset)', opacity: 0.45 }}
            />
            <div
              className="cs-orb-pulse relative w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,194,90,0.30)',
                boxShadow: '0 0 0 8px rgba(242,169,59,0.06), inset 0 0 32px rgba(242,169,59,0.18)',
              }}
            >
              <Lightbulb size={48} style={{ color: 'var(--color-amber-bright)' }} />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </header>
  );
}

// ──────────────────────────────────────────────────────────────
// FeaturedIdeasFeed
// ──────────────────────────────────────────────────────────────

type PublicIdea = {
  id: number;
  category: string | null;
  title: string;
  message: string;
  votes_up: number;
  votes_down: number;
  featured: boolean;
};

function FeaturedIdeasFeed() {
  const { t } = useLocale();
  const [ideas, setIdeas] = useState<PublicIdea[] | null>(null);
  const [voting, setVoting] = useState<number | null>(null);
  const [voted, setVoted] = useState<Record<number, 'up' | 'down'>>({});

  useEffect(() => {
    fetch('/api/order/idea/list')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setIdeas(Array.isArray(d?.ideas) ? d.ideas : []))
      .catch(() => setIdeas([]));
  }, []);

  const vote = async (id: number, direction: 'up' | 'down') => {
    if (voted[id]) return;
    setVoting(id);
    try {
      const res = await fetch(`/api/order/idea/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });
      const data = await res.json();
      if (res.ok || data.alreadyVoted) {
        setVoted((m) => ({ ...m, [id]: direction }));
        setIdeas((curr) => curr?.map((i) =>
          i.id === id
            ? { ...i, [`votes_${direction}`]: (direction === 'up' ? i.votes_up : i.votes_down) + 1 }
            : i,
        ) ?? null);
      }
    } finally {
      setVoting(null);
    }
  };

  return (
    <div>
      {/* Sectie-kop */}
      <div className="mb-4 flex items-center gap-2">
        <Star size={13} aria-hidden style={{ color: 'var(--color-amber-bright)' }} />
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.20em]" style={{ color: 'rgba(251,245,236,0.6)' }}>
          {t('ideas.feed-title')}
        </h2>
      </div>

      {ideas === null ? (
        <FeedSkeletons />
      ) : ideas.length === 0 ? (
        <div
          className="rounded-[var(--radius-lg)] p-5 text-[13px]"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.10)',
            color: 'rgba(251,245,236,0.55)',
          }}
        >
          {t('ideas.feed-empty')}
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea, i) => {
            const userVote = voted[idea.id];
            const totalVotes = idea.votes_up + idea.votes_down;
            const upPct = totalVotes > 0 ? Math.round((idea.votes_up / totalVotes) * 100) : 50;
            return (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-[var(--radius-2xl)] overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {idea.featured && (
                  <span
                    aria-hidden
                    className="absolute top-0 left-5 right-5 h-[2px] rounded-full"
                    style={{ background: 'var(--gradient-sunset)', opacity: 0.85 }}
                  />
                )}

                <div className="p-5">
                  {idea.featured && (
                    <div
                      className="inline-flex items-center gap-1.5 mb-3 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-[0.18em]"
                      style={{
                        background: 'rgba(255,194,90,0.14)',
                        border: '1px solid rgba(255,194,90,0.28)',
                        color: 'rgba(255,220,160,0.95)',
                      }}
                    >
                      <Star size={10} fill="currentColor" /> {t('ideas.feed-featured-pill')}
                    </div>
                  )}

                  <h3 className="text-[16px] font-semibold mb-2 leading-snug" style={{ color: '#FFFFFF', letterSpacing: '-0.012em' }}>
                    {idea.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed whitespace-pre-wrap mb-4" style={{ color: 'rgba(251,245,236,0.7)' }}>
                    {idea.message}
                  </p>

                  {/* Vote-balk: visuele verdeling pro/contra. */}
                  {totalVotes > 0 && (
                    <div className="mb-4">
                      <div
                        className="relative h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                        role="img"
                        aria-label={t('ideas.feed-votes-summary', totalVotes, upPct)}
                      >
                        <motion.div
                          aria-hidden
                          initial={{ width: 0 }}
                          animate={{ width: `${upPct}%` }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.04 }}
                          className="absolute inset-y-0 left-0"
                          style={{
                            background: 'linear-gradient(90deg, var(--color-sea) 0%, var(--color-amber-bright) 100%)',
                          }}
                        />
                      </div>
                      <p className="text-[11px] mt-1.5" style={{ color: 'rgba(251,245,236,0.5)' }}>
                        {t('ideas.feed-votes-summary', totalVotes, upPct)}
                      </p>
                    </div>
                  )}

                  {/* Vote-buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <p className="text-[12px] mr-auto" style={{ color: 'rgba(251,245,236,0.5)' }}>
                      {t('ideas.feed-vote-prompt')}
                    </p>
                    <VoteButton
                      direction="up"
                      label={t('ideeen.vote-up')}
                      count={idea.votes_up}
                      selected={userVote === 'up'}
                      disabled={!!userVote || voting === idea.id}
                      onClick={() => vote(idea.id, 'up')}
                    />
                    <VoteButton
                      direction="down"
                      label={t('ideeen.vote-down')}
                      count={idea.votes_down}
                      selected={userVote === 'down'}
                      disabled={!!userVote || voting === idea.id}
                      onClick={() => vote(idea.id, 'down')}
                    />
                  </div>

                  {userVote && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[11px] mt-2 inline-flex items-center gap-1"
                      style={{ color: 'rgba(180,225,235,0.85)' }}
                    >
                      <Check size={11} aria-hidden /> {t('ideeen.vote-thanks')}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VoteButton({
  direction, label, count, selected, disabled, onClick,
}: {
  direction: 'up' | 'down';
  label: string;
  count: number;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === 'up' ? ThumbsUp : ThumbsDown;
  const accentColor = direction === 'up' ? 'var(--color-sea)' : 'var(--color-coral)';
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      disabled={disabled}
      onClick={onClick}
      className="press-spring inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-medium transition-colors"
      style={{
        background: selected ? `color-mix(in oklch, ${accentColor}, transparent 75%)` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${selected ? accentColor : 'rgba(255,255,255,0.10)'}`,
        color: selected ? accentColor : 'rgba(251,245,236,0.78)',
        opacity: disabled && !selected ? 0.5 : 1,
      }}
      aria-pressed={selected}
    >
      <Icon size={13} fill={selected ? 'currentColor' : 'none'} aria-hidden />
      {label}
      <span className="tabular-nums opacity-70">{count}</span>
    </motion.button>
  );
}

function FeedSkeletons() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-[var(--radius-2xl)] p-5"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <div
            className="h-3 w-2/3 rounded mb-3"
            style={{
              background: 'rgba(255,255,255,0.08)',
              animation: 'shimmer 1.6s ease-in-out infinite',
              animationDelay: `${i * 100}ms`,
            }}
          />
          <div
            className="h-2 w-full rounded mb-2"
            style={{
              background: 'rgba(255,255,255,0.06)',
              animation: 'shimmer 1.6s ease-in-out infinite',
              animationDelay: `${i * 100 + 60}ms`,
            }}
          />
          <div
            className="h-2 w-3/4 rounded"
            style={{
              background: 'rgba(255,255,255,0.06)',
              animation: 'shimmer 1.6s ease-in-out infinite',
              animationDelay: `${i * 100 + 120}ms`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// DoneCard — inline reveal ipv full page replace
// ──────────────────────────────────────────────────────────────
function DoneCard({ onAnother }: { onAnother: () => void }) {
  const { t } = useLocale();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-[var(--radius-2xl)] overflow-hidden text-center p-8 sm:p-12"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.10)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 24px 56px -16px rgba(0,0,0,0.4)',
      }}
    >
      {/* Sunset top stripe */}
      <span
        aria-hidden
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'var(--gradient-sunset)' }}
      />

      {/* Sparkle confetti — kleine zwevende glyph-ies, geen volle confetti. */}
      <Sparkle x="20%" y="22%" size={14} delay={0.1} color="var(--color-amber-bright)" />
      <Sparkle x="80%" y="18%" size={12} delay={0.3} color="var(--color-coral)" />
      <Sparkle x="15%" y="78%" size={10} delay={0.5} color="var(--color-sea)" />
      <Sparkle x="85%" y="72%" size={14} delay={0.7} color="var(--color-lavender)" />

      <MotionBounce className="relative mx-auto mb-6" style={{ width: 72, height: 72 }}>
        <div
          aria-hidden
          className="absolute inset-0 rounded-full blur-xl opacity-60"
          style={{ background: 'var(--gradient-sunset)' }}
        />
        <div
          className="relative w-full h-full rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(242,169,59,0.5)',
            boxShadow: '0 0 0 1px rgba(242,169,59,0.18) inset',
          }}
        >
          <Check size={28} strokeWidth={2.5} style={{ color: 'var(--color-amber-bright)' }} />
        </div>
      </MotionBounce>

      <h2
        className="font-semibold tracking-tight mb-2"
        style={{
          fontSize: 'clamp(1.5rem, 1.5vw + 0.75rem, 2rem)',
          letterSpacing: '-0.018em',
          color: '#FFFFFF',
        }}
      >
        {t('ideas.done-title')}
      </h2>
      <p className="leading-relaxed text-[15px] mb-7" style={{ color: 'rgba(251,245,236,0.72)' }}>
        {t('ideas.done-body')}
      </p>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
        <button
          type="button"
          onClick={onAnother}
          className="press-spring inline-flex items-center justify-center gap-2 h-12 px-5 rounded-[var(--radius-md)] text-[14px] font-semibold transition-all"
          style={{
            background: 'linear-gradient(135deg, #F2A93B 0%, #E8845E 100%)',
            color: '#FFFFFF',
            boxShadow: '0 8px 20px -8px rgba(242,169,59,0.45)',
          }}
        >
          <Sparkles size={14} aria-hidden /> {t('ideas.done-another')}
        </button>
        <Link
          href="/"
          className="press-spring inline-flex items-center justify-center gap-2 h-12 px-5 rounded-[var(--radius-md)] text-[14px] font-medium transition-colors"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.14)',
            color: '#F1F5F9',
          }}
        >
          <ArrowRight size={14} className="rotate-180" aria-hidden /> {t('ideas.done-back')}
        </Link>
      </div>
    </motion.div>
  );
}

function Sparkle({
  x, y, size, delay, color,
}: {
  x: string; y: string; size: number; delay: number; color: string;
}) {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 0.4, y: 0 }}
      animate={{ opacity: [0, 1, 0.7, 0], scale: [0.4, 1, 1, 0.6], y: [0, -8, -4, -12] }}
      transition={{ delay, duration: 2.4, ease: 'easeOut', repeat: Infinity, repeatDelay: 1.6 }}
      className="absolute pointer-events-none"
      style={{ left: x, top: y, color }}
    >
      <Sparkles size={size} fill="currentColor" />
    </motion.div>
  );
}
