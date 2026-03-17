'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Star, Sparkles, HelpCircle } from 'lucide-react';
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

const PLANS = [
  {
    name: 'Buitenstalling',
    price: '65',
    period: '/maand',
    desc: 'Veilige buitenstalling op beveiligd terrein',
    features: ['Afgesloten terrein', '24/7 bewaking', 'Standaard verzekerd', 'Tweewekelijkse controle', 'Jaarlijkse technische keuring', 'Gratis plaatsen op terrein'],
    popular: false,
    color: 'border-gray-200',
  },
  {
    name: 'Binnenstalling',
    price: '95',
    period: '/maand',
    desc: 'Overdekte stalling met maximale bescherming',
    features: ['Alle voordelen buitenstalling', 'Geïsoleerde hal', 'Bescherming tegen zon & regen', 'Geen temperatuurschommelingen', 'Premium locatie', 'Beperkt beschikbaar'],
    popular: true,
    color: 'border-accent',
  },
  {
    name: 'Seizoensstalling',
    price: '45',
    period: '/maand',
    desc: 'Tijdelijke stalling buiten het seizoen (okt-apr)',
    features: ['Buitenstalling', 'Beveiligd terrein', 'Camerabewaking', 'Minimaal 6 maanden', 'Flexibele start/einddatum', 'Upgrade naar jaarstalling mogelijk'],
    popular: false,
    color: 'border-gray-200',
  },
];

const EXTRAS = [
  { name: 'Transport (binnen 30km)', price: 'Vanaf €75' },
  { name: 'Transport (30-60km)', price: 'Vanaf €125' },
  { name: 'Jaarlijks onderhoud pakket', price: '€149/jaar' },
  { name: 'Exterieur wassen & waxen', price: 'Vanaf €89' },
  { name: 'Interieur dieptereiniging', price: 'Vanaf €129' },
  { name: 'Bandenwissel (4 banden)', price: 'Vanaf €49' },
  { name: 'Voortent op-/afbouw', price: 'Vanaf €59' },
  { name: 'Accu laden & onderhoud', price: '€25' },
];

export default function TarievenPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative bg-primary-dark text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary/80 to-primary-dark" />
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Tarieven</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Onze <span className="gradient-text">Tarieven</span>
            </h1>
            <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
              Transparante prijzen zonder verrassingen. Alle prijzen zijn exclusief 21% IVA.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-3 block">Stallingsopties</span>
            <h2 className="text-3xl md:text-4xl font-black text-primary-dark mb-4">Kies uw stallingstype</h2>
            <p className="text-muted max-w-2xl mx-auto">Transparante maandtarieven, inclusief beveiliging en verzekering</p>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
            {PLANS.map((p, i) => (
              <AnimatedSection key={p.name} delay={i * 0.1}>
                <div className={`relative bg-white rounded-3xl p-8 border-2 ${p.color} card-hover h-full flex flex-col ${p.popular ? 'shadow-xl shadow-accent/10 scale-[1.02] ring-1 ring-accent/20' : ''}`}>
                  {p.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent to-accent-light text-primary-dark text-[10px] font-black px-5 py-1.5 rounded-full shadow-lg shadow-accent/20 flex items-center gap-1">
                      <Star size={10} fill="currentColor" /> POPULAIR
                    </div>
                  )}
                  <h3 className="text-xl font-black text-primary-dark">{p.name}</h3>
                  <p className="text-sm text-muted mt-1 mb-6">{p.desc}</p>
                  <div className="mb-8">
                    <span className="text-5xl font-black text-primary-dark">€{p.price}</span>
                    <span className="text-muted text-sm">{p.period}</span>
                  </div>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {p.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle size={14} className="text-success shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className={`block text-center font-bold px-6 py-4 rounded-xl text-sm transition-all duration-300 ${
                      p.popular
                        ? 'bg-gradient-to-r from-accent to-accent-light hover:from-accent-light hover:to-accent text-white shadow-lg shadow-accent/20'
                        : 'bg-primary hover:bg-primary-light text-white'
                    }`}
                  >
                    Stalling aanvragen <ArrowRight size={14} className="inline ml-1" />
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Extra services */}
      <section className="py-24 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center mb-10 sm:mb-12">
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-3 block">Aanvullend</span>
            <h2 className="text-3xl md:text-4xl font-black text-primary-dark mb-4">Extra diensten</h2>
            <p className="text-muted">Aanvullende services die u kunt bijboeken</p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
              {EXTRAS.map(e => (
                <div key={e.name} className="flex items-center justify-between px-7 py-4.5 hover:bg-surface/50 transition-colors">
                  <span className="text-sm font-semibold text-gray-700">{e.name}</span>
                  <span className="text-sm font-black text-primary-dark">{e.price}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-muted mt-5">Alle prijzen zijn exclusief 21% IVA (Spaans BTW). Maatwerk tarieven op aanvraag.</p>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ hint / CTA */}
      <section className="py-16 bg-primary-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <AnimatedSection>
            <HelpCircle size={24} className="text-accent mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-black mb-4">Vragen over onze tarieven?</h2>
            <p className="text-white/50 mb-8">Neem gerust contact met ons op. Wij maken graag een offerte op maat voor uw situatie.</p>
            <Link href="/stalling" className="bg-gradient-to-r from-accent to-accent-light hover:from-accent-light hover:to-accent text-white font-bold px-8 py-4 rounded-2xl text-sm transition-all duration-300 shadow-lg shadow-accent/20 inline-flex items-center gap-2">
              Contact opnemen <ArrowRight size={16} />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </>
  );
}
