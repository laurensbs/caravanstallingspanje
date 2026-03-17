'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Shield, Thermometer, Camera, CheckCircle, ArrowRight, Lock, Eye, Caravan, Sparkles } from 'lucide-react';
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

const TYPES = [
  {
    title: 'Buitenstalling',
    icon: Shield,
    desc: 'Veilige buitenstalling op ons afgesloten en beveiligd terrein. Ideaal voor seizoensstalling van uw caravan.',
    features: ['Afgesloten terrein', '24/7 camerabewaking', 'Securitas Direct alarm', 'Standaard verzekerd', 'Tweewekelijkse controle', 'Jaarlijkse technische keuring'],
    price: '65', period: '/maand', tag: 'Populair',
    gradient: 'from-emerald-500/10 to-emerald-600/5',
  },
  {
    title: 'Binnenstalling (Overdekt)',
    icon: Thermometer,
    desc: 'Overdekte parkeerplaatsen voor extra bescherming tegen zon, regen en temperatuurschommelingen. Ideaal voor langdurige stalling.',
    features: ['Geïsoleerde hal', 'Bescherming tegen weer', 'Geen last van hitte of koude', 'Alle voordelen buitenstalling', 'Beperkte beschikbaarheid', 'Premium locatie'],
    price: '95', period: '/maand', tag: 'Premium',
    gradient: 'from-blue-500/10 to-blue-600/5',
  },
];

export default function StallingPage() {
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
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Caravanstalling</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Caravanstalling aan de<br /><span className="gradient-text">Costa Brava</span>
            </h1>
            <p className="text-white/50 max-w-2xl text-lg leading-relaxed">
              Dé specialist in het veilig en betrouwbaar stallen van uw caravan in Sant Climent de Peralta, Girona. Al meer dan 10 jaar een begrip.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Storage types */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-3 block">Stallingstypen</span>
            <h2 className="text-3xl md:text-4xl font-black text-primary-dark mb-4">Kies uw stallingtype</h2>
            <p className="text-muted max-w-2xl mx-auto">Binnen- en buitenstalling met professionele beveiliging en zorg</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8">
            {TYPES.map((t, i) => (
              <AnimatedSection key={t.title} delay={i * 0.15}>
                <div className="relative bg-white rounded-3xl p-8 md:p-10 border border-gray-100 card-hover h-full">
                  {t.tag && (
                    <span className="absolute top-6 right-6 bg-accent/10 text-accent text-[10px] font-bold px-3 py-1 rounded-full">{t.tag}</span>
                  )}
                  <div className={`w-16 h-16 bg-gradient-to-br ${t.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                    <t.icon className="text-primary" size={28} />
                  </div>
                  <h2 className="text-2xl font-black text-primary-dark mb-3">{t.title}</h2>
                  <p className="text-muted mb-6 leading-relaxed">{t.desc}</p>
                  <ul className="space-y-2.5 mb-8">
                    {t.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle size={15} className="text-success shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-end gap-1 mb-6">
                    <span className="text-sm text-muted">Vanaf</span>
                    <span className="text-4xl font-black text-primary-dark">€{t.price}</span>
                    <span className="text-muted text-sm">{t.period}</span>
                  </div>
                  <Link href="/contact" className="w-full bg-primary hover:bg-primary-light text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all duration-300 inline-flex items-center justify-center gap-2">
                    Offerte aanvragen <ArrowRight size={14} />
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-24 bg-surface relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <AnimatedSection className="text-center mb-16">
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-3 block">Beveiliging</span>
            <h2 className="text-3xl md:text-4xl font-black text-primary-dark mb-4">Veiligheid staat voorop</h2>
            <p className="text-muted max-w-2xl mx-auto">Uw caravan is bij ons in de beste handen met professionele beveiliging</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Lock, title: 'Securitas Direct', desc: 'Professioneel alarmsysteem van Securitas Direct met directe alarmopvolging.' },
              { icon: Camera, title: '24/7 Camerabewaking', desc: 'Geavanceerd camerasysteem met continue registratie van alle bewegingen op het terrein.' },
              { icon: Shield, title: 'Standaard verzekerd', desc: 'Uw caravan is op onze stalling standaard verzekerd tegen schade en diefstal.' },
            ].map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 card-hover h-full">
                  <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <f.icon className="text-primary" size={28} />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-primary-dark">{f.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Spot System */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-3 block">Organisatie</span>
                <h2 className="text-3xl md:text-4xl font-black text-primary-dark mb-6">Pleknummersysteem</h2>
                <p className="text-muted mb-6 leading-relaxed">
                  Elke caravan krijgt een eigen, vaste plek toegewezen met een uniek pleknummer. Zo weet u altijd precies waar uw caravan staat
                  en kunnen wij efficiënt werk plannen.
                </p>
                <p className="text-muted mb-8 leading-relaxed">
                  In uw klantportaal kunt u uw pleknummer, contractstatus en inspecties altijd inzien.
                </p>
                <div className="space-y-3">
                  {['Zones A-D: Buitenstalling', 'Zone H: Binnenstalling (overdekt)', 'Zone S: Seizoensstalling'].map(z => (
                    <div key={z} className="flex items-center gap-3 text-sm">
                      <CheckCircle size={15} className="text-success shrink-0" />
                      <span className="text-gray-700 font-medium">{z}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-surface rounded-3xl p-8 border border-gray-100">
                <div className="grid grid-cols-4 gap-2">
                  {['A-001','A-002','A-003','A-004','A-005','A-006','A-007','A-008','B-001','B-002','B-003','B-004','H-001','H-002','H-003','H-004'].map((spot, i) => {
                    const colors = ['bg-emerald-100 text-emerald-700', 'bg-blue-100 text-blue-700', 'bg-amber-100 text-amber-700'];
                    const color = i < 8 ? (i % 3 === 0 ? colors[0] : i % 3 === 1 ? colors[1] : colors[2]) : i < 12 ? colors[0] : colors[1];
                    return (
                      <div key={spot} className={`${color} rounded-xl p-3 text-center text-xs font-bold`}>
                        {spot}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500"><span className="w-2.5 h-2.5 bg-emerald-400 rounded-full" /> Vrij</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500"><span className="w-2.5 h-2.5 bg-blue-400 rounded-full" /> Bezet</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500"><span className="w-2.5 h-2.5 bg-amber-400 rounded-full" /> Gereserveerd</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Also rental */}
      <section className="py-16 bg-gradient-to-r from-primary via-primary-light to-primary relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center animate-pulse-glow shrink-0">
                <Sparkles className="text-accent" size={28} />
              </div>
              <div>
                <h3 className="text-white text-2xl md:text-3xl font-black mb-1">Ook aan caravanverhuur!</h3>
                <p className="text-white/50 max-w-lg">Wist u dat wij ook caravans verhuren? Perfect voor een vakantie aan de Costa Brava.</p>
              </div>
            </div>
            <Link href="/contact" className="shrink-0 bg-accent hover:bg-accent-light text-primary-dark font-bold px-8 py-4 rounded-2xl text-sm transition-all duration-300 shadow-lg shadow-accent/20 inline-flex items-center gap-2">
              Informeer naar verhuur <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
