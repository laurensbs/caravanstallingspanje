'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { MapPin, Shield, Wrench, Sun, ArrowRight, Phone, CheckCircle, Star, Clock, Navigation, Plane, Car, Palmtree, HelpCircle } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FaqItem } from '@/components/FaqAccordion';

const locatieFaqs = [
  { q: 'Waar ligt de stalling precies?', a: 'Onze stalling ligt in Sant Climent de Peralta, een klein dorp in de gemeente Forallac, provincie Girona. Centraal aan de Costa Brava, op 25 minuten van Pals en L\'Estartit, 35 minuten van Begur en 45 minuten van Girona Airport.' },
  { q: 'Hoe kom ik vanaf Girona Airport naar de stalling?', a: 'Vanaf Girona Airport (GRO) is het circa 45 minuten rijden via de C-66. Neem de afslag richting La Bisbal d\'Empordà en volg de borden naar Peratallada/Forallac. Sant Climent de Peralta ligt net ten noorden van Peratallada.' },
  { q: 'Is er parkeergelegenheid voor mijn auto?', a: 'Ja, er is ruim parkeergelegenheid voor uw auto op ons terrein terwijl u uw caravan ophaalt of brengt. U kunt uw auto ook bij ons achterlaten als u met de caravan naar een camping gaat.' },
  { q: 'Kan ik de stalling bezichtigen?', a: 'Natuurlijk! U bent van harte welkom voor een bezichtiging of rondleiding. Wij vragen u wel om vooraf een afspraak te maken, zodat wij u persoonlijk kunnen ontvangen en rondleiden. Bel +34 650 036 755 of mail info@caravanstalling-spanje.com.' },
  { q: 'Welke campings liggen in de buurt?', a: 'Binnen een uur rijden vanaf onze stalling bevinden zich tientallen campings, waaronder Camping Interpals (Pals), Camping Castell Montgri (L\'Estartit), Camping Begur en Camping La Ballena Alegre (Sant Pere Pescador). Wij transporteren uw caravan graag naar de camping van uw keuze.' },
  { q: 'Zijn er voorzieningen in de omgeving?', a: 'Sant Climent de Peralta ligt dicht bij het middeleeuwse dorp Peratallada (10 min), La Bisbal d\'Empordà (15 min) met winkels en supermarkten, en de stranden van de Costa Brava (20-30 min). Het is een prachtige, rustige locatie te midden van olijfbomen en wijnranken.' },
];

function A({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const v = useInView(ref, { once: true, margin: '-60px' });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={v ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }} className={className}>{children}</motion.div>;
}

export default function LocatiesPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative bg-surface-dark text-white py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary/80 to-primary-dark" />
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4">Onze locatie</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] mb-6">
              <span className="gradient-text">Costa Brava</span>, Spanje
            </h1>
            <p className="text-white/50 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Ons stallingsterrein en werkplaats liggen centraal aan de Costa Brava, in het rustige Sant Climent de Peralta, provincie Girona. Op korte afstand van Pals, Begur, L&apos;Estartit en Palamós.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Location */}
      <section className="py-20 sm:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <A>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-accent/10 text-primary rounded-xl flex items-center justify-center">
                    <MapPin size={22} />
                  </div>
                  <span className="text-[10px] font-bold bg-accent/10 text-accent px-3 py-1 rounded-full uppercase tracking-wider">Hoofdvestiging</span>
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
                  <Link href="/contact" className="bg-accent hover:bg-accent-dark text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2">
                    Route plannen <ArrowRight size={14} />
                  </Link>
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
      <section className="py-20 sm:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Omgeving</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Populaire bestemmingen</h2>
            <div className="section-divider mt-5" />
            <p className="text-warm-gray mt-5">Onze stalling ligt centraal aan de Costa Brava, op korte afstand van de mooiste badplaatsen en dorpen.</p>
          </A>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {[
              { place: 'Pals', km: '6 km', desc: 'Middeleeuws dorpje met rijstterrassen, golfbaan en kilometerslange zandstranden', rating: 4.8 },
              { place: 'Begur', km: '10 km', desc: 'Charmant kustdorp op een heuvel, met verborgen baaien en kristalhelder water', rating: 4.9 },
              { place: 'L\'Estartit', km: '12 km', desc: 'Duikparadijs bij de Medes-eilanden, een beschermd marien reservaat', rating: 4.7 },
              { place: 'Palamós', km: '15 km', desc: 'Authentieke vissershaven, beroemd om de gambas en de visveiling', rating: 4.6 },
            ].map((p, i) => (
              <A key={p.place} delay={i * 0.08}>
                <div className="bg-surface rounded-2xl p-6 border border-sand-dark/[0.04] card-hover h-full text-center">
                  <p className="text-primary font-bold text-xl mb-1">{p.km}</p>
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
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { val: '20+', lbl: 'Jaar ervaring' },
                { val: '12', lbl: 'Medewerkers in seizoen' },
                { val: '4.9/5', lbl: 'Google reviews' },
                { val: '7', lbl: 'Transporteenheden' },
              ].map(s => (
                <div key={s.lbl}>
                  <p className="text-3xl sm:text-4xl font-black gradient-text mb-1">{s.val}</p>
                  <p className="text-xs text-warm-gray font-medium">{s.lbl}</p>
                </div>
              ))}
            </div>
          </A>
        </div>
      </section>

      {/* Bereikbaarheid */}
      <section className="py-20 sm:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Bereikbaarheid</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Hoe komt u bij ons?</h2>
            <div className="section-divider mt-5 mb-5" />
            <p className="text-warm-gray leading-relaxed">Of u nu met het vliegtuig of de auto komt — onze stalling is goed bereikbaar.</p>
          </A>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Car, title: 'Met de auto', desc: 'Via de AP-7 (afslag La Bisbal d\'Empordà). Vervolgens via de C-31 richting Palamós. Na Sant Climent de Peralta vindt u ons terrein aan de linkerzijde van de weg. Vanaf de Franse grens circa 45 minuten.', color: 'bg-accent/10 text-accent' },
              { icon: Plane, title: 'Per vliegtuig', desc: 'Girona-Costa Brava Airport ligt op 40 minuten rijden. Barcelona El Prat op circa 1,5 uur. Er zijn regelmatige vluchten vanuit Amsterdam, Eindhoven, Rotterdam en Brussel.', color: 'bg-ocean/10 text-ocean' },
              { icon: Navigation, title: 'Navigatie', desc: 'Voer in uw navigatie in: Ctra de Palamós 91, 17110 Sant Climent de Peralta, Girona. Google Maps en Waze kennen ons adres. Parkeren is mogelijk op het terrein.', color: 'bg-primary/10 text-primary' },
            ].map((f, i) => (
              <A key={f.title} delay={i * 0.08}>
                <div className="bg-white rounded-2xl p-6 border border-sand-dark/20 card-hover h-full">
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
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Veelgestelde vragen</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Vragen over onze locatie?</h2>
            <div className="section-divider mt-5" />
          </A>
          <A>
            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-sand-dark/[0.06] px-6 sm:px-8">
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

      {/* CTA */}
      <section className="bg-surface-dark relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center relative">
          <A>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Bezoek onze stalling</h2>
            <p className="text-white/40 mb-8">Maak een afspraak voor een rondleiding of neem vrijblijvend contact op.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/contact" className="bg-accent hover:bg-accent-dark text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all inline-flex items-center gap-2 shadow-sm">
                Neem contact op <ArrowRight size={15} />
              </Link>
              <a href="tel:+34650036755" className="text-white/60 hover:text-white font-medium px-6 py-3.5 rounded-xl text-sm transition-colors inline-flex items-center gap-2 border border-white/10 hover:border-white/20">
                <Phone size={15} /> +34 650 036 755
              </a>
            </div>
          </A>
        </div>
      </section>

      <Footer />
    </>
  );
}
