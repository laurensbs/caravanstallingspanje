'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Wrench, Sparkles, Truck, ClipboardCheck, CheckCircle, ArrowRight, Caravan } from 'lucide-react';
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

const DIENSTEN = [
  {
    icon: Wrench, title: 'Reparatie & Onderhoud', color: 'from-blue-500/10 to-blue-600/5',
    desc: 'Van het wisselen van banden tot remrevisies. Wij repareren dakluiken, ramen en airconditioning in onze goed uitgeruste werkplaats.',
    items: ['Banden & remmen', 'Elektra & verlichting', 'Dakluiken & ramen', 'Airco service', 'Chassis onderhoud', 'Interieur reparaties'],
  },
  {
    icon: ClipboardCheck, title: 'Technische keuring', color: 'from-purple-500/10 to-purple-600/5',
    desc: 'Jaarlijkse technische controle van uw caravan. Wij checken alles zodat u veilig op vakantie kunt.',
    items: ['Bandenspanning & profiel', 'Remmen & verlichting', 'Gasinstallatie', 'Elektra controle', 'Lekkage test', 'Veiligheidscheck'],
  },
  {
    icon: Sparkles, title: 'Schoonmaak', color: 'from-emerald-500/10 to-emerald-600/5',
    desc: 'Van stoomreiniging en waxen van de buitenkant tot grondige reiniging van het interieur.',
    items: ['Exterieur wassen & waxen', 'Stoomreiniging', 'Interieur dieptereiniging', 'Bekleding reinigen', 'Anti-schimmel behandeling', 'Raamreiniging'],
  },
  {
    icon: Truck, title: 'Transport', color: 'from-amber-500/10 to-amber-600/5',
    desc: 'Met 7 transporteenheden leveren wij uw caravan af op de camping en halen deze weer op.',
    items: ['Afleveren op camping', 'Ophalen van camping', 'Plaatsing op staanplaats', 'Seizoensvervoer', 'Noodtransport', 'Voortent op-/afbouw'],
  },
];

export default function DienstenPage() {
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
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Diensten</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Onze <span className="gradient-text">Diensten</span>
            </h1>
            <p className="text-white/50 max-w-2xl text-lg leading-relaxed">
              Meer dan alleen caravanstalling. Wij ontzorgen u volledig met onderhoud, reparatie, schoonmaak en transport.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-20">
          {DIENSTEN.map((d, i) => (
            <AnimatedSection key={d.title}>
              <div className={`flex flex-col ${i % 2 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}>
                <div className="lg:w-1/2">
                  <div className={`w-16 h-16 bg-gradient-to-br ${d.color} rounded-2xl flex items-center justify-center mb-5`}>
                    <d.icon className="text-primary" size={28} />
                  </div>
                  <h2 className="text-3xl font-black text-primary-dark mb-4">{d.title}</h2>
                  <p className="text-muted mb-8 leading-relaxed text-lg">{d.desc}</p>
                  <ul className="grid grid-cols-2 gap-3">
                    {d.items.map(item => (
                      <li key={item} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle size={14} className="text-success shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="lg:w-1/2">
                  <div className={`bg-gradient-to-br ${d.color} rounded-3xl aspect-[4/3] flex items-center justify-center border border-gray-100`}>
                    <d.icon className="text-primary/20" size={100} />
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Caravanverhuur sectie */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-bold px-3 py-1.5 rounded-full mb-5">
                    <Caravan size={14} /> Caravanverhuur
                  </div>
                  <h2 className="text-3xl font-black text-primary-dark mb-4">Ook caravanverhuur beschikbaar</h2>
                  <p className="text-muted mb-6 leading-relaxed">
                    Naast het stallen van caravans bieden wij ook caravanverhuur aan. Perfect voor een onbezorgde vakantie aan de Costa Brava 
                    zonder de kosten van een eigen caravan.
                  </p>
                  <ul className="space-y-2.5 mb-8">
                    {['Diverse caravans beschikbaar', 'Aflevering op camping mogelijk', 'Inclusief basisverzekering', 'Flexible huurperiodes'].map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle size={14} className="text-success shrink-0" />
                        <span className="text-gray-700">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact" className="bg-primary hover:bg-primary-light text-white font-bold px-8 py-4 rounded-2xl text-sm transition-all duration-300 inline-flex items-center gap-2">
                    Informeer naar verhuur <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-3xl aspect-square flex items-center justify-center">
                  <Caravan className="text-accent/30" size={120} />
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
            <h2 className="text-3xl font-black mb-4">Interesse in onze diensten?</h2>
            <p className="text-white/50 mb-8">Neem contact met ons op voor een vrijblijvende offerte of meer informatie.</p>
            <Link href="/contact" className="bg-gradient-to-r from-accent to-accent-light hover:from-accent-light hover:to-accent text-primary-dark font-bold px-8 py-4 rounded-2xl text-sm transition-all duration-300 shadow-lg shadow-accent/20 inline-flex items-center gap-2">
              Contact opnemen <ArrowRight size={16} />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </>
  );
}
