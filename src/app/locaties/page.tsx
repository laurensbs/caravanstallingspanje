'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { MapPin, Shield, Wrench, Sun, ArrowRight, Phone, CheckCircle, Star, Clock } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

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
              Centraal gelegen in Sant Climent de Peralta, Girona. Tussen de prachtige stranden en dorpen van de Costa Brava.
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
                <p className="text-primary font-bold text-sm mb-6">Ctra de Palamós, 91 · 17110 Girona</p>
                <p className="text-warm-gray leading-relaxed mb-8">
                  Ons hoofdterrein ligt aan de Ctra de Palamós in het rustige Sant Climent de Peralta, provincie Girona. 
                  Centraal gelegen ten opzichte van populaire badplaatsen als Pals, Begur, L&apos;Estartit en Palamós. 
                  Direct aan de doorgaande weg, makkelijk bereikbaar vanuit alle richtingen.
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
              { place: 'Pals', km: '6 km', desc: 'Middeleeuws dorp met prachtige stranden', rating: 4.8 },
              { place: 'Begur', km: '10 km', desc: 'Charmant kustdorp, verborgen baaien', rating: 4.9 },
              { place: 'L\'Estartit', km: '12 km', desc: 'Duikparadijs, Medes eilanden', rating: 4.7 },
              { place: 'Palamós', km: '15 km', desc: 'Vissershaven, culinaire hotspot', rating: 4.6 },
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
      <section className="py-16 sm:py-20 bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { val: '20+', lbl: 'Jaar ervaring' },
                { val: '12', lbl: 'Medewerkers' },
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
