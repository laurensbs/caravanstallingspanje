'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, Shield, Wrench, Sun, ArrowRight, Phone, CheckCircle, Star, Clock, Navigation, Plane, Car, Palmtree, HelpCircle } from 'lucide-react';
import A from '@/components/AnimateIn';
import CtaSection from '@/components/CtaSection';
import PageHero from '@/components/PageHero';
import { FaqItem } from '@/components/FaqAccordion';
import QuizModal from '@/components/QuizModal';
import { useCountUp } from '@/lib/useCountUp';

const locatieFaqs = [
  { q: 'Waar ligt de stalling precies?', a: 'Onze stalling ligt in Sant Climent de Peralta, een klein dorp in de gemeente Forallac, provincie Girona. Centraal aan de Costa Brava, op 25 minuten van Pals en L\'Estartit, 35 minuten van Begur en 45 minuten van Girona Airport.' },
  { q: 'Hoe kom ik vanaf Girona Airport naar de stalling?', a: 'Vanaf Girona Airport (GRO) is het circa 45 minuten rijden via de C-66. Neem de afslag richting La Bisbal d\'Empordà en volg de borden naar Peratallada/Forallac. Sant Climent de Peralta ligt net ten noorden van Peratallada.' },
  { q: 'Is er parkeergelegenheid voor mijn auto?', a: 'Ja, er is ruim parkeergelegenheid voor uw auto op ons terrein terwijl u uw caravan ophaalt of brengt. U kunt uw auto ook bij ons achterlaten als u met de caravan naar een camping gaat.' },
  { q: 'Kan ik de stalling bezichtigen?', a: 'Natuurlijk! U bent van harte welkom voor een bezichtiging of rondleiding. Wij vragen u wel om vooraf een afspraak te maken, zodat wij u persoonlijk kunnen ontvangen en rondleiden. Bel +34 650 036 755 of mail info@caravanstalling-spanje.com.' },
  { q: 'Welke campings liggen in de buurt?', a: 'Binnen een uur rijden vanaf onze stalling bevinden zich tientallen campings, waaronder Camping Interpals (Pals), Camping Castell Montgri (L\'Estartit), Camping Begur en Camping La Ballena Alegre (Sant Pere Pescador). Wij transporteren uw caravan graag naar de camping van uw keuze.' },
  { q: 'Zijn er voorzieningen in de omgeving?', a: 'Sant Climent de Peralta ligt dicht bij het middeleeuwse dorp Peratallada (10 min), La Bisbal d\'Empordà (15 min) met winkels en supermarkten, en de stranden van de Costa Brava (20-30 min). Het is een prachtige, rustige locatie te midden van olijfbomen en wijnranken.' },
];


export default function LocatiesPage() {
  const [quizOpen, setQuizOpen] = useState(false);
  const statYears = useCountUp(20);
  const statStaff = useCountUp(12);
  const statTransport = useCountUp(7);
  return (
    <>
      <Header />

      <PageHero badge="Onze locatie" title={<><span className="gradient-text">Costa Brava</span>, Spanje</>} subtitle="Ons stallingsterrein en werkplaats liggen centraal aan de Costa Brava, in het rustige Sant Climent de Peralta, provincie Girona. Op korte afstand van Pals, Begur, L'Estartit en Palamós." image="https://u.cubeupload.com/laurensbos/caravanstoragespain.jpg" />

      {/* Main Location */}
      <section className="py-14 sm:py-24 bg-surface relative overflow-hidden">
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-start">
            <A>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-accent/10 text-primary rounded-xl flex items-center justify-center">
                    <MapPin size={22} />
                  </div>
                  <span className="text-xs font-bold bg-accent/10 text-accent px-3 py-1 rounded-full uppercase tracking-wider">Hoofdvestiging</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black mb-2">Sant Climent de Peralta</h2>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Ctra+de+Palamos+91+17110+Sant+Climent+de+Peralta+Girona"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-bold text-sm mb-6 inline-flex items-center gap-1.5 hover:underline"
                >
                  <Navigation size={13} /> Ctra de Palamós, 91 · 17110 Girona
                </a>
                <p className="text-warm-gray leading-relaxed mb-4">
                  Ons hoofdterrein ligt aan de Ctra de Palamós in het rustige Sant Climent de Peralta, provincie Girona. 
                  Het terrein is centraal gelegen ten opzichte van de populairste badplaatsen aan de Costa Brava: Pals, Begur, L&apos;Estartit en Palamós liggen allemaal op slechts 6 tot 15 kilometer afstand. 
                  Direct aan de doorgaande weg, makkelijk bereikbaar vanuit alle richtingen.
                </p>
                <p className="text-warm-gray leading-relaxed mb-4">
                  Het terrein is volledig afgesloten en beveiligd met het Securitas Direct alarmsysteem en 24/7 camerabewaking. Op het terrein bevindt zich ook onze volledig uitgeruste werkplaats waar wij reparaties, onderhoud en het gepatenteerde CaravanRepair® schadeherstel uitvoeren.
                </p>
                <p className="text-warm-gray leading-relaxed mb-8">
                  Het dichtstbijzijnde vliegveld is Girona-Costa Brava Airport (40 min rijden) met regelmatige vluchten vanuit Nederland en België. Barcelona El Prat is circa 1,5 uur rijden. Wij spreken Nederlands, Engels en Spaans.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    { icon: Shield, title: 'Beveiligd terrein', desc: 'Securitas Direct alarm, 24/7 camerabewaking, afgesloten terreinmuren' },
                    { icon: Wrench, title: 'Eigen werkplaats', desc: 'Volledige werkplaats voor reparatie, onderhoud en CaravanRepair®' },
                    { icon: Sun, title: 'Binnen- & buitenstalling', desc: 'Overdekte en open stallingsplekken, elk met eigen pleknummer' },
                    { icon: Clock, title: 'Openingstijden', desc: 'Ma t/m vr: 09:30 – 16:30 · Weekend: gesloten' },
                  ].map(f => (
                    <div key={f.title} className="flex gap-4">
                      <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shrink-0">
                        <f.icon size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-sm mb-0.5">{f.title}</p>
                        <p className="text-xs text-warm-gray">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => setQuizOpen(true)} className="bg-accent hover:bg-accent-dark text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2 cursor-pointer">
                    Afspraak maken <ArrowRight size={14} />
                  </button>
                  <a href="tel:+34650036755" className="text-surface-dark hover:text-primary font-bold px-6 py-3 rounded-xl text-sm transition-colors inline-flex items-center gap-2 border border-sand-dark/[0.08]">
                    <Phone size={15} /> +34 650 036 755
                  </a>
                </div>
              </div>
            </A>

            <A delay={0.15}>
              {/* Map placeholder */}
              <div className="bg-surface rounded-2xl overflow-hidden border border-sand-dark/[0.04]">
                <div className="aspect-square sm:aspect-[4/3] relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2975.8!2d3.14!3d42.01!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12ba8d9e42ceae9f%3A0x4af8d0d99ced30a2!2sCtra.%20de%20Palam%C3%B3s%2C%2091%2C%2017110%20Sant%20Climent%20de%20Peralta%2C%20Girona%2C%20Spain!5e0!3m2!1snl!2snl!4v1"
                    width="100%"
                    height="100%"
                    className="absolute inset-0 border-0 w-full h-full"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Locatie Caravanstalling Spanje"
                  />
                </div>
                <div className="p-5 bg-surface/80 backdrop-blur-sm border-t border-sand-dark/[0.04]">
                  <p className="text-xs text-warm-gray font-medium">
                    <MapPin size={12} className="inline mr-1" />
                    Ctra de Palamós, 91 · 17110 Sant Climent de Peralta, Girona, Spanje
                  </p>
                </div>
              </div>
            </A>
          </div>
        </div>
      </section>

      {/* Nearby */}
      <section className="py-14 sm:py-24 bg-premium-warm relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3"><MapPin size={11} className="text-primary" /><span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">Omgeving</span></span>
            <h2 className="text-2xl sm:text-4xl font-black mb-3">Populaire bestemmingen</h2>
            <div className="divider-animated mt-3 mb-4" />
            <p className="text-warm-gray text-sm">Onze stalling ligt centraal, op korte afstand van de mooiste badplaatsen en dorpen.</p>
          </A>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 max-w-5xl mx-auto">
            {[
              { place: 'Pals', km: '6 km', desc: 'Middeleeuws dorpje met rijstterrassen, golfbaan en kilometerslange zandstranden', rating: 4.8 },
              { place: 'Begur', km: '10 km', desc: 'Charmant kustdorp op een heuvel, met verborgen baaien en kristalhelder water', rating: 4.9 },
              { place: 'L\'Estartit', km: '12 km', desc: 'Duikparadijs bij de Medes-eilanden, een beschermd marien reservaat', rating: 4.7 },
              { place: 'Palamós', km: '15 km', desc: 'Authentieke vissershaven, beroemd om de gambas en de visveiling', rating: 4.6 },
            ].map((p, i) => (
              <A key={p.place} delay={i * 0.08}>
                <div className="card-premium p-4 sm:p-6 h-full text-center">
                  <p className="stat-number text-xl mb-1">{p.km}</p>
                  <h3 className="font-black text-lg mb-2">{p.place}</h3>
                  <p className="text-xs text-warm-gray leading-relaxed mb-3">{p.desc}</p>
                  <div className="flex items-center justify-center gap-1">
                    <Star size={11} className="text-warning" fill="currentColor" />
                    <span className="text-xs font-medium">{p.rating}</span>
                  </div>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* Facts */}
      <section className="py-12 sm:py-16 bg-card relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <A delay={0}>
                <div ref={statYears.ref}>
                  <p className="stat-number text-3xl sm:text-4xl mb-1">{statYears.value}+</p>
                  <p className="text-xs text-warm-gray font-medium">Jaar ervaring</p>
                </div>
              </A>
              <A delay={0.1}>
                <div ref={statStaff.ref}>
                  <p className="stat-number text-3xl sm:text-4xl mb-1">{statStaff.value}</p>
                  <p className="text-xs text-warm-gray font-medium">Medewerkers in seizoen</p>
                </div>
              </A>
              <A delay={0.2}>
                <div>
                  <p className="stat-number text-3xl sm:text-4xl mb-1">4.9/5</p>
                  <p className="text-xs text-warm-gray font-medium">Google reviews</p>
                </div>
              </A>
              <A delay={0.3}>
                <div ref={statTransport.ref}>
                  <p className="stat-number text-3xl sm:text-4xl mb-1">{statTransport.value}</p>
                  <p className="text-xs text-warm-gray font-medium">Transporteenheden</p>
                </div>
              </A>
            </div>
          </A>
        </div>
      </section>

      {/* Bereikbaarheid */}
      <section className="py-14 sm:py-24 bg-premium-cool relative overflow-hidden">
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-ocean/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-ocean/8 rounded-full px-3 py-1 mb-3"><Navigation size={11} className="text-ocean" /><span className="text-ocean text-xs font-bold tracking-[0.15em] uppercase">Bereikbaarheid</span></span>
            <h2 className="text-2xl sm:text-4xl font-black mb-3">Hoe komt u bij ons?</h2>
            <div className="divider-animated mt-3 mb-4" />
            <p className="text-warm-gray leading-relaxed text-sm">Met vliegtuig of auto — we zijn goed bereikbaar.</p>
          </A>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Car, title: 'Met de auto', desc: 'Via de AP-7 (afslag La Bisbal d\'Empordà). Vervolgens via de C-31 richting Palamós. Na Sant Climent de Peralta vindt u ons terrein aan de linkerzijde van de weg. Vanaf de Franse grens circa 45 minuten.', color: 'bg-accent/10 text-accent' },
              { icon: Plane, title: 'Per vliegtuig', desc: 'Girona-Costa Brava Airport ligt op 40 minuten rijden. Barcelona El Prat op circa 1,5 uur. Er zijn regelmatige vluchten vanuit Amsterdam, Eindhoven, Rotterdam en Brussel.', color: 'bg-ocean/10 text-ocean' },
              { icon: Navigation, title: 'Navigatie', desc: 'Voer in uw navigatie in: Ctra de Palamós 91, 17110 Sant Climent de Peralta, Girona. Google Maps en Waze kennen ons adres. Parkeren is mogelijk op het terrein.', color: 'bg-primary/10 text-primary' },
            ].map((f, i) => (
              <A key={f.title} delay={i * 0.08}>
                <div className="card-premium p-6 h-full">
                  <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                    <f.icon size={22} />
                  </div>
                  <h3 className="font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-warm-gray leading-relaxed">{f.desc}</p>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-24 bg-card relative">
        <div className="absolute inset-0 line-pattern opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3"><HelpCircle size={11} className="text-primary" /><span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">Veelgestelde vragen</span></span>
            <h2 className="text-2xl sm:text-4xl font-black mb-3">Vragen over onze locatie?</h2>
            <div className="divider-animated mt-3" />
          </A>
          <A>
            <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-sand-dark/[0.06] px-6 sm:px-8">
              {locatieFaqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </A>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: locatieFaqs.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }) }} />
      </section>

      <CtaSection title="Bezoek onze stalling" subtitle="Maak een afspraak voor een rondleiding of neem vrijblijvend contact op." primaryLabel="Neem contact op" primaryColor="accent" onPrimaryClick={() => setQuizOpen(true)} />

      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} source="locaties" />
      <Footer />
    </>
  );
}
