'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Shield, Wrench, Truck, Eye, MapPin, Star, CheckCircle, ArrowRight, Phone, Camera, Thermometer, Users, Clock, Caravan, ChevronRight, Sparkles } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ value, suffix = '' }: { value: string; suffix?: string }) {
  return <span className="gradient-text">{value}{suffix}</span>;
}

const FEATURES = [
  { icon: Shield, title: 'Beveiligd terrein', desc: 'Securitas Direct alarmsysteem, 24/7 camerabewaking en volledig afgesloten terrein.', color: 'from-blue-500/10 to-blue-600/5' },
  { icon: Eye, title: 'Tweewekelijkse controle', desc: 'Elke 2 weken controleren wij alle caravans op schades door weersomstandigheden.', color: 'from-purple-500/10 to-purple-600/5' },
  { icon: Wrench, title: 'Onderhoud & reparatie', desc: 'Complete werkplaats voor alle reparaties aan uw caravan, van banden tot interieur.', color: 'from-amber-500/10 to-amber-600/5' },
  { icon: Truck, title: 'Transport service', desc: '7 transporteenheden om uw caravan op de camping af te leveren en op te halen.', color: 'from-emerald-500/10 to-emerald-600/5' },
];

const SERVICES = [
  { icon: Shield, title: 'Buitenstalling', desc: 'Veilige buitenstalling op beveiligd terrein met 24/7 bewaking', price: 'Vanaf €65/mnd', tag: 'Populair' },
  { icon: Thermometer, title: 'Binnenstalling', desc: 'Overdekte stalling met maximale bescherming tegen zon en regen', price: 'Vanaf €95/mnd', tag: 'Premium' },
  { icon: Wrench, title: 'Onderhoud', desc: 'Complete technische controles, reparaties en onderhoud', price: 'Op aanvraag', tag: '' },
  { icon: Truck, title: 'Transport', desc: 'Op- en afzetten op uw camping met professioneel materieel', price: 'Op aanvraag', tag: '' },
];

const REVIEWS = [
  { name: 'Wieger V.', location: 'Nederland', text: 'Zeer fijne caravan stalling. Niet alleen stalling goed geregeld maar ook reparaties en assistentie bij eventuele problemen.', rating: 5 },
  { name: 'Harald H.', location: 'Duitsland', text: 'Perfecte service. Ze voeren alle reparaties uit. Nederlandssprekende eigenaar. We zijn perfect geholpen.', rating: 5 },
  { name: 'Wim D.', location: 'België', text: 'Een hele goede service. Klantvriendelijkheid kent geen grens. Echt vijf stralende sterren!', rating: 5 },
];

const STATS = [
  { value: '2000+', label: 'Caravans in beheer' },
  { value: '10+', label: 'Jaar ervaring' },
  { value: '4.9', label: 'Google score', suffix: '★' },
  { value: '3', label: 'Locaties Costa Brava' },
];

export default function HomePage() {
  return (
    <>
      <Header />

      {/* ═══ HERO ═══ */}
      <section className="relative bg-primary-dark text-white overflow-hidden min-h-[90vh] flex items-center">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary/80 to-primary-dark" />
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-primary-light/10 rounded-full blur-[80px]" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-wide">
                <MapPin size={12} /> COSTA BRAVA, SPANJE
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] mb-6">
                Meer dan alleen
                <br />
                <span className="gradient-text">caravanstalling</span>
              </h1>
              <p className="text-lg text-white/50 mb-8 max-w-lg leading-relaxed">
                Veilig stallen, professioneel onderhoud en betrouwbaar transport van uw caravan aan de Costa Brava. Al meer dan 10 jaar uw partner in Spanje. <strong className="text-white/70">Ook caravanverhuur op aanvraag.</strong>
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="bg-gradient-to-r from-accent to-accent-light hover:from-accent-light hover:to-accent text-primary-dark font-bold px-8 py-4 rounded-2xl text-sm transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:scale-[1.02] inline-flex items-center gap-2"
                >
                  Offerte aanvragen <ArrowRight size={16} />
                </Link>
                <Link
                  href="/stalling"
                  className="glass text-white font-semibold px-8 py-4 rounded-2xl text-sm transition-all duration-300 hover:bg-white/10 inline-flex items-center gap-2"
                >
                  Meer informatie
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-accent" />
                  <span className="text-white/40 text-xs font-medium">Securitas bewaking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-accent" />
                  <span className="text-white/40 text-xs font-medium">24/7 camera&apos;s</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-accent" />
                  <span className="text-white/40 text-xs font-medium">Verzekerd</span>
                </div>
              </div>
            </motion.div>

            {/* Stats cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
              className="hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4">
                {STATS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                    className="glass rounded-2xl p-6 text-center card-hover"
                  >
                    <div className="text-3xl font-black mb-1">
                      <CountUp value={s.value} suffix={s.suffix} />
                    </div>
                    <div className="text-xs text-white/40 font-medium">{s.label}</div>
                  </motion.div>
                ))}
              </div>
              {/* Floating caravan illustration */}
              <div className="mt-6 glass rounded-2xl p-6 animate-float">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                    <Caravan className="text-accent" size={24} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">Ook caravanverhuur!</p>
                    <p className="text-white/40 text-xs">Huur een caravan voor uw vakantie in Spanje</p>
                  </div>
                  <ArrowRight size={16} className="text-accent ml-auto" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mobile stats */}
          <div className="lg:hidden mt-12 grid grid-cols-2 gap-3">
            {STATS.map(s => (
              <div key={s.label} className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-black gradient-text">{s.value}{s.suffix}</div>
                <div className="text-xs text-white/40 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <AnimatedSection className="text-center mb-16">
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-3 block">Waarom wij</span>
            <h2 className="text-3xl md:text-4xl font-black text-primary-dark mb-4">Waarom Caravanstalling Spanje?</h2>
            <p className="text-muted max-w-2xl mx-auto">Wij bieden meer dan alleen een plek voor uw caravan. Bij ons krijgt u een totaalpakket aan professionele services.</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-7 border border-gray-100 card-hover group h-full">
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

      {/* ═══ SERVICES ═══ */}
      <section className="py-24 bg-surface relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <AnimatedSection className="text-center mb-16">
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-3 block">Ons aanbod</span>
            <h2 className="text-3xl md:text-4xl font-black text-primary-dark mb-4">Onze diensten</h2>
            <p className="text-muted max-w-2xl mx-auto">Alles wat u nodig heeft voor uw caravan in Spanje, onder één dak.</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((s, i) => (
              <AnimatedSection key={s.title} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-7 border border-gray-100 card-hover group h-full relative overflow-hidden">
                  {s.tag && (
                    <span className="absolute top-4 right-4 bg-accent/10 text-accent text-[10px] font-bold px-2.5 py-1 rounded-full">{s.tag}</span>
                  )}
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
            <Link href="/diensten" className="text-primary font-bold hover:text-primary-light inline-flex items-center gap-2 group text-sm">
              Bekijk alle diensten <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-3 block">Het process</span>
            <h2 className="text-3xl md:text-4xl font-black text-primary-dark mb-4">Hoe het werkt</h2>
            <p className="text-muted max-w-2xl mx-auto">In enkele eenvoudige stappen is uw caravan veilig gestald</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', icon: Phone, title: 'Contact', desc: 'Vraag een offerte aan via ons contactformulier of bel ons direct.' },
              { step: '02', icon: MapPin, title: 'Plek toewijzen', desc: 'Wij wijzen een pleknummer toe op onze locatie op basis van uw wensen.' },
              { step: '03', icon: Truck, title: 'Transport', desc: 'Wij halen uw caravan op, of u brengt deze zelf naar onze stalling.' },
              { step: '04', icon: Shield, title: 'Veilig gestald', desc: 'Uw caravan staat veilig. U kunt alles volgen via uw klantportaal.' },
            ].map((s, i) => (
              <AnimatedSection key={s.step} delay={i * 0.15}>
                <div className="text-center group">
                  <div className="relative mb-6 mx-auto w-20 h-20">
                    <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <s.icon className="text-primary" size={28} />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-accent text-primary-dark text-xs font-black rounded-full flex items-center justify-center">{s.step}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-primary-dark">{s.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ RENTAL BANNER ═══ */}
      <section className="py-16 bg-gradient-to-r from-primary via-primary-light to-primary relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center animate-pulse-glow shrink-0">
                  <Sparkles className="text-accent" size={28} />
                </div>
                <div>
                  <h3 className="text-white text-2xl md:text-3xl font-black mb-1">Ook aan caravanverhuur?</h3>
                  <p className="text-white/50 max-w-lg">Naast stalling bieden wij ook caravanverhuur aan. Huur een caravan voor uw vakantie aan de Costa Brava!</p>
                </div>
              </div>
              <Link
                href="/contact"
                className="shrink-0 bg-accent hover:bg-accent-light text-primary-dark font-bold px-8 py-4 rounded-2xl text-sm transition-all duration-300 shadow-lg shadow-accent/20 inline-flex items-center gap-2"
              >
                Meer informatie <ChevronRight size={16} />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <section className="py-24 bg-primary-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <AnimatedSection className="text-center mb-16">
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-3 block">Ervaringen</span>
            <h2 className="text-3xl md:text-4xl font-black">Wat onze klanten zeggen</h2>
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {[1,2,3,4,5].map(i => <Star key={i} size={18} fill="currentColor" className="text-accent" />)}
              <span className="text-white/40 ml-2 text-sm font-medium">4.9 op Google Reviews</span>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((r, i) => (
              <AnimatedSection key={r.name} delay={i * 0.1}>
                <div className="glass rounded-2xl p-7 card-hover h-full">
                  <div className="flex items-center gap-1 text-accent mb-4">
                    {Array.from({ length: r.rating }).map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-6">&ldquo;{r.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold text-sm">
                      {r.name.charAt(0)}
                    </div>
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

      {/* ═══ KLANTPORTAAL PROMO ═══ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-3 block">Klantportaal</span>
                <h2 className="text-3xl md:text-4xl font-black text-primary-dark mb-6">Alles in de gaten houden via uw account</h2>
                <p className="text-muted mb-8 leading-relaxed">
                  Met uw persoonlijke klantaccount heeft u altijd inzicht in uw caravans, contracten, facturen en serviceaanvragen.
                  Bekijk uw toegewezen pleknummer, contractstatus en meer.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Uw caravans en hun pleknummer bekijken',
                    'Contracten en verlengingen inzien',
                    'Facturen downloaden en betalingsstatus volgen',
                    'Service aanvraag indienen (onderhoud, transport)',
                    'Inspectierapportages ontvangen',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <CheckCircle size={16} className="text-success shrink-0" />
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/mijn-account"
                  className="bg-primary hover:bg-primary-light text-white font-bold px-8 py-4 rounded-2xl text-sm transition-all duration-300 inline-flex items-center gap-2"
                >
                  <Users size={16} /> Naar Mijn Account
                </Link>
              </div>
              <div className="bg-gradient-to-br from-surface to-gray-100 rounded-3xl p-8 border border-gray-100">
                <div className="space-y-4">
                  {[
                    { label: 'Mijn Caravans', value: 'Hobby De Luxe 490 KMF', sub: 'Plek A-042 · Buitenstalling' },
                    { label: 'Contract', value: 'CS-000142', sub: 'Actief · Automatische verlenging' },
                    { label: 'Volgende factuur', value: '€65,00', sub: 'Vervaldatum: 01-04-2026' },
                    { label: 'Laatste inspectie', value: 'Goedgekeurd', sub: '02-03-2026 · Geen bijzonderheden' },
                  ].map((item) => (
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

      {/* ═══ SPOT SYSTEM EXPLAINER ═══ */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-3 block">Pleknummersysteem</span>
            <h2 className="text-3xl md:text-4xl font-black text-primary-dark mb-4">Elk plekje heeft zijn nummer</h2>
            <p className="text-muted max-w-2xl mx-auto">Uw caravan krijgt een vast pleknummer toegewezen. Zo weten wij en u altijd exact waar uw caravan staat.</p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-emerald-600 font-black text-xl">A-042</span>
                  </div>
                  <h4 className="font-bold text-primary-dark mb-2">Buitenstalling</h4>
                  <p className="text-sm text-muted">Zone A t/m D · Buitenplaatsen op beveiligd terrein met maandelijkse stalling</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-black text-xl">H-015</span>
                  </div>
                  <h4 className="font-bold text-primary-dark mb-2">Binnenstalling</h4>
                  <p className="text-sm text-muted">Zone H · Overdekte stalling in geïsoleerde hal met premium bescherming</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-amber-600 font-black text-xl">S-008</span>
                  </div>
                  <h4 className="font-bold text-primary-dark mb-2">Seizoensstalling</h4>
                  <p className="text-sm text-muted">Zone S · Tijdelijke plekken voor seizoensstalling (oktober t/m april)</p>
                </div>
              </div>
              <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                <p className="text-sm text-muted mb-4">Elk pleknummer is uniek en wordt bewaard in uw contract en klantportaal.</p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium"><span className="w-3 h-3 bg-emerald-400 rounded-full" /> Vrij</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium"><span className="w-3 h-3 bg-blue-400 rounded-full" /> Bezet</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium"><span className="w-3 h-3 bg-amber-400 rounded-full" /> Gereserveerd</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium"><span className="w-3 h-3 bg-red-400 rounded-full" /> Onderhoud</span>
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
