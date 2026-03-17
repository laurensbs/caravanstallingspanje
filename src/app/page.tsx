"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Shield, Wrench, Truck, Eye, MapPin, Star, CheckCircle, ArrowRight, Phone, Camera, Users, ChevronRight, Sparkles, Calendar, Ruler, Building } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useT } from "@/lib/i18n";

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const REVIEWS = [
  { name: "Wieger V.", location: "Nederland", text: "Zeer fijne caravan stalling. Niet alleen stalling goed geregeld maar ook reparaties en assistentie bij eventuele problemen.", rating: 5 },
  { name: "Harald H.", location: "Duitsland", text: "Perfecte service. Ze voeren alle reparaties uit. Nederlandssprekende eigenaar. We zijn perfect geholpen.", rating: 5 },
  { name: "Wim D.", location: "Belgi\u00eb", text: "Een hele goede service. Klantvriendelijkheid kent geen grens. Echt vijf stralende sterren!", rating: 5 },
];

const STATS = [
  { value: "2000+", labelKey: "stats.caravans" },
  { value: "10+", labelKey: "stats.experience" },
  { value: "4.9\u2605", labelKey: "stats.google" },
  { value: "3", labelKey: "stats.locations" },
];

export default function HomePage() {
  const t = useT();
  const [booking, setBooking] = useState({ type: "buiten", length: "", start: "", location: "sant-climent" });
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Website Booking",
        email: "noreply@caravanstalling-spanje.com",
        subject: `Stalling aanvraag - ${booking.type}`,
        message: `Type: ${booking.type}\nLengte: ${booking.length}m\nStartdatum: ${booking.start}\nLocatie: ${booking.location}`,
      }),
    });
    setBookingSubmitted(true);
    setTimeout(() => setBookingSubmitted(false), 4000);
  };

  const FEATURES = [
    { icon: Shield, title: t("feat.security"), desc: t("feat.security.desc"), color: "from-blue-500/10 to-blue-600/5" },
    { icon: Eye, title: t("feat.inspection"), desc: t("feat.inspection.desc"), color: "from-purple-500/10 to-purple-600/5" },
    { icon: Wrench, title: t("feat.repair"), desc: t("feat.repair.desc"), color: "from-rose-500/10 to-rose-600/5" },
    { icon: Truck, title: t("feat.transport"), desc: t("feat.transport.desc"), color: "from-emerald-500/10 to-emerald-600/5" },
  ];

  const SERVICES = [
    { icon: Shield, title: t("svc.outdoor"), desc: t("svc.outdoor.desc"), price: t("svc.outdoor.price"), tag: "Populair" },
    { icon: Building, title: t("svc.indoor"), desc: t("svc.indoor.desc"), price: t("svc.indoor.price"), tag: "Premium" },
    { icon: Wrench, title: t("svc.repair"), desc: t("svc.repair.desc"), price: t("svc.repair.price"), tag: "" },
    { icon: Truck, title: t("svc.transport"), desc: t("svc.transport.desc"), price: t("svc.transport.price"), tag: "" },
  ];

  return (
    <>
      <Header />

      {/* HERO WITH BOOKING */}
      <section className="relative bg-primary-dark text-white overflow-hidden min-h-[92vh] flex items-center">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=1920&q=80" alt="" className="img-cover opacity-30" />
          <div className="hero-overlay absolute inset-0" />
        </div>
        <div className="absolute inset-0 dot-pattern opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-28 w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Text */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}>
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-wide">
                <MapPin size={12} /> {t("hero.badge")}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] mb-6">
                {t("hero.title1")}<br />
                <span className="gradient-text">{t("hero.title2")}</span>
              </h1>
              <p className="text-base sm:text-lg text-white/50 mb-8 max-w-lg leading-relaxed">{t("hero.desc")}</p>

              {/* Mobile stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 lg:mb-0">
                {STATS.map(s => (
                  <div key={s.labelKey} className="glass rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-black gradient-text">{s.value}</div>
                    <div className="text-[10px] sm:text-xs text-white/40 mt-0.5">{t(s.labelKey)}</div>
                  </div>
                ))}
              </div>

              {/* Trust badges */}
              <div className="hidden lg:flex items-center gap-6 mt-10 pt-8 border-t border-white/5">
                <div className="flex items-center gap-2"><Shield size={16} className="text-accent" /><span className="text-white/40 text-xs font-medium">{t("hero.security")}</span></div>
                <div className="flex items-center gap-2"><Camera size={16} className="text-accent" /><span className="text-white/40 text-xs font-medium">{t("hero.cameras")}</span></div>
                <div className="flex items-center gap-2"><CheckCircle size={16} className="text-accent" /><span className="text-white/40 text-xs font-medium">{t("hero.insured")}</span></div>
              </div>
            </motion.div>

            {/* Booking widget */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}>
              <div className="booking-widget rounded-3xl p-6 sm:p-8">
                <h3 className="text-primary-dark text-lg font-bold mb-1">{t("book.title")}</h3>
                <p className="text-muted text-xs mb-5">Costa Brava, Spanje</p>
                {bookingSubmitted ? (
                  <div className="text-center py-10">
                    <CheckCircle size={48} className="text-success mx-auto mb-4" />
                    <p className="text-primary-dark font-bold text-lg">Aanvraag ontvangen!</p>
                    <p className="text-muted text-sm mt-2">Wij nemen binnen 24 uur contact met u op.</p>
                  </div>
                ) : (
                  <form onSubmit={handleBooking} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">{t("book.type")}</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: "buiten", label: t("book.type.outdoor"), price: "\u20ac65" },
                          { val: "binnen", label: t("book.type.indoor"), price: "\u20ac95" },
                          { val: "seizoen", label: t("book.type.seasonal"), price: "\u20ac55" },
                        ].map(opt => (
                          <button key={opt.val} type="button" onClick={() => setBooking({...booking, type: opt.val})} className={`p-3 rounded-xl text-center transition-all text-xs border ${booking.type === opt.val ? "bg-accent/10 border-accent text-accent font-bold" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                            <div className="font-semibold">{opt.label}</div>
                            <div className={`text-[10px] mt-0.5 ${booking.type === opt.val ? "text-accent/70" : "text-gray-400"}`}>{opt.price}/mnd</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">{t("book.length")}</label>
                        <div className="relative">
                          <Ruler size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <select value={booking.length} onChange={e => setBooking({...booking, length: e.target.value})} required className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all appearance-none">
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
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">{t("book.start")}</label>
                        <div className="relative">
                          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="date" required value={booking.start} onChange={e => setBooking({...booking, start: e.target.value})} className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">{t("book.location")}</label>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select value={booking.location} onChange={e => setBooking({...booking, location: e.target.value})} className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all appearance-none">
                          <option value="sant-climent">Sant Climent de Peralta</option>
                          <option value="pals">Pals</option>
                          <option value="blanes">Blanes</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-accent to-accent-light hover:from-accent-dark hover:to-accent text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-accent/20 hover:shadow-accent/30 flex items-center justify-center gap-2">
                      {t("book.submit")} <ArrowRight size={16} />
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SERVICE ICONS BAR */}
      <section className="py-6 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 md:gap-12">
            {[
              { icon: Shield, label: t("svc.outdoor"), href: "/stalling" },
              { icon: Building, label: t("svc.indoor"), href: "/stalling" },
              { icon: Wrench, label: t("feat.repair"), href: "/diensten" },
              { icon: Truck, label: t("svc.transport"), href: "/diensten" },
              { icon: Sparkles, label: "Verhuur", href: "/diensten" },
            ].map(s => (
              <Link key={s.label} href={s.href} className="flex flex-col items-center gap-1.5 text-muted hover:text-accent transition-colors group py-3 px-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-accent/10 flex items-center justify-center transition-colors">
                  <s.icon size={22} className="group-hover:text-accent transition-colors" />
                </div>
                <span className="text-xs font-semibold">{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-3 block">{t("why.subtitle")}</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary-dark mb-4">{t("why.title")}</h2>
            <p className="text-muted max-w-2xl mx-auto text-sm sm:text-base">{t("why.desc")}</p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 card-hover group h-full">
                  <div className={`w-14 h-14 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-primary-dark">{f.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* IMAGE SECTION */}
      <section className="relative h-[300px] sm:h-[400px] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1920&q=80" alt="Caravanstalling terrein" className="img-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-primary-dark/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14">
          <p className="text-white/70 text-sm font-medium mb-2">Costa Brava, Girona</p>
          <h3 className="text-white text-2xl sm:text-3xl font-black">3 beveiligde locaties aan de Costa Brava</h3>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-16 sm:py-24 bg-surface relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-3 block">{t("services.subtitle")}</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary-dark mb-4">{t("services.title")}</h2>
            <p className="text-muted max-w-2xl mx-auto text-sm sm:text-base">{t("services.desc")}</p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((s, i) => (
              <AnimatedSection key={s.title} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 card-hover group h-full relative overflow-hidden">
                  {s.tag && <span className="absolute top-4 right-4 bg-accent/10 text-accent text-[10px] font-bold px-2.5 py-1 rounded-full">{s.tag}</span>}
                  <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary/10 transition-colors">
                    <s.icon className="text-primary" size={22} />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-primary-dark">{s.title}</h3>
                  <p className="text-sm text-muted leading-relaxed mb-4">{s.desc}</p>
                  <p className="text-accent font-bold text-lg">{s.price}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection delay={0.3} className="text-center mt-10">
            <Link href="/diensten" className="text-primary font-bold hover:text-accent inline-flex items-center gap-2 group text-sm transition-colors">
              {t("services.viewall")} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-3 block">{t("how.subtitle")}</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary-dark mb-4">{t("how.title")}</h2>
            <p className="text-muted max-w-2xl mx-auto text-sm sm:text-base">{t("how.desc")}</p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: Phone, title: t("how.1.title"), desc: t("how.1.desc") },
              { step: "02", icon: MapPin, title: t("how.2.title"), desc: t("how.2.desc") },
              { step: "03", icon: Truck, title: t("how.3.title"), desc: t("how.3.desc") },
              { step: "04", icon: Shield, title: t("how.4.title"), desc: t("how.4.desc") },
            ].map((s, i) => (
              <AnimatedSection key={s.step} delay={i * 0.15}>
                <div className="text-center group">
                  <div className="relative mb-6 mx-auto w-20 h-20">
                    <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <s.icon className="text-primary" size={28} />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-accent text-white text-xs font-black rounded-full flex items-center justify-center">{s.step}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-primary-dark">{s.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* REPAIR BANNER */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-primary via-primary-light to-primary relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
              <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-accent/20 rounded-2xl flex items-center justify-center animate-pulse-glow shrink-0">
                  <Wrench className="text-accent" size={28} />
                </div>
                <div>
                  <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-black mb-1">Caravan reparatie nodig?</h3>
                  <p className="text-white/50 max-w-lg text-sm">Complete werkplaats voor alle reparaties: banden, remmen, verlichting, interieur, exterieur, stoomreiniging en meer.</p>
                </div>
              </div>
              <Link href="/diensten" className="shrink-0 bg-accent hover:bg-accent-light text-white font-bold px-8 py-4 rounded-2xl text-sm transition-all duration-300 shadow-lg shadow-accent/20 inline-flex items-center gap-2">
                Bekijk reparaties <ChevronRight size={16} />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-16 sm:py-24 bg-primary-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-3 block">{t("reviews.subtitle")}</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">{t("reviews.title")}</h2>
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {[1,2,3,4,5].map(i => <Star key={i} size={18} fill="currentColor" className="text-accent" />)}
              <span className="text-white/40 ml-2 text-sm font-medium">4.9 {t("reviews.google")}</span>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {REVIEWS.map((r, i) => (
              <AnimatedSection key={r.name} delay={i * 0.1}>
                <div className="glass rounded-2xl p-6 sm:p-7 card-hover h-full">
                  <div className="flex items-center gap-1 text-accent mb-4">
                    {Array.from({ length: r.rating }).map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-6">&ldquo;{r.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold text-sm">{r.name.charAt(0)}</div>
                    <div>
                      <p className="text-white font-bold text-sm">{r.name}</p>
                      <p className="text-white/30 text-xs">{r.location}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* KLANTPORTAAL */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div>
                <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-3 block">{t("portal.subtitle")}</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary-dark mb-6">{t("portal.title")}</h2>
                <p className="text-muted mb-8 leading-relaxed text-sm sm:text-base">{t("portal.desc")}</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Uw caravans en hun pleknummer bekijken",
                    "Contracten en verlengingen inzien",
                    "Facturen downloaden en betalingsstatus volgen",
                    "Service aanvraag indienen (reparatie, transport)",
                    "Inspectierapportages ontvangen",
                  ].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <CheckCircle size={16} className="text-success shrink-0" />
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/mijn-account" className="bg-primary hover:bg-primary-light text-white font-bold px-8 py-4 rounded-2xl text-sm transition-all duration-300 inline-flex items-center gap-2">
                  <Users size={16} /> {t("portal.cta")}
                </Link>
              </div>
              <div className="bg-gradient-to-br from-surface to-gray-100 rounded-3xl p-6 sm:p-8 border border-gray-100">
                <div className="space-y-4">
                  {[
                    { label: "Mijn Caravans", value: "Hobby De Luxe 490 KMF", sub: "Plek A-042 \u00b7 Buitenstalling" },
                    { label: "Contract", value: "CS-000142", sub: "Actief \u00b7 Automatische verlenging" },
                    { label: "Volgende factuur", value: "\u20ac65,00", sub: "Vervaldatum: 01-04-2026" },
                    { label: "Laatste inspectie", value: "Goedgekeurd", sub: "02-03-2026 \u00b7 Geen bijzonderheden" },
                  ].map(item => (
                    <div key={item.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <p className="text-xs text-muted font-medium mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-primary-dark">{item.value}</p>
                      <p className="text-xs text-muted mt-0.5">{item.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </>
  );
}
