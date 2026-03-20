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
import { useCountUp } from "@/lib/useCountUp";

const BLOG_PREVIEW = BLOG_POSTS.slice(0, 3);


export default function HomePage() {
  const t = useT();
  const [booking, setBooking] = useState({ type: "buiten", length: "", start: "", location: "sant-climent" });
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizInterest, setQuizInterest] = useState<string | undefined>(undefined);
  const [availSpots, setAvailSpots] = useState<number | null>(null);

  // Count-up stats for Social Proof Strip
  const stat1 = useCountUp(2000, 2000);
  const stat2 = useCountUp(20, 1600);
  const stat3 = useCountUp(3, 1200);

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
      <section id="main-content" className="relative min-h-[80vh] sm:min-h-[92vh] flex items-center bg-hero overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://u.cubeupload.com/laurensbos/caravanstoragespain.jpg" alt="Caravanstalling terrein" fill sizes="100vw" className="object-cover opacity-30" priority />
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
                    <div className="text-xs text-white/70 mt-0.5 font-medium">{s.l}</div>
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
                      <label className="text-xs font-semibold text-warm-gray block mb-2 uppercase tracking-wider">Type stalling</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { val: "buiten", label: "Buitenstalling", price: "€65/mnd" },
                          { val: "binnen", label: "Binnenstalling", price: "€95/mnd" },
                        ].map(o => (
                          <button key={o.val} type="button" onClick={() => setBooking({ ...booking, type: o.val })} className={`p-3 rounded-xl text-center transition-all text-xs border ${booking.type === o.val ? "bg-primary/[0.07] border-primary text-primary font-bold ring-1 ring-primary/20" : "bg-sand/50 border-sand-dark/30 text-warm-gray hover:border-primary/20"}`}>
                            <div className="font-semibold text-sm">{o.label}</div>
                            <div className={`text-xs mt-0.5 ${booking.type === o.val ? "text-primary/60" : "text-warm-gray/60"}`}>{o.price}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-warm-gray block mb-2 uppercase tracking-wider">Lengte caravan</label>
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
                        <label className="text-xs font-semibold text-warm-gray block mb-2 uppercase tracking-wider">Startdatum</label>
                        <div className="relative">
                          <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray/40" />
                          <input type="date" required value={booking.start} onChange={e => setBooking({ ...booking, start: e.target.value })} className="w-full pl-9 pr-3 py-3 bg-sand/40 border border-sand-dark/40 rounded-xl text-sm text-surface-dark focus:ring-2 focus:ring-primary/15 focus:border-primary/30 outline-none transition-all" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-warm-gray block mb-2 uppercase tracking-wider">Locatie</label>
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
                      {checkingAvail ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Controleren...</> : <>Direct plek reserveren <ArrowRight size={15} /></>}
                    </button>
                    <div className="flex items-center justify-center gap-3 mt-3 text-xs text-warm-gray/60">
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

      {/* ═══ DIENSTEN TILES — App-style grid ═══ */}
      <section className="py-10 sm:py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black">Wat kunnen wij voor u doen?</h2>
            <p className="text-warm-gray text-sm mt-2">Tik op een dienst om direct aan te vragen</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {[
              { icon: Shield, label: "Stalling", desc: "Vanaf €65/mnd", interest: "stalling", img: "https://u.cubeupload.com/laurensbos/caravanstoragespain2.jpg" },
              { icon: Wrench, label: "Reparatie & CaravanRepair®", desc: "Alle merken · Schadeherstel", interest: "reparatie", img: "https://u.cubeupload.com/laurensbos/caravanstoragespain5.jpg" },
              { icon: Truck, label: "Transport", desc: "Door heel Europa", interest: "transport", img: "https://u.cubeupload.com/laurensbos/caravanstoragespain4.jpg" },
              { icon: ShoppingBag, label: "Verkoop", desc: "Occasions", interest: "verkoop", img: "https://u.cubeupload.com/laurensbos/caravanstoragespain6.jpg" },
              { icon: Bike, label: "Verhuur", desc: "Fietsen & meer", interest: "anders", img: "https://u.cubeupload.com/laurensbos/caravanstoragespain.jpg" },
            ].map((s, i) => (
              <A key={s.label} delay={i * 0.05}>
                <button
                  onClick={() => { setQuizInterest(s.interest); setQuizOpen(true); }}
                  className="group block relative rounded-2xl overflow-hidden aspect-[3/4] sm:aspect-[3/4] touch-manipulation w-full cursor-pointer"
                >
                  <Image src={s.img} alt={s.label} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-hero/90 via-hero/50 to-hero/20 group-hover:from-hero/95 group-hover:via-hero/60 transition-all duration-300" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 border border-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/30 group-hover:border-primary/30 transition-all duration-300">
                      <s.icon size={24} />
                    </div>
                    <span className="font-black text-sm sm:text-base text-center leading-tight">{s.label}</span>
                    <span className="text-white/60 text-xs mt-0.5">{s.desc}</span>
                  </div>
                  <div className="absolute bottom-2 inset-x-2">
                    <div className="bg-primary/80 backdrop-blur-sm rounded-lg py-1.5 text-white text-xs font-bold text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      Direct aanvragen →
                    </div>
                  </div>
                </button>
              </A>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/diensten" className="text-sm text-primary font-semibold hover:text-primary-dark transition-colors inline-flex items-center gap-1">
              Bekijk alle diensten in detail <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>



      {/* ═══ IMAGE BREAK ═══ */}
      <section className="relative h-[280px] sm:h-[420px] overflow-hidden">
        <Image src="https://u.cubeupload.com/laurensbos/caravanstoragespain3.jpg" alt="Caravanstalling terrein in Spanje" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-hero via-hero/40 to-hero/10" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 w-full">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-primary-light/80 text-xs font-bold tracking-[0.2em] uppercase mb-2">Sant Climent de Peralta, Girona</p>
                <h3 className="text-white text-xl sm:text-3xl font-black leading-tight">3 beveiligde locaties<br className="sm:hidden" /> aan de Costa Brava</h3>
              </div>
              <Link href="/locaties" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold px-5 py-2.5 rounded-xl backdrop-blur-sm transition-all">
                Bekijk locaties <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF STRIP ═══ */}
      <section className="section-immersive">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {[
              { ref: stat1.ref, value: `${stat1.value}+`, label: "Caravans gestald" },
              { ref: stat2.ref, value: `${stat2.value}+`, label: "Jaar ervaring" },
              { ref: null, value: "4.9★", label: "Google Reviews" },
              { ref: stat3.ref, value: `${stat3.value}`, label: "Locaties Costa Brava" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                ref={s.ref}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-5xl font-black text-white mb-1 font-heading tracking-tight">{s.value}</div>
                <div className="text-white/50 text-xs sm:text-sm font-medium">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOE HET WERKT ═══ */}
      <section className="py-14 sm:py-24 bg-card relative overflow-hidden">
        <div className="absolute inset-0 line-pattern opacity-20 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">In 4 stappen</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black mb-3">Hoe werkt het?</h2>
            <div className="divider-animated mt-3 mb-3" />
          </A>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-14 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-primary/10 via-primary/25 to-primary/10" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {[
                { step: "1", icon: Phone, title: "Vertel uw wensen", desc: "Beantwoord een paar vragen en ontvang een voorstel." },
                { step: "2", icon: MapPin, title: "Plek reserveren", desc: "Wij wijzen een vaste plek toe op uw locatie." },
                { step: "3", icon: Truck, title: "Caravan brengen", desc: "Breng hem of wij halen hem op met transport." },
                { step: "4", icon: Shield, title: "Wij zorgen ervoor", desc: "Bewaking, controles en onderhoud — wij regelen alles." },
              ].map((s, i) => (
                <A key={s.step} delay={i * 0.1}>
                  <div className="card-premium p-5 sm:p-6 text-center h-full">
                    <div className="relative inline-flex mb-4 sm:mb-5">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/8 rounded-2xl flex items-center justify-center">
                        <s.icon size={22} className="text-primary" />
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-primary text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg shadow-primary/30">{s.step}</span>
                    </div>
                    <h3 className="font-bold text-[14px] sm:text-[15px] mb-1.5">{s.title}</h3>
                    <p className="text-sm text-warm-gray leading-relaxed">{s.desc}</p>
                  </div>
                </A>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VISUAL SHOWCASE ═══ */}
      <section className="py-12 sm:py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">Ons terrein</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black mb-3">Neem een kijkje op ons terrein</h2>
            <div className="divider-animated mt-3 mb-3" />
          </A>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 max-w-5xl mx-auto">
            {[
              { src: "https://u.cubeupload.com/laurensbos/caravanstoragespain2.jpg", label: "Beveiligd buitenterrein", sub: "24/7 Securitas Direct" },
              { src: "https://u.cubeupload.com/laurensbos/caravanstoragespain5.jpg", label: "CaravanRepair® werkplaats", sub: "Alle merken & schadeherstel" },
              { src: "https://u.cubeupload.com/laurensbos/caravanstoragespain4.jpg", label: "Europees transport", sub: "Ophaal- en bezorgservice" },
              { src: "https://u.cubeupload.com/laurensbos/caravanstoragespain6.jpg", label: "Costa Brava locatie", sub: "Zon, ruimte en rust" },
            ].map((photo, i) => (
              <A key={photo.label} delay={i * 0.08}>
                <div className="card-editorial aspect-[4/3] group">
                  <Image src={photo.src} alt={photo.label} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="card-editorial-overlay" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10">
                    <h3 className="text-white font-bold text-sm sm:text-base">{photo.label}</h3>
                    <p className="text-white/60 text-xs mt-0.5">{photo.sub}</p>
                  </div>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <ReviewsWidget limit={4} />

      {/* ═══ KLANTPORTAAL ═══ */}
      <section className="py-12 sm:py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
              <div className="text-center lg:text-left">
                <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-2">Klantportaal</p>
                <h2 className="text-2xl sm:text-4xl font-black mb-4">Alles online inzien</h2>
                <div className="section-divider mt-0 mb-4 mx-auto lg:mx-0" />
                <p className="text-warm-gray mb-6 leading-relaxed max-w-lg mx-auto lg:mx-0 text-sm sm:text-base">Beheer uw stalling online. Contracten, facturen, inspecties en service aanvragen via uw dashboard.</p>
                <ul className="space-y-2 mb-6 text-left max-w-md mx-auto lg:mx-0">
                  {["Caravans en pleknummers bekijken", "Contracten en facturen inzien", "Service aanvragen indienen", "Inspectierapportages ontvangen"].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm"><CheckCircle size={14} className="text-success shrink-0" /><span>{f}</span></li>
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
                    <div key={item.label} className="card-premium p-4">
                      <p className="text-xs text-warm-gray font-medium uppercase tracking-wider">{item.label}</p>
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
      <section className="py-12 sm:py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-2">Blog & Tips</p>
            <h2 className="text-2xl sm:text-4xl font-black mb-3">Kennis & reisgidsen</h2>
            <div className="section-divider mt-3 mb-3" />
            <p className="text-warm-gray leading-relaxed text-sm">Praktische tips, reisgidsen voor de Costa Brava en alles over caravanonderhoud.</p>
          </A>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 no-scrollbar">
            {BLOG_PREVIEW.map((post, i) => (
              <A key={post.slug} delay={i * 0.08}>
                <Link href={`/blog/${post.slug}`} className="group block h-full snap-start min-w-[280px] sm:min-w-0">
                  <div className="bg-card rounded-2xl overflow-hidden border border-sand-dark/20 h-full flex flex-col card-hover">
                    <div className="card-editorial relative aspect-[16/10] overflow-hidden">
                      <Image src={post.image} alt={post.title} fill sizes="(max-width: 640px) 80vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="card-editorial-overlay" />
                      <div className="absolute bottom-3 left-3 right-3 z-10">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/90 text-primary">{post.category}</span>
                        <h3 className="font-bold text-[15px] leading-snug text-white mt-2">{post.title}</h3>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center relative">
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

      <QuizModal open={quizOpen} onClose={() => { setQuizOpen(false); setQuizInterest(undefined); }} source="homepage" initialInterest={quizInterest} />
      <Footer />
    </>
  );
}
