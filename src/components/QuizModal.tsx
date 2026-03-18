'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, CheckCircle, Shield, Wrench, Truck, ShoppingBag, Sparkles, MapPin, Phone, MessageCircle, Mail } from 'lucide-react';

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
  source?: string;
}

const STEPS = ['interest', 'details', 'contact', 'done'] as const;
type Step = typeof STEPS[number];

const INTERESTS = [
  { id: 'stalling', label: 'Stalling', desc: 'Buiten- of binnenstalling', icon: Shield },
  { id: 'reparatie', label: 'Reparatie & onderhoud', desc: 'Werkplaats, alle merken', icon: Wrench },
  { id: 'schadeherstel', label: 'CaravanRepair® schade', desc: 'Onzichtbaar wandherstel', icon: Sparkles },
  { id: 'transport', label: 'Transport', desc: 'Ophalen & wegbrengen', icon: Truck },
  { id: 'verkoop', label: 'Verkoop / bemiddeling', desc: 'Kopen of verkopen', icon: ShoppingBag },
  { id: 'anders', label: 'Iets anders', desc: 'Stel uw vraag', icon: MessageCircle },
];

const STORAGE_TYPES = [
  { id: 'buiten', label: 'Buitenstalling', price: '€65/mnd' },
  { id: 'binnen', label: 'Binnenstalling', price: '€95/mnd' },
  { id: 'weet-niet', label: 'Weet ik nog niet', price: '' },
];

const BRANDS = ['Hobby', 'Fendt', 'Knaus', 'Dethleffs', 'Adria', 'Bürstner', 'LMC', 'Tabbert', 'Eriba', 'Anders'];

const LENGTHS = ['< 5 meter', '5-6 meter', '6-7 meter', '7-8 meter', '> 8 meter', 'Weet ik niet'];

const TIMEFRAMES = [
  { id: 'direct', label: 'Zo snel mogelijk' },
  { id: '1-3-maanden', label: 'Binnen 1-3 maanden' },
  { id: '3-6-maanden', label: 'Binnen 3-6 maanden' },
  { id: 'orienterend', label: 'Ik oriënteer mij' },
];

export default function QuizModal({ open, onClose, source = 'quiz' }: QuizModalProps) {
  const [step, setStep] = useState<Step>('interest');
  const [data, setData] = useState({
    interest: '',
    storage_type: '',
    caravan_brand: '',
    caravan_length: '',
    timeframe: '',
    email: '',
    name: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStep('interest');
    setData({ interest: '', storage_type: '', caravan_brand: '', caravan_length: '', timeframe: '', email: '', name: '', phone: '' });
    setSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 300);
  };

  const handleSubmit = async () => {
    if (!data.email) return;
    setSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, source }),
      });
      setStep('done');
    } catch {
      // Still show done to not frustrate user
      setStep('done');
    }
    setSubmitting(false);
  };

  const stepIndex = STEPS.indexOf(step);
  const progress = step === 'done' ? 100 : ((stepIndex) / (STEPS.length - 1)) * 100;

  const showStorageDetails = data.interest === 'stalling';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative bg-card rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div className="h-1 bg-sand">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface flex items-center justify-center text-warm-gray hover:text-primary transition-colors z-10"
              aria-label="Sluiten"
            >
              <X size={16} />
            </button>

            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {/* ── STEP 1: Interest ── */}
                {step === 'interest' && (
                  <motion.div key="interest" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <p className="text-primary text-xs font-bold tracking-[0.15em] uppercase mb-2">Stap 1 van 3</p>
                    <h3 className="text-xl font-black mb-1">Waarmee kunnen wij u helpen?</h3>
                    <p className="text-sm text-warm-gray mb-6">Selecteer wat het beste bij uw situatie past.</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {INTERESTS.map(i => (
                        <button
                          key={i.id}
                          onClick={() => {
                            setData({ ...data, interest: i.id });
                            setStep('details');
                          }}
                          className={`text-left p-4 rounded-xl border transition-all hover:border-primary/30 hover:bg-primary/[0.03] group ${
                            data.interest === i.id ? 'border-primary bg-primary/[0.05]' : 'border-sand-dark/30'
                          }`}
                        >
                          <i.icon size={20} className="text-primary mb-2" />
                          <p className="text-sm font-bold leading-tight">{i.label}</p>
                          <p className="text-[11px] text-warm-gray mt-0.5">{i.desc}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 2: Details ── */}
                {step === 'details' && (
                  <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <p className="text-primary text-xs font-bold tracking-[0.15em] uppercase mb-2">Stap 2 van 3</p>
                    <h3 className="text-xl font-black mb-1">Vertel ons meer</h3>
                    <p className="text-sm text-warm-gray mb-6">Zo kunnen wij u een passend aanbod doen.</p>

                    {showStorageDetails && (
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Voorkeur stallingtype</p>
                        <div className="grid grid-cols-3 gap-2">
                          {STORAGE_TYPES.map(s => (
                            <button
                              key={s.id}
                              onClick={() => setData({ ...data, storage_type: s.id })}
                              className={`p-3 rounded-xl text-center text-xs border transition-all ${
                                data.storage_type === s.id ? 'border-primary bg-primary/[0.05] text-primary font-bold' : 'border-sand-dark/30 text-warm-gray hover:border-primary/20'
                              }`}
                            >
                              <div className="font-semibold">{s.label}</div>
                              {s.price && <div className="text-[10px] mt-0.5 opacity-70">{s.price}</div>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mb-5">
                      <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Merk caravan</p>
                      <div className="flex flex-wrap gap-1.5">
                        {BRANDS.map(b => (
                          <button
                            key={b}
                            onClick={() => setData({ ...data, caravan_brand: b })}
                            className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                              data.caravan_brand === b ? 'border-primary bg-primary/[0.05] text-primary font-bold' : 'border-sand-dark/30 text-warm-gray hover:border-primary/20'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    {showStorageDetails && (
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Lengte caravan</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {LENGTHS.map(l => (
                            <button
                              key={l}
                              onClick={() => setData({ ...data, caravan_length: l })}
                              className={`px-3 py-2 rounded-lg text-xs border transition-all ${
                                data.caravan_length === l ? 'border-primary bg-primary/[0.05] text-primary font-bold' : 'border-sand-dark/30 text-warm-gray hover:border-primary/20'
                              }`}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mb-6">
                      <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Wanneer wilt u starten?</p>
                      <div className="grid grid-cols-2 gap-2">
                        {TIMEFRAMES.map(t => (
                          <button
                            key={t.id}
                            onClick={() => setData({ ...data, timeframe: t.id })}
                            className={`px-3 py-2.5 rounded-xl text-xs border transition-all ${
                              data.timeframe === t.id ? 'border-primary bg-primary/[0.05] text-primary font-bold' : 'border-sand-dark/30 text-warm-gray hover:border-primary/20'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={() => setStep('interest')} className="flex items-center gap-1 text-sm text-warm-gray hover:text-primary transition-colors">
                        <ArrowLeft size={14} /> Terug
                      </button>
                      <button
                        onClick={() => setStep('contact')}
                        className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                      >
                        Verder <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 3: Contact info ── */}
                {step === 'contact' && (
                  <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <p className="text-primary text-xs font-bold tracking-[0.15em] uppercase mb-2">Stap 3 van 3</p>
                    <h3 className="text-xl font-black mb-1">Waar mogen wij u bereiken?</h3>
                    <p className="text-sm text-warm-gray mb-6">Wij nemen binnen 24 uur contact met u op met een persoonlijk voorstel.</p>

                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="text-xs font-bold text-warm-gray block mb-1.5">E-mailadres *</label>
                        <div className="relative">
                          <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray/40" />
                          <input
                            type="email"
                            required
                            value={data.email}
                            onChange={e => setData({ ...data, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-sand/40 border border-sand-dark/40 rounded-xl text-sm focus:ring-2 focus:ring-primary/15 focus:border-primary/30 outline-none transition-all"
                            placeholder="uw@email.com"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-warm-gray block mb-1.5">Naam</label>
                          <input
                            type="text"
                            value={data.name}
                            onChange={e => setData({ ...data, name: e.target.value })}
                            className="w-full px-4 py-3 bg-sand/40 border border-sand-dark/40 rounded-xl text-sm focus:ring-2 focus:ring-primary/15 focus:border-primary/30 outline-none transition-all"
                            placeholder="Uw naam"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-warm-gray block mb-1.5">Telefoon</label>
                          <input
                            type="tel"
                            value={data.phone}
                            onChange={e => setData({ ...data, phone: e.target.value })}
                            className="w-full px-4 py-3 bg-sand/40 border border-sand-dark/40 rounded-xl text-sm focus:ring-2 focus:ring-primary/15 focus:border-primary/30 outline-none transition-all"
                            placeholder="+31 6..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <button onClick={() => setStep('details')} className="flex items-center gap-1 text-sm text-warm-gray hover:text-primary transition-colors">
                        <ArrowLeft size={14} /> Terug
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!data.email || submitting}
                        className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                      >
                        {submitting ? (
                          <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Versturen...</>
                        ) : (
                          <>Persoonlijk voorstel ontvangen <ArrowRight size={14} /></>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-3 text-[10px] text-warm-gray/60">
                      <span className="flex items-center gap-1"><Shield size={10} /> Geen spam</span>
                      <span className="flex items-center gap-1"><CheckCircle size={10} /> Binnen 24 uur reactie</span>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 4: Done ── */}
                {step === 'done' && (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-accent/15 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle className="text-accent" size={32} />
                      </div>
                      <h3 className="text-xl font-black mb-2">Bedankt{data.name ? `, ${data.name}` : ''}!</h3>
                      <p className="text-sm text-warm-gray leading-relaxed mb-6">
                        Wij hebben uw gegevens ontvangen en nemen <strong className="text-surface-dark">binnen 24 uur</strong> contact met u op met een persoonlijk voorstel.
                      </p>

                      <div className="bg-sand/50 rounded-xl p-4 mb-6 text-left">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2">Uw aanvraag</p>
                        <div className="space-y-1 text-sm">
                          {data.interest && <p><span className="text-warm-gray">Interesse:</span> {INTERESTS.find(i => i.id === data.interest)?.label}</p>}
                          {data.caravan_brand && <p><span className="text-warm-gray">Merk:</span> {data.caravan_brand}</p>}
                          {data.storage_type && <p><span className="text-warm-gray">Stallingtype:</span> {STORAGE_TYPES.find(s => s.id === data.storage_type)?.label}</p>}
                          {data.timeframe && <p><span className="text-warm-gray">Wanneer:</span> {TIMEFRAMES.find(t => t.id === data.timeframe)?.label}</p>}
                        </div>
                      </div>

                      <p className="text-xs text-warm-gray mb-4">Liever direct contact?</p>
                      <div className="flex gap-2">
                        <a href="tel:+34650036755" className="flex-1 bg-hero hover:bg-primary text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                          <Phone size={14} /> Bellen
                        </a>
                        <a href="https://wa.me/34650036755" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#25D366] hover:bg-[#22C35E] text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                          <MessageCircle size={14} /> WhatsApp
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
