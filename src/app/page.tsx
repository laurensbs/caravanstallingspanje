"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { Shield, Wrench, Truck, Eye, MapPin, Star, CheckCircle, ArrowRight, Phone, Users, ChevronRight, Sparkles, Calendar, Ruler, Building, Camera, Bike, ShoppingBag, ThermometerSun } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import A from "@/components/AnimateIn";
import ReviewsWidget from "@/components/ReviewsWidget";
import BrandSlider from "@/components/BrandSlider";
import QuizModal from "@/components/QuizModal";
import { useT } from "@/lib/i18n";
import { BLOG_POSTS } from "@/lib/blog-data";

const BLOG_PREVIEW = BLOG_POSTS.slice(0, 3);


export default function HomePage() {
  const t = useT();
  const [booking, setBooking] = useState({ type: "buiten", length: "", start: "", location: "sant-climent" });
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [availSpots, setAvailSpots] = useState<number | null>(null);

  const reviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Caravanstalling Spanje',
    review: [
      { '@type': 'Review', author: { '@type': 'Person', name: 'Jan de Vries' }, reviewRating: { '@type': 'Rating', ratingValue: 5, bestRating: 5 }, reviewBody: 'Al 3 jaar klant. Caravan staat er altijd perfect bij.' },
      { '@type': 'Review', author: { '@type': 'Person', name: 'Maria Bakker' }, reviewRating: { '@type': 'Rating', ratingValue: 5, bestRating: 5 }, reviewBody: 'Eindelijk een stalling waar je op kunt vertrouwen.' },
      { '@type': 'Review', author: { '@type': 'Person', name: 'Peter Jansen' }, reviewRating: { '@type': 'Rating', ratingValue: 5, bestRating: 5 }, reviewBody: 'Transport en winterklaar-service in één keer geregeld.' },
      { '@type': 'Review', author: { '@type': 'Person', name: 'Willem Smit' }, reviewRating: { '@type': 'Rating', ratingValue: 5, bestRating: 5 }, reviewBody: 'Na jaren in NL stallen overgestapt. Scheelt flink in kosten.' },
    ],
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckingAvail(true);
    try {
      const locMap: Record<string, number> = { 'sant-climent': 1, 'pals': 2, 'blanes': 3 };
      const res = await fetch("/api/booking/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storageType: booking.type, caravanLength: booking.length, startDate: booking.start, locationId: locMap[booking.location] || 1 }),
      });
      const data = await res.json();
      setAvailSpots(data.available ?? 0);
      // Redirect to booking wizard with preselected values
      setTimeout(() => {
        window.location.href = `/reserveren?type=${booking.type}&length=${encodeURIComponent(booking.length)}&start=${booking.start}&location=${locMap[booking.location] || 1}`;
      }, 1500);
    } catch {
      window.location.href = `/reserveren?type=${booking.type}`;
    }
    setCheckingAvail(false);
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
      <Header />

      {/* ═══ HERO ═══ */}
      <section id="main-content" className="relative min-h-[92vh] flex items-center bg-hero overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://u.cubeupload.com/laurensbos/caravanstoragespain.jpg" alt="Caravanstalling terrein" fill sizes="100vw" className="object-cover opacity-25" priority />
          <div className="hero-overlay absolute inset-0" />
        </div>
        <div className="absolute inset-0 dot-pattern opacity-30" />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Text */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/10 text-white/70 px-4 py-1.5 rounded-full text-xs font-medium mb-6">
                <MapPin size={12} className="text-primary" /> Costa Brava, Spanje
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] text-white mb-6">
                Meer dan alleen{" "}
                <span className="gradient-text">caravanstalling</span>
              </h1>
              <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10">
                Stalling, onderhoud, reparatie, transport en verkoop. Al meer dan 20 jaar dé specialist aan de Costa Brava. Nederlandstalig personeel.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto lg:mx-0">
                {[
                  { v: "2000+", l: "Caravans" },
                  { v: "20+", l: "Jaar ervaring" },
                  { v: "4.9★", l: "Google" },
                  { v: "12", l: "Medewerkers" },
                ].map(s => (
                  <div key={s.l} className="text-center">
                    <div className="text-xl sm:text-2xl font-black text-white">{s.v}</div>
                    <div className="text-[10px] text-white/70 mt-0.5 font-medium">{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Trust */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-10 pt-8 border-t border-white/[0.06] justify-center lg:justify-start">
                {[
                  { icon: Shield, text: "Securitas Direct" },
                  { icon: Camera, text: "24/7 camera's" },
                  { icon: CheckCircle, text: "Standaard verzekerd" },
                ].map(b => (
                  <div key={b.text} className="flex items-center gap-2">
                    <b.icon size={14} className="text-primary-light/70" />
                    <span className="text-white/60 text-xs">{b.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Booking */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <div className="booking-widget rounded-2xl p-6 sm:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-bold text-surface-dark">Direct stalling aanvragen</h2>
                  <p className="text-warm-gray text-xs mt-1">Costa Brava, Spanje</p>
                </div>

                {availSpots !== null ? (
                  <div className="text-center py-8">
                    <CheckCircle size={40} className="text-success mx-auto mb-3" />
                    <p className="font-bold text-surface-dark">{availSpots} plekken beschikbaar!</p>
                    <p className="text-sm text-warm-gray mt-1">U wordt doorgestuurd naar de reserveringspagina...</p>
                    <div className="mt-4 w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : (
                  <form onSubmit={handleBooking} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-semibold text-warm-gray block mb-2 uppercase tracking-wider">Type stalling</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { val: "buiten", label: "Buitenstalling", price: "€65/mnd" },
                          { val: "binnen", label: "Binnenstalling", price: "€95/mnd" },
                        ].map(o => (
                          <button key={o.val} type="button" onClick={() => setBooking({ ...booking, type: o.val })} className={`p-3 rounded-xl text-center transition-all text-xs border ${booking.type === o.val ? "bg-primary/[0.07] border-primary text-primary font-bold ring-1 ring-primary/20" : "bg-sand/50 border-sand-dark/30 text-warm-gray hover:border-primary/20"}`}>
                            <div className="font-semibold text-[12px]">{o.label}</div>
                            <div className={`text-[10px] mt-0.5 ${booking.type === o.val ? "text-primary/60" : "text-warm-gray/60"}`}>{o.price}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-warm-gray block mb-2 uppercase tracking-wider">Lengte caravan</label>
                        <div className="relative">
                          <Ruler size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray/40" />
                          <select value={booking.length} onChange={e => setBooking({ ...booking, length: e.target.value })} required className="w-full pl-9 pr-3 py-3 bg-sand/40 border border-sand-dark/40 rounded-xl text-sm text-surface-dark focus:ring-2 focus:ring-primary/15 focus:border-primary/30 outline-none transition-all appearance-none">
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
                        <label className="text-[11px] font-semibold text-warm-gray block mb-2 uppercase tracking-wider">Startdatum</label>
                        <div className="relative">
                          <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray/40" />
                          <input type="date" required value={booking.start} onChange={e => setBooking({ ...booking, start: e.target.value })} className="w-full pl-9 pr-3 py-3 bg-sand/40 border border-sand-dark/40 rounded-xl text-sm text-surface-dark focus:ring-2 focus:ring-primary/15 focus:border-primary/30 outline-none transition-all" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-warm-gray block mb-2 uppercase tracking-wider">Locatie</label>
                      <div className="relative">
                        <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray/40" />
                        <select value={booking.location} onChange={e => setBooking({ ...booking, location: e.target.value })} className="w-full pl-9 pr-3 py-3 bg-sand/40 border border-sand-dark/40 rounded-xl text-sm text-surface-dark focus:ring-2 focus:ring-primary/15 focus:border-primary/30 outline-none transition-all appearance-none">
                          <option value="sant-climent">Sant Climent de Peralta</option>
                          <option value="pals">Pals</option>
                          <option value="blanes">Blanes</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" disabled={checkingAvail} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-60">
                      {checkingAvail ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Controleren...</> : <>Beschikbaarheid checken <ArrowRight size={15} /></>}
                    </button>
                    <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-warm-gray/60">
                      <span className="flex items-center gap-1"><Shield size={10} /> Gratis annuleren</span>
                      <span className="flex items-center gap-1"><CheckCircle size={10} /> Direct bevestiging</span>
                      <span className="flex items-center gap-1"><Star size={10} /> 4.9/5</span>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ BRAND SLIDER ═══ */}
      <BrandSlider />

      {/* ═══ DIENSTEN BAR ═══ */}
      <section className="bg-card border-b border-sand-dark/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-8 lg:gap-12">
            {[
              { icon: Shield, label: "Stalling", href: "/stalling" },
              { icon: Wrench, label: "Reparatie", href: "/diensten" },
              { icon: Sparkles, label: "CaravanRepair®", href: "/diensten" },
              { icon: Truck, label: "Transport", href: "/diensten" },
              { icon: ShoppingBag, label: "Verkoop", href: "/diensten" },
              { icon: Bike, label: "Verhuur", href: "/diensten" },
            ].map(s => (
              <Link key={s.label} href={s.href} className="flex items-center gap-2 text-warm-gray hover:text-primary transition-colors py-2 px-3 rounded-lg group text-sm font-medium">
                <s.icon size={17} className="group-hover:text-primary transition-colors" />
                <span>{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WAAROM WIJ ═══ */}
      <section className="py-20 sm:py-28 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Waarom Caravanstalling Spanje</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Meer dan alleen stalling</h2>
            <div className="section-divider mt-5 mb-5" />
            <p className="text-warm-gray leading-relaxed">
              Wij ontzorgen u volledig. Van veilige stalling tot professionele reparatie, transport en verkoop. Alles onder één dak, met Nederlandstalig personeel.
            </p>
          </A>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Beveiligde stalling", desc: "Securitas Direct alarm, 24/7 camerabewaking en standaard verzekerd. Buiten- en binnenstalling op ons afgesloten terrein in Sant Climent de Peralta.", color: "bg-ocean/10 text-ocean" },
              { icon: Wrench, title: "Reparatie & onderhoud", desc: "Goed uitgeruste werkplaats voor alle voorkomende reparaties. Banden, remmen, dakluiken, airco, gas, elektra en vochtschade.", color: "bg-warning/10 text-warning" },
              { icon: Sparkles, title: "CaravanRepair® Masterdealer", desc: "Onzichtbaar schadeherstel van geprofileerde wanden met levenslange garantie. Erkend door alle verzekeraars. Hagel, storm en aanrijdingsschade.", color: "bg-primary/10 text-primary" },
              { icon: Truck, title: "Transport (7 eenheden)", desc: "Met ons wagenpark van 7 eenheden en 12 seizoensmedewerkers halen wij uw caravan op en leveren hem af op elke camping aan de Costa Brava.", color: "bg-accent/10 text-accent" },
              { icon: ShoppingBag, title: "Verkoop tweedehands", desc: "Gecontroleerde occasion caravans, al in Spanje. Eerlijk advies, werkplaatskeuring en verkoopbemiddeling. Geen transportkosten.", color: "bg-danger/10 text-danger" },
              { icon: Eye, title: "Tweewekelijkse controle", desc: "Elke 2 weken worden alle caravans gecontroleerd op weerschade. Jaarlijks volledige technische keuring met rapport via uw klantportaal.", color: "bg-info/10 text-info" },
            ].map((f, i) => (
              <A key={f.title} delay={i * 0.08}>
                <div className="bg-card rounded-2xl p-7 border border-sand-dark/30 hover:border-primary/20 card-hover h-full group">
                  <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300`}>
                    <f.icon size={21} />
                  </div>
                  <h3 className="font-bold text-[17px] mb-2">{f.title}</h3>
                  <p className="text-sm text-warm-gray leading-relaxed">{f.desc}</p>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ IMAGE BREAK ═══ */}
      <section className="relative h-[320px] sm:h-[420px] overflow-hidden">
        <Image src="https://u.cubeupload.com/laurensbos/caravanstoragespain4.jpg" alt="Costa Brava terrein" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/80 via-surface-dark/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 max-w-7xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14 text-center">
          <p className="text-white/70 text-sm font-medium mb-2">Sant Climent de Peralta, Girona</p>
          <h3 className="text-white text-2xl sm:text-3xl font-black">3 beveiligde locaties aan de Costa Brava</h3>
        </div>
      </section>

      {/* ═══ STALLING TYPES ═══ */}
      <section className="py-20 sm:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Stallingstypen</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Kies uw stallingtype</h2>
            <div className="section-divider mt-5 mb-5" />
            <p className="text-warm-gray leading-relaxed">Transparante maandtarieven inclusief beveiliging, verzekering en tweewekelijkse controle.</p>
          </A>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              { title: "Buitenstalling", price: "65", desc: "Beveiligd buitenterrein met 24/7 bewaking", features: ["Securitas Direct alarm", "24/7 camerabewaking", "Standaard verzekerd", "Tweewekelijkse controle", "Jaarlijkse keuring"], popular: false },
              { title: "Binnenstalling", price: "95", desc: "Overdekte hal met klimaatbescherming", features: ["Geïsoleerde hal", "Geen hitte of kou", "Alle voordelen buiten", "Premium locatie", "Beperkt beschikbaar"], popular: true },
            ].map((p, i) => (
              <A key={p.title} delay={i * 0.1}>
                <div className={`relative bg-card rounded-2xl p-7 h-full flex flex-col text-center ${p.popular ? 'border-2 border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/10' : 'border border-sand-dark/30'}`}>
                  {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-full shadow-sm">Meest gekozen</span>}
                  <h3 className="text-lg font-bold mt-1">{p.title}</h3>
                  <p className="text-xs text-warm-gray mt-1 mb-5">{p.desc}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-black">€{p.price}</span>
                    <span className="text-warm-gray text-sm">/mnd</span>
                  </div>
                  <ul className="space-y-2.5 mb-8 flex-1 text-left">
                    {p.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm"><CheckCircle size={14} className="text-success shrink-0" /> {f}</li>
                    ))}
                  </ul>
                  <Link href="/reserveren" className={`block py-3 rounded-xl text-sm font-bold transition-all duration-200 ${p.popular ? 'bg-primary hover:bg-primary-dark text-white shadow-sm' : 'bg-hero hover:bg-hero/90 text-white'}`}>
                    Direct reserveren
                  </Link>
                </div>
              </A>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10 text-xs text-warm-gray">
            <span className="flex items-center gap-1.5"><Shield size={13} className="text-success" /> Securitas Direct beveiligd</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={13} className="text-ocean" /> Standaard verzekerd</span>
            <span className="flex items-center gap-1.5"><Eye size={13} className="text-primary" /> Tweewekelijkse controle</span>
            <span className="flex items-center gap-1.5"><Star size={13} className="text-warning" /> 4.9/5 Google reviews</span>
          </div>
        </div>
      </section>

      {/* ═══ HOE HET WERKT ═══ */}
      <section className="py-20 sm:py-28 bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">In 4 stappen</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Hoe werkt het?</h2>
            <div className="section-divider mt-5 mb-5" />
          </A>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: Phone, title: "Vertel uw wensen", desc: "Beantwoord een paar vragen en ontvang een voorstel op maat." },
              { step: "02", icon: MapPin, title: "Plek reserveren", desc: "Wij wijzen een vaste plek toe op uw gewenste locatie." },
              { step: "03", icon: Truck, title: "Caravan brengen", desc: "Breng uw caravan of wij halen hem op met ons transport." },
              { step: "04", icon: Shield, title: "Wij zorgen ervoor", desc: "Bewaking, controles, onderhoud – wij regelen alles." },
            ].map((s, i) => (
              <A key={s.step} delay={i * 0.1}>
                <div className="text-center">
                  <div className="relative inline-flex mb-5">
                    <div className="w-16 h-16 bg-sand rounded-2xl flex items-center justify-center">
                      <s.icon size={24} className="text-primary" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-primary text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-sm">{s.step}</span>
                  </div>
                  <h3 className="font-bold text-[15px] mb-2">{s.title}</h3>
                  <p className="text-sm text-warm-gray leading-relaxed">{s.desc}</p>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CARAVANREPAIR BANNER ═══ */}
      <section className="bg-hero relative overflow-hidden">
        <div className="absolute inset-0 line-pattern" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16 relative">
          <A>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-5">
                <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center shrink-0 animate-pulse-glow">
                  <Sparkles className="text-primary-light" size={24} />
                </div>
                <div>
                  <h3 className="text-white text-xl sm:text-2xl font-black mb-1">CaravanRepair® Masterdealer</h3>
                  <p className="text-white/60 max-w-lg text-sm">Onzichtbaar schadeherstel van geprofileerde wanden. Alle verzekeraars erkend. Levenslange garantie.</p>
                </div>
              </div>
              <Link href="/diensten" className="shrink-0 bg-primary hover:bg-primary-light text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all duration-200 inline-flex items-center gap-2 shadow-sm">
                Meer informatie <ChevronRight size={15} />
              </Link>
            </div>
          </A>
        </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <ReviewsWidget limit={4} />

      {/* ═══ KLANTPORTAAL ═══ */}
      <section className="py-20 sm:py-28 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="text-center lg:text-left">
                <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Klantportaal</p>
                <h2 className="text-3xl sm:text-4xl font-black mb-6">Alles online inzien</h2>
                <div className="section-divider mt-0 mb-6 mx-auto lg:mx-0" />
                <p className="text-warm-gray mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">Beheer uw stalling online. Bekijk contracten, facturen, inspecties en dien service aanvragen in via uw persoonlijke dashboard.</p>
                <ul className="space-y-3 mb-8 text-left max-w-md mx-auto lg:mx-0">
                  {["Uw caravans en pleknummers bekijken", "Contracten en verlengingen inzien", "Facturen downloaden en betaalstatus", "Service aanvragen (reparatie, transport)", "Inspectierapportages ontvangen"].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm"><CheckCircle size={15} className="text-success shrink-0" /><span>{f}</span></li>
                  ))}
                </ul>
                <Link href="/mijn-account" className="inline-flex items-center gap-2 bg-hero hover:bg-hero/90 text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all duration-200">
                  <Users size={15} /> Naar mijn account
                </Link>
              </div>
              <div className="bg-sand rounded-2xl p-6 sm:p-8 border border-sand-dark/30">
                <div className="space-y-3.5">
                  {[
                    { label: "Mijn Caravans", value: "Hobby De Luxe 490 KMF", sub: "Plek A-042 · Buitenstalling" },
                    { label: "Contract", value: "CS-000142", sub: "Actief · Automatische verlenging" },
                    { label: "Volgende factuur", value: "€65,00", sub: "Vervaldatum: 01-04-2026" },
                    { label: "Laatste inspectie", value: "Goedgekeurd", sub: "02-03-2026 · Geen bijzonderheden" },
                  ].map(item => (
                    <div key={item.label} className="bg-card rounded-xl p-4 border border-sand-dark/20">
                      <p className="text-[11px] text-warm-gray font-medium uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-bold text-surface-dark mt-1">{item.value}</p>
                      <p className="text-xs text-warm-gray mt-0.5">{item.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </A>
        </div>
      </section>

      {/* ═══ BLOG PREVIEW ═══ */}
      <section className="py-20 sm:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Blog & Tips</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Kennis & reisgidsen</h2>
            <div className="section-divider mt-5 mb-5" />
            <p className="text-warm-gray leading-relaxed">Praktische tips van onze monteurs, reisgidsen voor de Costa Brava en alles over caravanonderhoud.</p>
          </A>
          <div className="grid sm:grid-cols-3 gap-6">
            {BLOG_PREVIEW.map((post, i) => (
              <A key={post.slug} delay={i * 0.08}>
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <div className="bg-card rounded-2xl overflow-hidden border border-sand-dark/20 h-full flex flex-col card-hover">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image src={post.image} alt={post.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/90 text-primary">{post.category}</span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-bold text-[15px] leading-snug mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                      <p className="text-sm text-warm-gray leading-relaxed flex-1 mb-4">{post.excerpt}</p>
                      <span className="inline-flex items-center gap-1.5 text-primary font-semibold text-xs group-hover:gap-2.5 transition-all">
                        Lees meer <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              </A>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors">
              Alle artikelen bekijken <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="bg-hero relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center relative">
          <A>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Klaar om uw caravan veilig te stallen?</h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">Vertel ons uw wensen en ontvang binnen 1 werkdag een persoonlijk voorstel — geheel vrijblijvend.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => setQuizOpen(true)} className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all duration-200 inline-flex items-center gap-2 shadow-sm cursor-pointer">
                Ontvang een voorstel <ArrowRight size={15} />
              </button>
              <a href="tel:+34650036755" className="text-white/60 hover:text-white font-medium px-6 py-3.5 rounded-xl text-sm transition-colors inline-flex items-center gap-2 border border-white/10 hover:border-white/20">
                <Phone size={15} /> +34 650 036 755
              </a>
            </div>
          </A>
        </div>
      </section>

      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} source="homepage" />
      <Footer />
    </>
  );
}
