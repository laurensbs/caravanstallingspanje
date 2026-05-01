'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Lightbulb, Send, Loader2, Check, ArrowRight, Sparkles,
  Wrench, Tent, Coffee, Bike, Sun, Wind,
} from 'lucide-react';
import PublicHero from '@/components/PublicHero';
import { Field, fieldCls, Section } from '@/components/ServiceForm';

const CATEGORIES = [
  { value: 'service',    label: 'Nieuwe service / dienst', icon: Wrench },
  { value: 'camping',    label: 'Camping-tip / partner',   icon: Tent },
  { value: 'comfort',    label: 'Comfort op de staanplaats', icon: Coffee },
  { value: 'verhuur',    label: 'Iets om te verhuren',     icon: Bike },
  { value: 'zomer',      label: 'Zomer-extra',             icon: Sun },
  { value: 'klimaat',    label: 'Klimaat & energie',       icon: Wind },
  { value: 'anders',     label: 'Iets heel anders',        icon: Sparkles },
] as const;

// Inspiratie-prompts. Per categorie 1-2 voorbeelden zodat klanten
// niet met een leeg blad starten.
const SUGGESTIONS: Record<string, string[]> = {
  service: [
    'Banden-vervanging op locatie',
    'Mover-installatie voor caravan',
    'Bekleding-reiniging professioneel',
  ],
  camping: [
    'Vaste partner-kortingen bij Costa-Brava-campings',
    'Pakket "stalling + camping-reservering" als bundel',
    'Welkomstpakket bij aankomst (brood, fruit, gids)',
  ],
  comfort: [
    'Verhuur van caravan-voortenten',
    'Strandstoelen en parasol-verhuur',
    'Buiten-koelkast op zonne-energie',
  ],
  verhuur: [
    'Fietsen of e-bikes',
    'BBQ + tafel + stoelen pakket',
    'SUP-board of kayak voor aan zee',
  ],
  zomer: [
    'Mobiel zonnescherm voor je staanplaats',
    'Verhuur van een mini-zwembadje voor de kinderen',
    'Ventilator-set met accu',
  ],
  klimaat: [
    'Zonnepaneel-set voor op je dak',
    'Powerbank-station voor langere kampeertrips',
    'Waterbespaar-set voor onder de douche',
  ],
  anders: [
    'Een idee dat hier niet past?',
  ],
};

export default function IdeeenPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<string>('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/order/idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, category, title, message }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Verzenden mislukt');
        return;
      }
      setDone(true);
    } catch {
      setError('Verbindingsfout');
    } finally {
      setSubmitting(false);
    }
  };

  // Done-state — vriendelijke bedankt-pagina, geen receipt-flow.
  if (done) {
    return (
      <main className="min-h-screen bg-bg page-public">
        <PublicHero
          back={{ href: '/', label: 'Caravanstalling' }}
          title="Bedankt voor je idee!"
          intro="We lezen alles en koppelen terug zodra we ermee aan de slag gaan."
          eyebrow="💡 Ontvangen"
          accent="amber"
        />
        <div className="max-w-2xl mx-auto px-5 sm:px-6 py-10 sm:py-16 text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}
          >
            <Check size={26} strokeWidth={3} />
          </motion.div>
          <h2 className="text-2xl font-semibold mb-2">Top, dit gaan we lezen.</h2>
          <p className="text-text-muted leading-relaxed">
            Heb je nog een idee? <button
              type="button"
              onClick={() => {
                setDone(false);
                setTitle(''); setMessage(''); setCategory('');
              }}
              className="text-text underline underline-offset-4"
            >Nog eentje insturen</button>.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[14px] text-text-muted hover:text-text mt-8"
          >
            <ArrowRight size={14} className="rotate-180" /> Terug naar website
          </Link>
        </div>
      </main>
    );
  }

  const activeSuggestions = category && SUGGESTIONS[category] ? SUGGESTIONS[category] : [];

  return (
    <main className="min-h-screen bg-bg page-public">
      <PublicHero
        back={{ href: '/', label: 'Caravanstalling' }}
        title="Heb jij een idee voor ons?"
        intro="Een nieuwe service, een handigheidje voor op de camping, een bundel die we missen — alles is welkom. We lezen elk idee."
        eyebrow="Ideeënbus"
        eyebrowIcon={<Lightbulb size={11} />}
        accent="amber"
      />
      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-8 sm:py-14">
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={submit}
          className="space-y-7"
        >
          <Section title="Welk soort idee?">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const sel = category === c.value;
                return (
                  <motion.button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                    className={`text-left p-3 rounded-[var(--radius-md)] border transition-all ${
                      sel
                        ? 'border-accent bg-surface shadow-md'
                        : 'border-border bg-surface hover:border-border-strong'
                    }`}
                  >
                    <Icon size={16} className="text-text mb-1.5" />
                    <div className="text-[12px] font-medium leading-tight">{c.label}</div>
                  </motion.button>
                );
              })}
            </div>
          </Section>

          <AnimatePresence>
            {activeSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="rounded-[var(--radius-lg)] bg-surface-2 border border-border p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-2">
                    Inspiratie
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeSuggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setTitle(s)}
                        className="press-spring text-[12px] px-2.5 py-1 rounded-full border border-border bg-surface hover:border-border-strong transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-text-subtle mt-2">
                    Klik op één om als startpunt te gebruiken — of typ je eigen idee.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Section title="Vertel ons je idee">
            <Field label="Korte samenvatting" required>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bv. 'BBQ-pakket verhuren'"
                className={fieldCls}
              />
            </Field>
            <Field label="Uitleg" required hint="Wat zou je voor je zien? Hoe zou het werken?">
              <textarea
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Vertel zoveel of zo weinig als je wilt — wij lezen alles."
                className={`${fieldCls} min-h-[140px] py-2 resize-y`}
              />
            </Field>
          </Section>

          <Section title="Wie ben je? (optioneel)">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Naam" hint="Anoniem mag ook">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Bv. Jan"
                  className={fieldCls}
                />
              </Field>
              <Field label="E-mail" hint="Alleen als je een terugkoppeling wilt">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jij@voorbeeld.nl"
                  className={fieldCls}
                />
              </Field>
            </div>
          </Section>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[var(--radius-md)] bg-danger-soft text-danger px-4 py-3 text-[14px]"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="press-spring w-full h-14 rounded-[var(--radius-lg)] bg-accent text-accent-fg font-semibold text-[15px] hover:bg-accent-hover transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
            {submitting ? 'Versturen…' : 'Verstuur mijn idee'}
          </button>

          <p className="text-[12px] text-text-muted text-center">
            Geen verkooppraatjes, geen spam — gewoon een echte ideeënbus.
          </p>
        </motion.form>
      </div>
    </main>
  );
}
