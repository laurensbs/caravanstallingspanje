"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { StepIndicator } from "@/components/ui";
import { Shield, CheckCircle, ArrowRight, ArrowLeft, MapPin, Calendar, Ruler, Truck, Sparkles, Zap, Droplets, Star, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const STEPS = [
  { label: "Stallingtype" },
  { label: "Caravan" },
  { label: "Gegevens" },
  { label: "Extras" },
  { label: "Bevestiging" },
];

const STORAGE_TYPES = [
  { id: "buiten", label: "Buitenstalling", price: 65, desc: "Beveiligd buitenterrein met 24/7 bewaking", features: ["Securitas alarm", "24/7 camera's", "Verzekerd", "Tweewekelijkse controle"], icon: Shield, popular: false },
  { id: "binnen", label: "Binnenstalling", price: 95, desc: "Overdekte hal met klimaatbescherming", features: ["Geïsoleerde hal", "Geen hitte/kou", "Alle buiten-voordelen", "Premium locatie"], icon: Lock, popular: true },
  { id: "seizoen", label: "Seizoensstalling", price: 45, desc: "Flexibel buiten het seizoen (okt-apr)", features: ["Buitenstalling", "Beveiligd", "6+ maanden", "Upgrade mogelijk"], icon: Calendar, popular: false },
];

const EXTRAS = [
  { id: "cleaning_basic", label: "Basis schoonmaak", price: 75, icon: Droplets, desc: "Exterieur wassen + interieur stofzuigen" },
  { id: "cleaning_premium", label: "Premium schoonmaak", price: 145, icon: Sparkles, desc: "Compleet binnen- en buitenreiniging", popular: true },
  { id: "ready_service", label: "Klaarzet-service", price: 50, icon: Zap, desc: "Caravan staat klaar bij aankomst" },
  { id: "maintenance_check", label: "Technische keuring", price: 125, icon: Shield, desc: "Volledige technische inspectie" },
  { id: "transport", label: "Transport service", price: 0, icon: Truck, desc: "Ophalen/afzetten op camping \u2014 op aanvraag", onRequest: true },
];

const BUNDLE_DEAL = {
  id: "bundle_premium",
  label: "Zorgeloos Pakket",
  includes: ["cleaning_premium", "ready_service", "maintenance_check"],
  normalPrice: 320,
  bundlePrice: 269,
  savings: 51,
};

function BookingPageInner() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<{ available: number; total: number } | null>(null);
  const [result, setResult] = useState<{ contractNumber: string; spotLabel: string; checkoutUrl: string | null } | null>(null);

  const [form, setForm] = useState({
    storageType: "buiten",
    caravanLength: "",
    startDate: "",
    locationId: 1,
    brand: "",
    model: "",
    licensePlate: "",
    year: "",
    weight: "",
    hasMover: false,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    extras: [] as string[],
  });

  // Handle success/cancel from Stripe
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setStep(4);
      setResult({ contractNumber: searchParams.get("contract") || "", spotLabel: "", checkoutUrl: null });
      toast.success("Betaling succesvol ontvangen!");
    }
    if (searchParams.get("cancelled") === "true") {
      toast.error("Betaling geannuleerd. U kunt het opnieuw proberen.");
    }
  }, [searchParams]);

  const update = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }));

  const toggleExtra = (id: string) => {
    setForm(f => ({
      ...f,
      extras: f.extras.includes(id) ? f.extras.filter(e => e !== id) : [...f.extras, id],
    }));
  };

  const toggleBundle = () => {
    const bundleIds = BUNDLE_DEAL.includes;
    const hasAll = bundleIds.every(id => form.extras.includes(id));
    if (hasAll) {
      setForm(f => ({ ...f, extras: f.extras.filter(e => !bundleIds.includes(e)) }));
    } else {
      setForm(f => ({ ...f, extras: [...new Set([...f.extras, ...bundleIds])] }));
    }
  };

  const checkAvailability = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/booking/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storageType: form.storageType,
          caravanLength: form.caravanLength,
          startDate: form.startDate,
          locationId: form.locationId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAvailability(data);
        if (data.available > 0) {
          toast.success(`${data.available} plekken beschikbaar!`);
          setStep(1);
        } else {
          toast.error("Helaas, geen plekken beschikbaar voor deze selectie.");
        }
      }
    } catch {
      toast.error("Er ging iets mis. Probeer het opnieuw.");
    }
    setLoading(false);
  };

  const submitBooking = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          year: form.year ? Number(form.year) : undefined,
          weight: form.weight ? Number(form.weight) : undefined,
          locationId: Number(form.locationId),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data);
        setStep(4);
        toast.success("Boeking succesvol aangemaakt!");
        if (data.checkoutUrl) {
          // Redirect to Stripe checkout
          window.location.href = data.checkoutUrl;
          return;
        }
      } else {
        toast.error(data.error || "Er ging iets mis.");
      }
    } catch {
      toast.error("Er ging iets mis. Probeer het opnieuw.");
    }
    setLoading(false);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return form.storageType && form.caravanLength && form.startDate;
      case 1: return form.brand;
      case 2: return form.firstName && form.lastName && form.email && form.phone;
      case 3: return true;
      default: return true;
    }
  };

  const selectedType = STORAGE_TYPES.find(t => t.id === form.storageType);
  const hasBundle = BUNDLE_DEAL.includes.every(id => form.extras.includes(id));
  const extrasTotal = hasBundle
    ? BUNDLE_DEAL.bundlePrice + form.extras.filter(id => !BUNDLE_DEAL.includes.includes(id)).reduce((sum, id) => {
        const extra = EXTRAS.find(e => e.id === id);
        return sum + (extra?.price || 0);
      }, 0)
    : form.extras.reduce((sum, id) => {
        const extra = EXTRAS.find(e => e.id === id);
        return sum + (extra?.price || 0);
      }, 0);

  return (
    <>
      <Header />
      
      {/* Hero */}
      <section className="bg-primary-dark pt-28 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-accent-light text-xs font-bold tracking-[0.2em] uppercase mb-3">Online reserveren</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Reserveer uw stallingsplek</h1>
            <p className="text-white/40 text-sm max-w-lg mx-auto mb-6">In enkele stappen uw caravan veilig gestald aan de Costa Brava.</p>
            <div className="flex items-center justify-center gap-4 text-xs text-white/30">
              <span className="flex items-center gap-1.5"><Shield size={12} className="text-white/40" /> Gratis annuleren</span>
              <span className="flex items-center gap-1.5"><Lock size={12} className="text-white/40" /> Veilig betalen via Stripe</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={12} className="text-white/40" /> Direct bevestiging</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-surface border-b border-black/[0.04] py-8">
        <div className="max-w-3xl mx-auto px-4">
          <StepIndicator steps={STEPS} current={step} />
        </div>
      </section>

      {/* Form Content */}
      <section className="py-12 sm:py-16 bg-surface min-h-[60vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>

              {/* ═══ STEP 0: Storage Type ═══ */}
              {step === 0 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-black mb-1">Kies uw stallingtype</h2>
                    <p className="text-sm text-muted">Alle prijzen inclusief beveiliging, verzekering en tweewekelijkse controle.</p>
                  </div>

                  {/* Urgency bar */}
                  <div className={`${availability && availability.available < 10 ? 'bg-danger/10 border-danger/25' : 'bg-warning/10 border-warning/25'} border rounded-xl px-4 py-3 flex items-center gap-3`}>
                    <div className={`w-2 h-2 ${availability && availability.available < 10 ? 'bg-danger' : 'bg-warning'} rounded-full animate-pulse shrink-0`} />
                    <p className={`text-xs ${availability && availability.available < 10 ? 'text-danger' : 'text-warning'} font-medium`}>
                      {availability
                        ? availability.available < 5
                          ? `Nog slechts ${availability.available} plekken beschikbaar — bijna vol!`
                          : availability.available < 15
                            ? `Nog ${availability.available} van de ${availability.total} plekken beschikbaar — reserveer snel.`
                            : `${availability.available} plekken beschikbaar — reserveer tijdig om uw voorkeursplek te garanderen.`
                        : 'Momenteel hoge vraag \u2014 reserveer tijdig om uw voorkeursplek te garanderen.'}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    {STORAGE_TYPES.map(type => (
                      <button key={type.id} onClick={() => update("storageType", type.id)} className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-200 ${form.storageType === type.id ? "border-accent bg-surface shadow-lg shadow-primary/10 ring-1 ring-primary/10" : "border-transparent bg-surface hover:border-black/[0.08]"}`}>
                        {type.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full">Populair</span>}
                        <type.icon size={24} className={form.storageType === type.id ? "text-accent mb-3" : "text-muted mb-3"} />
                        <h3 className="font-bold text-[15px]">{type.label}</h3>
                        <p className="text-xs text-muted mt-1 mb-3">{type.desc}</p>
                        <div className="mb-4">
                          <span className="text-2xl font-black">€{type.price}</span>
                          <span className="text-muted text-xs">/mnd</span>
                        </div>
                        <ul className="space-y-1.5">
                          {type.features.map(f => (
                            <li key={f} className="flex items-center gap-2 text-xs text-muted">
                              <CheckCircle size={12} className="text-success shrink-0" /> {f}
                            </li>
                          ))}
                        </ul>
                      </button>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 bg-surface rounded-2xl p-6 border border-black/[0.04]">
                    <div>
                      <label className="text-[11px] font-semibold text-muted block mb-2 uppercase tracking-wider">Lengte caravan</label>
                      <div className="relative">
                        <Ruler size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40" />
                        <select value={form.caravanLength} onChange={e => update("caravanLength", e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-surface border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none appearance-none">
                          <option value="">Selecteer...</option>
                          <option value="< 5m">&lt; 5 meter</option>
                          <option value="5-6m">5 - 6 meter</option>
                          <option value="6-7m">6 - 7 meter</option>
                          <option value="7-8m">7 - 8 meter</option>
                          <option value="> 8m">&gt; 8 meter</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted block mb-2 uppercase tracking-wider">Startdatum</label>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40" />
                        <input type="date" value={form.startDate} onChange={e => update("startDate", e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-surface border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted block mb-2 uppercase tracking-wider">Locatie</label>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40" />
                        <select value={form.locationId} onChange={e => update("locationId", e.target.value)} className="w-full pl-10 pr-4 py-3 bg-surface border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none appearance-none">
                          <option value={1}>Sant Climent de Peralta</option>
                          <option value={2}>Pals</option>
                          <option value={3}>Blanes</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {availability && (
                    <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle size={20} className="text-accent shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-accent-dark">{availability.available} plekken beschikbaar</p>
                        <p className="text-xs text-accent">van {availability.total} totaal op deze locatie</p>
                      </div>
                    </div>
                  )}

                  {/* Trust signals */}
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3 text-xs text-muted">
                    <span className="flex items-center gap-1.5"><Shield size={12} className="text-success" /> Securitas Direct beveiligd</span>
                    <span className="flex items-center gap-1.5"><Star size={12} className="text-primary" /> 4.9/5 Google reviews</span>
                    <span className="flex items-center gap-1.5"><CheckCircle size={12} className="text-ocean" /> 2000+ caravans gestald</span>
                  </div>
                </div>
              )}

              {/* ═══ STEP 1: Caravan Details ═══ */}
              {step === 1 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-black mb-1">Uw caravan</h2>
                    <p className="text-sm text-muted">Vul de gegevens van uw caravan in.</p>
                  </div>

                  <div className="bg-surface rounded-2xl p-6 border border-black/[0.04] space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-muted block mb-2 uppercase tracking-wider">Merk *</label>
                        <input value={form.brand} onChange={e => update("brand", e.target.value)} placeholder="bijv. Hobby, Fendt, Knaus..." className="w-full px-4 py-3 bg-surface border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted block mb-2 uppercase tracking-wider">Model</label>
                        <input value={form.model} onChange={e => update("model", e.target.value)} placeholder="bijv. De Luxe 490 KMF" className="w-full px-4 py-3 bg-surface border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-muted block mb-2 uppercase tracking-wider">Kenteken</label>
                        <input value={form.licensePlate} onChange={e => update("licensePlate", e.target.value)} placeholder="XX-YYY-Z" className="w-full px-4 py-3 bg-surface border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted block mb-2 uppercase tracking-wider">Bouwjaar</label>
                        <input type="number" value={form.year} onChange={e => update("year", e.target.value)} placeholder="2020" className="w-full px-4 py-3 bg-surface border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted block mb-2 uppercase tracking-wider">Gewicht (kg)</label>
                        <input type="number" value={form.weight} onChange={e => update("weight", e.target.value)} placeholder="1500" className="w-full px-4 py-3 bg-surface border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                      </div>
                    </div>
                    <label className="flex items-center gap-3 p-3 bg-surface rounded-xl cursor-pointer">
                      <input type="checkbox" checked={form.hasMover} onChange={e => update("hasMover", e.target.checked)} className="w-4 h-4 rounded accent-accent" />
                      <span className="text-sm font-medium">Caravan heeft een mover</span>
                    </label>
                  </div>
                </div>
              )}

              {/* ═══ STEP 2: Personal Details ═══ */}
              {step === 2 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-black mb-1">Uw gegevens</h2>
                    <p className="text-sm text-muted">Vul uw contactgegevens in voor de reservering.</p>
                  </div>

                  <div className="bg-surface rounded-2xl p-6 border border-black/[0.04] space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-muted block mb-2 uppercase tracking-wider">Voornaam *</label>
                        <input value={form.firstName} onChange={e => update("firstName", e.target.value)} className="w-full px-4 py-3 bg-surface border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted block mb-2 uppercase tracking-wider">Achternaam *</label>
                        <input value={form.lastName} onChange={e => update("lastName", e.target.value)} className="w-full px-4 py-3 bg-surface border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-muted block mb-2 uppercase tracking-wider">E-mailadres *</label>
                        <input type="email" value={form.email} onChange={e => update("email", e.target.value)} className="w-full px-4 py-3 bg-surface border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted block mb-2 uppercase tracking-wider">Telefoonnummer *</label>
                        <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+31 6 ..." className="w-full px-4 py-3 bg-surface border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-ocean/10 border border-ocean/30 rounded-xl p-4 flex items-start gap-3">
                    <Lock size={16} className="text-ocean mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-ocean-dark">Veilige gegevensverwerking</p>
                      <p className="text-xs text-ocean mt-0.5">Uw gegevens worden versleuteld opgeslagen en alleen gebruikt voor uw stallingovereenkomst.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ STEP 3: Extras ═══ */}
              {step === 3 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-black mb-1">Extra services</h2>
                    <p className="text-sm text-muted">Optioneel: voeg extra services toe aan uw boeking.</p>
                  </div>

                  {/* Bundle Deal */}
                  {(() => {
                    const hasBundle = BUNDLE_DEAL.includes.every(id => form.extras.includes(id));
                    return (
                      <button onClick={toggleBundle} className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 relative upsell-highlight ${hasBundle ? "border-primary bg-primary/[0.04] shadow-lg shadow-primary/10 ring-1 ring-primary/10" : "border-primary/30 bg-gradient-to-r from-primary/[0.03] to-surface hover:border-primary/50"}`}>
                        <div className="absolute -top-3 left-4">
                          <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">Bespaar \u20AC{BUNDLE_DEAL.savings}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                            <Star size={22} className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm flex items-center gap-2">{BUNDLE_DEAL.label} <span className="text-[10px] font-semibold bg-accent/10 text-accent px-2 py-0.5 rounded-full">Meest gekozen</span></h4>
                            <p className="text-xs text-muted mt-0.5">Premium schoonmaak + klaarzet-service + technische keuring</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-xs text-muted line-through">\u20AC{BUNDLE_DEAL.normalPrice}</span>
                            <span className="text-lg font-black text-primary block">\u20AC{BUNDLE_DEAL.bundlePrice}</span>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${hasBundle ? "bg-primary border-primary" : "border-zinc-300"}`}>
                            {hasBundle && <CheckCircle size={14} className="text-white" />}
                          </div>
                        </div>
                      </button>
                    );
                  })()}

                  <div className="relative">
                    <div className="absolute inset-x-0 top-1/2 border-t border-sand-dark/20" />
                    <p className="relative text-center text-xs text-muted bg-surface px-3 mx-auto w-fit">of kies individuele services</p>
                  </div>

                  <div className="space-y-3">
                    {EXTRAS.map(extra => (
                      <button
                        key={extra.id}
                        onClick={() => !extra.onRequest && toggleExtra(extra.id)}
                        disabled={extra.onRequest}
                        className={`w-full text-left flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 ${
                          form.extras.includes(extra.id) ? "border-accent bg-accent/[0.03] shadow-sm" : "border-transparent bg-surface hover:border-black/[0.06]"
                        } ${extra.onRequest ? "opacity-60 cursor-default" : ""}`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${form.extras.includes(extra.id) ? "bg-accent/10 text-accent" : "bg-surface text-muted"}`}>
                          <extra.icon size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm flex items-center gap-2">
                            {extra.label}
                            {extra.popular && <span className="text-[10px] font-semibold bg-warning/10 text-warning px-2 py-0.5 rounded-full">Populair</span>}
                          </h4>
                          <p className="text-xs text-muted mt-0.5">{extra.desc}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          {extra.onRequest ? (
                            <span className="text-xs font-semibold text-muted">Op aanvraag</span>
                          ) : (
                            <span className="text-lg font-black">\u20AC{extra.price}</span>
                          )}
                        </div>
                        {!extra.onRequest && (
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${form.extras.includes(extra.id) ? "bg-accent border-accent" : "border-zinc-300"}`}>
                            {form.extras.includes(extra.id) && <CheckCircle size={14} className="text-white" />}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Trust signal */}
                  <div className="flex items-center justify-center gap-4 py-3 text-xs text-muted">
                    <span className="flex items-center gap-1.5"><Shield size={12} className="text-success" /> Geen verborgen kosten</span>
                    <span className="flex items-center gap-1.5"><Star size={12} className="text-primary" /> 4.9/5 beoordeling</span>
                    <span className="flex items-center gap-1.5"><Lock size={12} className="text-ocean" /> Veilig betalen</span>
                  </div>

                  {/* Summary */}
                  <div className="bg-surface rounded-2xl p-6 border border-black/[0.04]">
                    <h3 className="font-bold text-sm mb-4">Overzicht kosten</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">{selectedType?.label}</span>
                        <span className="font-semibold">\u20AC{selectedType?.price}/mnd</span>
                      </div>
                      {hasBundle ? (
                        <div className="flex justify-between text-sm">
                          <span className="text-primary font-medium flex items-center gap-1.5"><Star size={12} /> {BUNDLE_DEAL.label}</span>
                          <span className="font-semibold"><span className="line-through text-muted text-xs mr-1">\u20AC{BUNDLE_DEAL.normalPrice}</span>\u20AC{BUNDLE_DEAL.bundlePrice} eenmalig</span>
                        </div>
                      ) : (
                        form.extras.map(id => {
                          const extra = EXTRAS.find(e => e.id === id);
                          return extra ? (
                            <div key={id} className="flex justify-between text-sm">
                              <span className="text-muted">{extra.label}</span>
                              <span className="font-semibold">\u20AC{extra.price} eenmalig</span>
                            </div>
                          ) : null;
                        })
                      )}
                      {hasBundle && form.extras.filter(id => !BUNDLE_DEAL.includes.includes(id)).map(id => {
                        const extra = EXTRAS.find(e => e.id === id);
                        return extra ? (
                          <div key={id} className="flex justify-between text-sm">
                            <span className="text-muted">{extra.label}</span>
                            <span className="font-semibold">\u20AC{extra.price} eenmalig</span>
                          </div>
                        ) : null;
                      })}
                      <div className="border-t border-black/[0.06] pt-3 mt-3 flex justify-between">
                        <span className="font-bold">Maandelijks</span>
                        <span className="font-black text-xl text-accent">€{selectedType?.price}/mnd</span>
                      </div>
                      {extrasTotal > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">+ eenmalige kosten</span>
                          <span className="font-semibold">€{extrasTotal}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ STEP 4: Confirmation ═══ */}
              {step === 4 && result && (
                <div className="text-center py-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                    <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={40} className="text-success" />
                    </div>
                  </motion.div>
                  <h2 className="text-2xl font-black mb-2">Boeking succesvol!</h2>
                  <p className="text-muted mb-8 max-w-md mx-auto">Uw stallingsplek is gereserveerd. U ontvangt een bevestiging per e-mail.</p>

                  <div className="bg-surface rounded-2xl p-6 border border-black/[0.04] max-w-md mx-auto text-left space-y-3 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Contractnummer</span>
                      <span className="font-bold font-mono">{result.contractNumber}</span>
                    </div>
                    {result.spotLabel && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Pleknummer</span>
                        <span className="font-bold">{result.spotLabel}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Stallingtype</span>
                      <span className="font-bold">{selectedType?.label}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Maandtarief</span>
                      <span className="font-black text-accent">€{selectedType?.price}/mnd</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a href="/mijn-account" className="bg-primary-dark hover:bg-primary text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all inline-flex items-center gap-2">
                      Naar mijn account <ArrowRight size={15} />
                    </a>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 mt-8">
                    {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" className="text-accent" />)}
                    <span className="text-muted text-xs ml-1">4.9/5 — Beoordeeld door 25+ klanten</span>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          {step < 4 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-black/[0.06]">
              <button
                onClick={() => setStep(s => Math.max(0, s - 1))}
                disabled={step === 0}
                className="flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary-dark transition-colors disabled:opacity-30"
              >
                <ArrowLeft size={15} /> Vorige
              </button>
              
              <button
                onClick={() => {
                  if (step === 0) checkAvailability();
                  else if (step === 3) submitBooking();
                  else setStep(s => s + 1);
                }}
                disabled={!canProceed() || loading}
                className="bg-accent hover:bg-accent-dark text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all inline-flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : null}
                {step === 0 ? "Beschikbaarheid checken" : step === 3 ? "Bevestigen & betalen" : "Volgende"}
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" /></div>}>
      <BookingPageInner />
    </Suspense>
  );
}
