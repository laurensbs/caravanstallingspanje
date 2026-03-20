'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, CheckCircle, Shield, Wrench, Truck, ShoppingBag, Sparkles, Phone, MessageCircle, Mail, Bike, SprayCan } from 'lucide-react';

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
  source?: string;
  initialInterest?: string;
}

const STEPS = ['interest', 'details', 'contact', 'done'] as const;
type Step = typeof STEPS[number];

const INTERESTS = [
  { id: 'stalling', label: 'Stalling', desc: 'Buiten- of binnenstalling', icon: Shield },
  { id: 'reparatie', label: 'Reparatie & onderhoud', desc: 'Werkplaats, alle merken', icon: Wrench },
  { id: 'schadeherstel', label: 'CaravanRepair® schade', desc: 'Onzichtbaar wandherstel', icon: Sparkles },
  { id: 'transport', label: 'Transport', desc: 'Ophalen & wegbrengen', icon: Truck },
  { id: 'verkoop', label: 'Verkoop / bemiddeling', desc: 'Kopen of verkopen', icon: ShoppingBag },
  { id: 'verhuur', label: 'Verhuur', desc: 'Fietsen, koelkasten, airco', icon: Bike },
  { id: 'schoonmaak', label: 'Schoonmaak', desc: 'Interieur & exterieur', icon: SprayCan },
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

// ── Reparatie options ──
const REPAIR_TYPES = ['Banden & uitlijning', 'Remmen & remleidingen', 'Gas & elektra', 'Dakluiken & ramen', 'Airco service', 'Chassis & koppeling', 'Vochtschade & lekkages', 'Interieur', 'Verlichting', 'Anders'];
const URGENCIES = [
  { id: 'spoed', label: 'Spoed (< 1 week)' },
  { id: 'binnenkort', label: 'Binnenkort (1-4 weken)' },
  { id: 'planbaar', label: 'Geen haast' },
  { id: 'orienterend', label: 'Ik oriënteer mij' },
];

// ── Schadeherstel options ──
const DAMAGE_TYPES = ['Hagelschade', 'Stormschade', 'Aanrijding', 'Parkeerschade', 'Deuken', 'Scheuren', 'Vochtschade', 'Krassen', 'Anders'];
const INSURANCE_OPTIONS = [
  { id: 'ja', label: 'Ja, via mijn verzekering' },
  { id: 'nee', label: 'Nee, ik betaal zelf' },
  { id: 'weet-niet', label: 'Weet ik nog niet' },
];

// ── Transport options ──
const TRANSPORT_ROUTES = [
  { id: 'nl-es', label: 'Nederland → Costa Brava' },
  { id: 'be-es', label: 'België → Costa Brava' },
  { id: 'de-es', label: 'Duitsland → Costa Brava' },
  { id: 'regionaal', label: 'Camping ↔ Stalling (regionaal)' },
  { id: 'anders', label: 'Andere route' },
];

// ── Verkoop options ──
const SALE_TYPES = [
  { id: 'kopen', label: 'Ik wil een caravan kopen' },
  { id: 'verkopen', label: 'Ik wil mijn caravan verkopen' },
];
const BUDGETS = ['< €3.000', '€3.000 - €5.000', '€5.000 - €8.000', '> €8.000', 'Weet ik nog niet'];

// ── Verhuur options ──
const RENTAL_ITEMS = ['Elektrische fiets', 'Stadsfiets', 'Mountainbike', 'Kinderfiets', 'Koelkast', 'Mobiele airco'];
const RENTAL_PERIODS = [
  { id: '1-week', label: '1 week' },
  { id: '2-weken', label: '2 weken' },
  { id: 'maand', label: 'Maand' },
  { id: 'seizoen', label: 'Seizoen' },
];

// ── Schoonmaak options ──
const CLEANING_PACKAGES = [
  { id: 'basiswas', label: 'Basiswas exterieur', price: '€75' },
  { id: 'compleet', label: 'Complete schoonmaak', price: '€150' },
  { id: 'polish', label: 'Polishbehandeling', price: '€195' },
  { id: 'anti-mos', label: 'Anti-mos & alg', price: '€95' },
  { id: 'dak', label: 'Dakbehandeling', price: '€85' },
  { id: 'seizoensklaar', label: 'Seizoensklaar pakket', price: '€245' },
];

export default function QuizModal({ open, onClose, source = 'quiz', initialInterest }: QuizModalProps) {
  const [step, setStep] = useState<Step>(initialInterest ? 'details' : 'interest');
  const [data, setData] = useState({
    interest: initialInterest || '',
    storage_type: '',
    caravan_brand: '',
    caravan_length: '',
    timeframe: '',
    email: '',
    name: '',
    phone: '',
    // Per-service fields
    repair_types: [] as string[],
    urgency: '',
    description: '',
    damage_types: [] as string[],
    insurance: '',
    route: '',
    sale_type: '',
    budget: '',
    rental_items: [] as string[],
    rental_period: '',
    cleaning_package: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const initialData = {
    interest: initialInterest || '', storage_type: '', caravan_brand: '', caravan_length: '', timeframe: '',
    email: '', name: '', phone: '',
    repair_types: [] as string[], urgency: '', description: '',
    damage_types: [] as string[], insurance: '', route: '',
    sale_type: '', budget: '', rental_items: [] as string[], rental_period: '', cleaning_package: '',
  };

  const reset = () => {
    setStep(initialInterest ? 'details' : 'interest');
    setData({ ...initialData, interest: initialInterest || '' });
    setSubmitting(false);
  };

  useEffect(() => {
    if (open && initialInterest) {
      setData(d => ({ ...d, interest: initialInterest }));
      setStep('details');
    } else if (open && !initialInterest) {
      setStep('interest');
    }
  }, [open, initialInterest]);

  const handleClose = () => {
    onClose();
    setTimeout(reset, 300);
  };

  const buildServiceDetails = () => {
    const details: Record<string, unknown> = {};
    switch (data.interest) {
      case 'reparatie':
        if (data.repair_types.length) details.repair_types = data.repair_types;
        if (data.urgency) details.urgency = data.urgency;
        if (data.description) details.description = data.description;
        break;
      case 'schadeherstel':
        if (data.damage_types.length) details.damage_types = data.damage_types;
        if (data.insurance) details.insurance = data.insurance;
        if (data.description) details.description = data.description;
        break;
      case 'transport':
        if (data.route) details.route = data.route;
        break;
      case 'verkoop':
        if (data.sale_type) details.sale_type = data.sale_type;
        if (data.budget) details.budget = data.budget;
        break;
      case 'verhuur':
        if (data.rental_items.length) details.rental_items = data.rental_items;
        if (data.rental_period) details.rental_period = data.rental_period;
        break;
      case 'schoonmaak':
        if (data.cleaning_package) details.cleaning_package = data.cleaning_package;
        break;
      case 'anders':
        if (data.description) details.description = data.description;
        break;
    }
    return Object.keys(details).length ? JSON.stringify(details) : null;
  };

  const handleSubmit = async () => {
    if (!data.email) return;
    setSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email, name: data.name, phone: data.phone,
          interest: data.interest, storage_type: data.storage_type || null,
          caravan_brand: data.caravan_brand || null, caravan_length: data.caravan_length || null,
          timeframe: data.timeframe || null, services: buildServiceDetails(), source,
        }),
      });
      setStep('done');
    } catch {
      setStep('done');
    }
    setSubmitting(false);
  };

  const stepIndex = STEPS.indexOf(step);
  const progress = step === 'done' ? 100 : ((stepIndex) / (STEPS.length - 1)) * 100;

  const toggleArray = (field: 'repair_types' | 'damage_types' | 'rental_items', value: string) => {
    setData(d => ({ ...d, [field]: d[field].includes(value) ? d[field].filter((v: string) => v !== value) : [...d[field], value] }));
  };
  const chip = (selected: boolean) => `px-3 py-1.5 rounded-lg text-xs border transition-all ${selected ? 'border-primary bg-primary/[0.05] text-primary font-bold' : 'border-sand-dark/30 text-warm-gray hover:border-primary/20'}`;
  const gridBtn = (selected: boolean) => `p-3 rounded-xl text-center text-xs border transition-all ${selected ? 'border-primary bg-primary/[0.05] text-primary font-bold' : 'border-sand-dark/30 text-warm-gray hover:border-primary/20'}`;

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
            className="relative bg-card rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
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

            <div className="p-6 sm:p-8 overflow-y-auto">
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

                {/* ── STEP 2: Details (per service) ── */}
                {step === 'details' && (
                  <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <p className="text-primary text-xs font-bold tracking-[0.15em] uppercase mb-2">Stap 2 van 3</p>
                    <h3 className="text-xl font-black mb-1">Vertel ons meer</h3>
                    <p className="text-sm text-warm-gray mb-6">
                      {data.interest === 'stalling' && 'Zo kunnen wij u een passend stallingsvoorstel doen.'}
                      {data.interest === 'reparatie' && 'Vertel ons wat er aan uw caravan moet gebeuren.'}
                      {data.interest === 'schadeherstel' && 'Beschrijf de schade zodat wij een offerte kunnen maken.'}
                      {data.interest === 'transport' && 'Vertel ons waar uw caravan naartoe moet.'}
                      {data.interest === 'verkoop' && 'Wat zijn uw wensen rondom koop of verkoop?'}
                      {data.interest === 'verhuur' && 'Wat wilt u huren voor uw vakantie?'}
                      {data.interest === 'schoonmaak' && 'Welk schoonmaakpakket past bij u?'}
                      {data.interest === 'anders' && 'Vertel ons hoe wij u kunnen helpen.'}
                    </p>

                    {/* ══ STALLING ══ */}
                    {data.interest === 'stalling' && (<>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Voorkeur stallingtype</p>
                        <div className="grid grid-cols-3 gap-2">
                          {STORAGE_TYPES.map(s => (
                            <button key={s.id} onClick={() => setData({ ...data, storage_type: s.id })} className={gridBtn(data.storage_type === s.id)}>
                              <div className="font-semibold">{s.label}</div>
                              {s.price && <div className="text-[10px] mt-0.5 opacity-70">{s.price}</div>}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Merk caravan</p>
                        <div className="flex flex-wrap gap-1.5">
                          {BRANDS.map(b => <button key={b} onClick={() => setData({ ...data, caravan_brand: b })} className={chip(data.caravan_brand === b)}>{b}</button>)}
                        </div>
                      </div>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Lengte caravan</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {LENGTHS.map(l => <button key={l} onClick={() => setData({ ...data, caravan_length: l })} className={chip(data.caravan_length === l)}>{l}</button>)}
                        </div>
                      </div>
                      <div className="mb-6">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Wanneer wilt u starten?</p>
                        <div className="grid grid-cols-2 gap-2">
                          {TIMEFRAMES.map(t => <button key={t.id} onClick={() => setData({ ...data, timeframe: t.id })} className={gridBtn(data.timeframe === t.id)}>{t.label}</button>)}
                        </div>
                      </div>
                    </>)}

                    {/* ══ REPARATIE ══ */}
                    {data.interest === 'reparatie' && (<>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Merk caravan</p>
                        <div className="flex flex-wrap gap-1.5">
                          {BRANDS.map(b => <button key={b} onClick={() => setData({ ...data, caravan_brand: b })} className={chip(data.caravan_brand === b)}>{b}</button>)}
                        </div>
                      </div>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Type reparatie (meerdere mogelijk)</p>
                        <div className="flex flex-wrap gap-1.5">
                          {REPAIR_TYPES.map(r => <button key={r} onClick={() => toggleArray('repair_types', r)} className={chip(data.repair_types.includes(r))}>{r}</button>)}
                        </div>
                      </div>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Hoe urgent?</p>
                        <div className="grid grid-cols-2 gap-2">
                          {URGENCIES.map(u => <button key={u.id} onClick={() => setData({ ...data, urgency: u.id })} className={gridBtn(data.urgency === u.id)}>{u.label}</button>)}
                        </div>
                      </div>
                      <div className="mb-6">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Toelichting (optioneel)</p>
                        <textarea value={data.description} onChange={e => setData({ ...data, description: e.target.value })} className="w-full px-4 py-3 bg-sand/40 border border-sand-dark/40 rounded-xl text-sm focus:ring-2 focus:ring-primary/15 focus:border-primary/30 outline-none transition-all resize-none h-20" placeholder="Eventuele bijzonderheden..." />
                      </div>
                    </>)}

                    {/* ══ SCHADEHERSTEL (CaravanRepair®) ══ */}
                    {data.interest === 'schadeherstel' && (<>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Merk caravan</p>
                        <div className="flex flex-wrap gap-1.5">
                          {BRANDS.map(b => <button key={b} onClick={() => setData({ ...data, caravan_brand: b })} className={chip(data.caravan_brand === b)}>{b}</button>)}
                        </div>
                      </div>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Type schade (meerdere mogelijk)</p>
                        <div className="flex flex-wrap gap-1.5">
                          {DAMAGE_TYPES.map(d => <button key={d} onClick={() => toggleArray('damage_types', d)} className={chip(data.damage_types.includes(d))}>{d}</button>)}
                        </div>
                      </div>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Via verzekering?</p>
                        <div className="grid grid-cols-3 gap-2">
                          {INSURANCE_OPTIONS.map(i => <button key={i.id} onClick={() => setData({ ...data, insurance: i.id })} className={gridBtn(data.insurance === i.id)}>{i.label}</button>)}
                        </div>
                      </div>
                      <div className="mb-6">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Omschrijving schade (optioneel)</p>
                        <textarea value={data.description} onChange={e => setData({ ...data, description: e.target.value })} className="w-full px-4 py-3 bg-sand/40 border border-sand-dark/40 rounded-xl text-sm focus:ring-2 focus:ring-primary/15 focus:border-primary/30 outline-none transition-all resize-none h-20" placeholder="Beschrijf kort wat er is gebeurd..." />
                      </div>
                    </>)}

                    {/* ══ TRANSPORT ══ */}
                    {data.interest === 'transport' && (<>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Merk caravan</p>
                        <div className="flex flex-wrap gap-1.5">
                          {BRANDS.map(b => <button key={b} onClick={() => setData({ ...data, caravan_brand: b })} className={chip(data.caravan_brand === b)}>{b}</button>)}
                        </div>
                      </div>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Lengte caravan</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {LENGTHS.map(l => <button key={l} onClick={() => setData({ ...data, caravan_length: l })} className={chip(data.caravan_length === l)}>{l}</button>)}
                        </div>
                      </div>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Gewenste route</p>
                        <div className="grid grid-cols-1 gap-2">
                          {TRANSPORT_ROUTES.map(r => <button key={r.id} onClick={() => setData({ ...data, route: r.id })} className={gridBtn(data.route === r.id)}>{r.label}</button>)}
                        </div>
                      </div>
                      <div className="mb-6">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Wanneer?</p>
                        <div className="grid grid-cols-2 gap-2">
                          {TIMEFRAMES.map(t => <button key={t.id} onClick={() => setData({ ...data, timeframe: t.id })} className={gridBtn(data.timeframe === t.id)}>{t.label}</button>)}
                        </div>
                      </div>
                    </>)}

                    {/* ══ VERKOOP ══ */}
                    {data.interest === 'verkoop' && (<>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Wat wilt u?</p>
                        <div className="grid grid-cols-1 gap-2">
                          {SALE_TYPES.map(s => <button key={s.id} onClick={() => setData({ ...data, sale_type: s.id })} className={gridBtn(data.sale_type === s.id)}>{s.label}</button>)}
                        </div>
                      </div>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Merk caravan</p>
                        <div className="flex flex-wrap gap-1.5">
                          {BRANDS.map(b => <button key={b} onClick={() => setData({ ...data, caravan_brand: b })} className={chip(data.caravan_brand === b)}>{b}</button>)}
                        </div>
                      </div>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">{data.sale_type === 'verkopen' ? 'Vraagprijs' : 'Budget'}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {BUDGETS.map(b => <button key={b} onClick={() => setData({ ...data, budget: b })} className={chip(data.budget === b)}>{b}</button>)}
                        </div>
                      </div>
                      <div className="mb-6">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Wanneer?</p>
                        <div className="grid grid-cols-2 gap-2">
                          {TIMEFRAMES.map(t => <button key={t.id} onClick={() => setData({ ...data, timeframe: t.id })} className={gridBtn(data.timeframe === t.id)}>{t.label}</button>)}
                        </div>
                      </div>
                    </>)}

                    {/* ══ VERHUUR ══ */}
                    {data.interest === 'verhuur' && (<>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Wat wilt u huren? (meerdere mogelijk)</p>
                        <div className="flex flex-wrap gap-1.5">
                          {RENTAL_ITEMS.map(r => <button key={r} onClick={() => toggleArray('rental_items', r)} className={chip(data.rental_items.includes(r))}>{r}</button>)}
                        </div>
                      </div>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Huurperiode</p>
                        <div className="grid grid-cols-2 gap-2">
                          {RENTAL_PERIODS.map(p => <button key={p.id} onClick={() => setData({ ...data, rental_period: p.id })} className={gridBtn(data.rental_period === p.id)}>{p.label}</button>)}
                        </div>
                      </div>
                      <div className="mb-6">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Wanneer nodig?</p>
                        <div className="grid grid-cols-2 gap-2">
                          {TIMEFRAMES.map(t => <button key={t.id} onClick={() => setData({ ...data, timeframe: t.id })} className={gridBtn(data.timeframe === t.id)}>{t.label}</button>)}
                        </div>
                      </div>
                    </>)}

                    {/* ══ SCHOONMAAK ══ */}
                    {data.interest === 'schoonmaak' && (<>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Welk pakket?</p>
                        <div className="grid grid-cols-2 gap-2">
                          {CLEANING_PACKAGES.map(c => (
                            <button key={c.id} onClick={() => setData({ ...data, cleaning_package: c.id })} className={gridBtn(data.cleaning_package === c.id)}>
                              <div className="font-semibold">{c.label}</div>
                              <div className="text-[10px] mt-0.5 opacity-70">{c.price}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Merk caravan</p>
                        <div className="flex flex-wrap gap-1.5">
                          {BRANDS.map(b => <button key={b} onClick={() => setData({ ...data, caravan_brand: b })} className={chip(data.caravan_brand === b)}>{b}</button>)}
                        </div>
                      </div>
                      <div className="mb-6">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Wanneer?</p>
                        <div className="grid grid-cols-2 gap-2">
                          {TIMEFRAMES.map(t => <button key={t.id} onClick={() => setData({ ...data, timeframe: t.id })} className={gridBtn(data.timeframe === t.id)}>{t.label}</button>)}
                        </div>
                      </div>
                    </>)}

                    {/* ══ ANDERS ══ */}
                    {data.interest === 'anders' && (<>
                      <div className="mb-6">
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2.5">Uw vraag of opmerking</p>
                        <textarea value={data.description} onChange={e => setData({ ...data, description: e.target.value })} className="w-full px-4 py-3 bg-sand/40 border border-sand-dark/40 rounded-xl text-sm focus:ring-2 focus:ring-primary/15 focus:border-primary/30 outline-none transition-all resize-none h-28" placeholder="Stel uw vraag of vertel ons hoe wij u kunnen helpen..." />
                      </div>
                    </>)}

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
                          {data.caravan_length && <p><span className="text-warm-gray">Lengte:</span> {data.caravan_length}</p>}
                          {data.route && <p><span className="text-warm-gray">Route:</span> {TRANSPORT_ROUTES.find(r => r.id === data.route)?.label}</p>}
                          {data.sale_type && <p><span className="text-warm-gray">Type:</span> {SALE_TYPES.find(s => s.id === data.sale_type)?.label}</p>}
                          {data.budget && <p><span className="text-warm-gray">{data.sale_type === 'verkopen' ? 'Vraagprijs' : 'Budget'}:</span> {data.budget}</p>}
                          {data.repair_types.length > 0 && <p><span className="text-warm-gray">Reparatie:</span> {data.repair_types.join(', ')}</p>}
                          {data.urgency && <p><span className="text-warm-gray">Urgentie:</span> {URGENCIES.find(u => u.id === data.urgency)?.label}</p>}
                          {data.damage_types.length > 0 && <p><span className="text-warm-gray">Schade:</span> {data.damage_types.join(', ')}</p>}
                          {data.insurance && <p><span className="text-warm-gray">Verzekering:</span> {INSURANCE_OPTIONS.find(i => i.id === data.insurance)?.label}</p>}
                          {data.rental_items.length > 0 && <p><span className="text-warm-gray">Verhuur:</span> {data.rental_items.join(', ')}</p>}
                          {data.rental_period && <p><span className="text-warm-gray">Periode:</span> {RENTAL_PERIODS.find(p => p.id === data.rental_period)?.label}</p>}
                          {data.cleaning_package && <p><span className="text-warm-gray">Pakket:</span> {CLEANING_PACKAGES.find(c => c.id === data.cleaning_package)?.label}</p>}
                          {data.timeframe && <p><span className="text-warm-gray">Wanneer:</span> {TIMEFRAMES.find(t => t.id === data.timeframe)?.label}</p>}
                          {data.description && <p><span className="text-warm-gray">Toelichting:</span> {data.description}</p>}
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
