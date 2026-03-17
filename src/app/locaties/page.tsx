'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { MapPin, Shield, Car, CheckCircle, ArrowRight, Camera, Wrench, Phone } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const LOCATIONS = [
  {
    name: 'Hoofdlocatie - Sant Climent de Peralta',
    address: 'Ctra de Palamos, 91, 17110 Sant Climent de Peralta, Girona',
    type: 'Buiten- & binnenstalling',
    capacity: '800+ plaatsen',
    badge: 'Hoofdlocatie',
    color: 'from-blue-500/10 to-blue-600/5',
    features: ['Buitenstalling (Zone A-D)', 'Overdekte binnenstalling (Zone H)', 'Werkplaats', 'Wasplaats', 'Securitas Direct bewaking', '24/7 camerabewaking'],
  },
  {
    name: 'Locatie Pals',
    address: 'Omgeving Pals, Costa Brava',
    type: 'Buitenstalling',
    capacity: '600+ plaatsen',
    badge: 'Costa Brava',
    color: 'from-emerald-500/10 to-emerald-600/5',
    features: ['Ruim buitenterrein', 'Afgesloten terrein', 'Camerabewaking', 'Goede bereikbaarheid', 'Dichtbij populaire campings'],
  },
  {
    name: 'Locatie Blanes',
    address: 'Omgeving Blanes, Costa Brava',
    type: 'Buitenstalling',
    capacity: '500+ plaatsen',
    badge: 'Zuid Costa Brava',
    color: 'from-amber-500/10 to-amber-600/5',
    features: ['Buitenstalling', 'Beveiligd terrein', 'Camerabewaking', 'Zuid Costa Brava', 'Seizoensstalling (Zone S)'],
  },
];

export default function LocatiesPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative bg-primary-dark text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary/80 to-primary-dark" />
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Locaties</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Onze <span className="gradient-text">Locaties</span>
            </h1>
            <p className="text-white/50 max-w-2xl text-lg leading-relaxed">
              Meerdere beveiligde terreinen verspreid over de Costa Brava voor optimale service en bereikbaarheid.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          {LOCATIONS.map((l, i) => (
            <AnimatedSection key={l.name} delay={i * 0.1}>
              <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 card-hover">
                <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                  <div className={`w-20 h-20 bg-gradient-to-br ${l.color} rounded-2xl flex items-center justify-center shrink-0`}>
                    <MapPin className="text-primary" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h2 className="text-xl font-black text-primary-dark">{l.name}</h2>
                      <span className="bg-accent/10 text-accent text-[10px] font-bold px-3 py-1 rounded-full">{l.badge}</span>
                    </div>
                    <p className="text-muted text-sm mb-5">{l.address}</p>
                    <div className="flex flex-wrap gap-4 mb-6">
                      <span className="flex items-center gap-2 text-sm font-medium bg-surface px-3 py-1.5 rounded-lg">
                        <Shield size={14} className="text-primary" /> {l.type}
                      </span>
                      <span className="flex items-center gap-2 text-sm font-medium bg-surface px-3 py-1.5 rounded-lg">
                        <Car size={14} className="text-primary" /> {l.capacity}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                      {l.features.map(f => (
                        <span key={f} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle size={13} className="text-success shrink-0" /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Map placeholder */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-3 block">Waar vindt u ons</span>
            <h2 className="text-3xl md:text-4xl font-black text-primary-dark">Costa Brava, Spanje</h2>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="aspect-[21/9] bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={48} className="text-primary/20 mx-auto mb-3" />
                  <p className="text-muted text-sm font-medium">Google Maps integratie</p>
                  <p className="text-muted/60 text-xs mt-1">Sant Climent de Peralta, Girona, Spanje</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <AnimatedSection>
            <h2 className="text-3xl font-black mb-4">Wilt u uw caravan bij ons stallen?</h2>
            <p className="text-white/50 mb-8">Neem contact met ons op voor een vrijblijvende offerte of bezoek ons terrein.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="bg-gradient-to-r from-accent to-accent-light hover:from-accent-light hover:to-accent text-primary-dark font-bold px-8 py-4 rounded-2xl text-sm transition-all duration-300 shadow-lg shadow-accent/20 inline-flex items-center gap-2">
                Offerte aanvragen <ArrowRight size={16} />
              </Link>
              <a href="tel:+34972000000" className="glass text-white font-semibold px-8 py-4 rounded-2xl text-sm transition-all hover:bg-white/10 inline-flex items-center gap-2">
                <Phone size={16} /> Bel ons
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </>
  );
}
