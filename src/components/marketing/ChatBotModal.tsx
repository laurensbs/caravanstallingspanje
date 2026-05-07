'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, ArrowRight, MessageCircle, Mail } from 'lucide-react';

// Lichtgewicht FAQ-bot. Geen API-call (nog) — keyword-match op een vaste
// kennis-set. Onbekende vraag → fallback met contact-options. Later
// vervangen we matchAnswer() door een echte API-call (Claude/OpenAI) zonder
// de UI aan te passen.

type Msg = { role: 'bot' | 'user'; text: string; cta?: { href: string; label: string }[] };

type FaqEntry = {
  // Match als alle terms (of één van de alternatives binnen een groep) voorkomen.
  match: string[][];
  answer: string;
  cta?: { href: string; label: string }[];
};

const KB: FaqEntry[] = [
  {
    match: [['prijs', 'tarief', 'kosten', 'hoeveel'], ['stalling', 'stallen', 'binnen', 'buiten', 'overdekt']],
    answer: 'Prijzen voor stalling werken we op aanvraag, omdat we afstemmen op afmeting en plek. Op /tarieven zie je een overzicht en je kunt direct een offerte aanvragen.',
    cta: [{ href: '/tarieven', label: 'Bekijk tarieven' }, { href: '/contact?topic=storage', label: 'Vraag offerte' }],
  },
  {
    match: [['transport', 'ophalen', 'brengen', 'verzenden']],
    answer: 'We brengen je caravan van onze stalling naar je camping aan de Costa Brava en terug. Heen en terug in één boeking, vaste prijs. Of een enkele rit als je je caravan zelf één kant op rijdt.',
    cta: [{ href: '/diensten/transport', label: 'Transport-info' }, { href: '/reserveren/configurator', label: 'Boek transport' }],
  },
  {
    match: [['koelkast', 'fridge', 'huur', 'huren']],
    answer: 'We verhuren koelkasten en airco-units met levering op aangesloten campings. Bestel direct online — wij leveren vóór jouw aankomst.',
    cta: [{ href: '/koelkast', label: 'Bestel koelkast' }, { href: '/diensten/airco', label: 'Airco bekijken' }],
  },
  {
    match: [['reparatie', 'kapot', 'repareren', 'monteur', 'service'], []],
    answer: 'Eigen werkplaats van 850 m² met vaste monteurs. Schade, onderhoud, lekkages — we kijken er gratis naar voordat we starten.',
    cta: [{ href: '/diensten/reparatie', label: 'Reparatie-info' }, { href: '/contact?topic=repair', label: 'Plan een afspraak' }],
  },
  {
    match: [['inspectie', 'apk', 'check', 'controle']],
    answer: '25-puntsinspectie inclusief PDF-rapport. Handig vóór verkoop of als je zekerheid wilt over de staat.',
    cta: [{ href: '/diensten/inspectie', label: 'Inspectie-info' }],
  },
  {
    match: [['verzekering', 'verzekerd', 'diefstal', 'brand']],
    answer: 'Onze stalling is 24/7 bewaakt door Securitas Direct met camera-controle, alarm en perimeter-monitoring. Brand-, diefstal- en stormverzekering zijn standaard inbegrepen.',
  },
  {
    match: [['adres', 'locatie', 'waar', 'gelegen']],
    answer: 'Sant Climent de Peralta (Girona) — 15 minuten van Palamós, 35 van Girona Airport. Bezoek alleen op afspraak.',
    cta: [{ href: '/contact?topic=storage&subject=Rondleiding', label: 'Plan rondleiding' }],
  },
  {
    match: [['inloggen', 'login', 'portaal', 'account', 'wachtwoord']],
    answer: 'Heb je een welkomstmail van ons gehad? Klik op de link in de mail om een wachtwoord in te stellen. Daarna log je in op /account/login. Geen mail ontvangen? Stuur even een bericht.',
    cta: [{ href: '/account/login', label: 'Naar inloggen' }, { href: '/contact?topic=other&subject=Welkomstmail', label: 'Geen mail gehad' }],
  },
  {
    match: [['verkoop', 'kopen', 'inkoop', 'verkopen']],
    answer: 'Bekijk onze voorraad caravans op /verkoop. Je eigen caravan verkopen kan ook — wij kopen hem in of helpen je verkopen.',
    cta: [{ href: '/verkoop', label: 'Bekijk voorraad' }, { href: '/verkoop/inkoop', label: 'Inkoop aanvragen' }],
  },
  {
    match: [['verhuur', 'huren', 'caravan']],
    answer: 'Onze zustersite caravanverhuurspanje.com verhuurt caravans op vaste plekken aan de Costa Brava — inclusief onze service en transport.',
    cta: [{ href: '/caravan-huren', label: 'Caravan huren' }],
  },
  {
    match: [['camping', 'campings', 'aangesloten']],
    answer: 'We leveren op 40+ partner-campings van Empuriabrava tot Blanes — koelkasten, airco-units en transport tot aan jouw plek.',
    cta: [{ href: '/aangesloten-campings', label: 'Bekijk campings' }],
  },
];

function matchAnswer(input: string): { answer: string; cta?: { href: string; label: string }[] } | null {
  const norm = input.toLowerCase();
  for (const entry of KB) {
    const hits = entry.match.every((group) => {
      if (group.length === 0) return true;
      return group.some((term) => norm.includes(term));
    });
    if (hits) return { answer: entry.answer, cta: entry.cta };
  }
  return null;
}

const SUGGESTIONS = [
  'Wat kost stalling?',
  'Wat kost transport?',
  'Hoe huur ik een koelkast?',
  'Hoe log ik in op het portaal?',
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChatBotModal({ open, onClose }: Props) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'bot',
      text: 'Hi! Ik help je met snelle vragen over stalling, transport, reparatie en het portaal. Stel gerust je vraag of kies een suggestie.',
    },
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Msg = { role: 'user', text: trimmed };
    const match = matchAnswer(trimmed);
    const botMsg: Msg = match
      ? { role: 'bot', text: match.answer, cta: match.cta }
      : {
        role: 'bot',
        text: 'Daar kan ik je nog niet 100% goed mee helpen. Stuur een berichtje via WhatsApp of het contactformulier — Laurens of het team antwoordt meestal binnen een paar uur.',
        cta: [
          { href: 'https://wa.me/34633778699', label: 'WhatsApp' },
          { href: '/contact', label: 'Contactformulier' },
        ],
      };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="chat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
            style={{
              position: 'fixed', inset: 0, zIndex: 90,
              background: 'rgba(15, 23, 32, 0.55)',
              backdropFilter: 'blur(4px)',
            }}
          />
          <motion.div
            key="chat-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Chat-assistent"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="chat-panel"
          >
            <header className="chat-header">
              <div className="chat-header-info">
                <span className="chat-header-avatar" aria-hidden>
                  <Bot size={18} />
                </span>
                <div>
                  <div className="chat-header-title">Caravanstalling-assistent</div>
                  <div className="chat-header-sub">Snelle antwoorden — meestal direct</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Sluit chat"
                className="chat-close"
              >
                <X size={18} />
              </button>
            </header>

            <div ref={scrollRef} className="chat-body">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={m.role === 'user' ? 'chat-msg chat-msg-user' : 'chat-msg chat-msg-bot'}
                >
                  <div className="chat-bubble">{m.text}</div>
                  {m.cta && m.cta.length > 0 && (
                    <div className="chat-cta-row">
                      {m.cta.map((c) =>
                        c.href.startsWith('http') ? (
                          <a key={c.href} href={c.href} target="_blank" rel="noopener noreferrer" className="chat-cta-link">
                            {c.label} <ArrowRight size={12} aria-hidden />
                          </a>
                        ) : (
                          <Link key={c.href} href={c.href} onClick={onClose} className="chat-cta-link">
                            {c.label} <ArrowRight size={12} aria-hidden />
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
              {messages.length === 1 && (
                <div className="chat-suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button
                      type="button"
                      key={s}
                      className="chat-suggestion"
                      onClick={() => send(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              className="chat-input-row"
              onSubmit={(e) => { e.preventDefault(); send(input); }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Stel een vraag…"
                className="chat-input"
                autoComplete="off"
              />
              <button
                type="submit"
                aria-label="Verstuur"
                disabled={!input.trim()}
                className="chat-send"
              >
                <Send size={15} aria-hidden />
              </button>
            </form>

            <footer className="chat-foot">
              <span>Niet gevonden wat je zocht?</span>
              <a href="https://wa.me/34633778699" target="_blank" rel="noopener noreferrer" className="chat-foot-link">
                <MessageCircle size={11} aria-hidden /> WhatsApp
              </a>
              <Link href="/contact" onClick={onClose} className="chat-foot-link">
                <Mail size={11} aria-hidden /> Contactformulier
              </Link>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
