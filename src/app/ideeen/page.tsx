'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Lightbulb, Send, Loader2, Check, ArrowRight, Sparkles,
  Wrench, Tent, Coffee, Bike, Sun, Wind, ThumbsUp, ThumbsDown, Star,
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
        <FeaturedIdeas />

        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={submit}
          className="space-y-7"
        >
          <Section title="Welk soort idee? (optioneel)">
            <p className="text-[12px] text-text-muted -mt-1 mb-2">
              Sla gerust over — je idee mag echt over wat dan ook gaan. Een categorie helpt ons alleen om je inzending sneller bij de juiste persoon te krijgen.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const sel = category === c.value;
                return (
                  <motion.button
                    key={c.value}
                    type="button"
                    // Klik nogmaals = deselecteren. Zo voelt 't echt optioneel.
                    onClick={() => setCategory(sel ? '' : c.value)}
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
            {category && (
              <button
                type="button"
                onClick={() => setCategory('')}
                className="text-[12px] text-text-muted hover:text-text underline-offset-4 hover:underline mt-2"
              >
                Geen categorie kiezen
              </button>
            )}
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

type PublicIdea = {
  id: number;
  category: string | null;
  title: string;
  message: string;
  votes_up: number;
  votes_down: number;
  featured: boolean;
};

function FeaturedIdeas() {
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
        // Optimistic increment in UI
        setIdeas((curr) => curr?.map((i) =>
          i.id === id
            ? { ...i, [`votes_${direction}`]: (direction === 'up' ? i.votes_up : i.votes_down) + 1 }
            : i
        ) ?? null);
      }
    } finally {
      setVoting(null);
    }
  };

  if (!ideas || ideas.length === 0) return null;

  return (
    <div className="mb-10 space-y-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted flex items-center gap-2">
        <Star size={12} /> Wij denken aan…
      </h2>
      {ideas.map((idea) => {
        const userVote = voted[idea.id];
        const totalVotes = idea.votes_up + idea.votes_down;
        const upPct = totalVotes > 0 ? Math.round((idea.votes_up / totalVotes) * 100) : 0;
        return (
          <motion.div
            key={idea.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card-surface p-5 ${idea.featured ? 'ring-1 ring-warning/40' : ''}`}
          >
            {idea.featured && (
              <div className="inline-flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-[0.18em]"
                style={{ background: 'var(--color-warning-soft)', color: 'var(--color-warning)' }}>
                <Star size={10} /> We willen graag jouw mening
              </div>
            )}
            <h3 className="text-[16px] font-semibold mb-2">{idea.title}</h3>
            <p className="text-[14px] text-text-muted leading-relaxed whitespace-pre-wrap mb-4">
              {idea.message}
            </p>

            {/* Vote-rij */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border">
              <p className="text-[12px] text-text-muted mr-auto">
                Wat vind jij?
              </p>
              <button
                type="button"
                disabled={!!userVote || voting === idea.id}
                onClick={() => vote(idea.id, 'up')}
                className={`press-spring inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-medium transition-all ${
                  userVote === 'up'
                    ? 'bg-success-soft text-success border-2 border-success'
                    : 'border border-border bg-surface hover:border-success hover:text-success disabled:opacity-50'
                }`}
              >
                <ThumbsUp size={13} fill={userVote === 'up' ? 'currentColor' : 'none'} />
                Goed idee
                <span className="tabular-nums opacity-70">{idea.votes_up}</span>
              </button>
              <button
                type="button"
                disabled={!!userVote || voting === idea.id}
                onClick={() => vote(idea.id, 'down')}
                className={`press-spring inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-medium transition-all ${
                  userVote === 'down'
                    ? 'bg-danger-soft text-danger border-2 border-danger'
                    : 'border border-border bg-surface hover:border-danger hover:text-danger disabled:opacity-50'
                }`}
              >
                <ThumbsDown size={13} fill={userVote === 'down' ? 'currentColor' : 'none'} />
                Niet voor mij
                <span className="tabular-nums opacity-70">{idea.votes_down}</span>
              </button>
            </div>
            {totalVotes >= 5 && (
              <p className="text-[11px] text-text-subtle mt-2">
                {totalVotes} stemmen · {upPct}% positief
              </p>
            )}
            {userVote && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[12px] text-text-muted mt-2 inline-flex items-center gap-1"
              >
                <Check size={11} /> Bedankt voor je stem!
              </motion.p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
