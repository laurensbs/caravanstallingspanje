'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Shield, Wrench, Truck, ShoppingBag, Bike, SprayCan, Thermometer, ArrowRight, CheckCircle, Phone, Star, Sparkles } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

function A({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const v = useInView(ref, { once: true, margin: '-60px' });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={v ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }} className={className}>{children}</motion.div>;
}

const diensten = [
  {
    id: 'stalling',
    icon: Shield,
    title: 'Stalling',
    sub: 'Buiten & Binnen',
    desc: 'Veilige buiten- en binnenstalling op ons beveiligde terrein in Sant Climent de Peralta. Securitas Direct alarm, 24/7 camerabewaking en standaard verzekerd.',
    features: ['Buitenstalling vanaf €65/mnd', 'Binnenstalling (overdekt) vanaf €95/mnd', 'Securitas Direct alarmsysteem', '24/7 camerabewaking', 'Standaard verzekerd', 'Tweewekelijkse controle'],
    color: 'bg-accent/10 text-accent',
  },
  {
    id: 'reparatie',
    icon: Wrench,
    title: 'Reparatie & Onderhoud',
    sub: 'Specialistisch onderhoud',
    desc: 'Van jaarlijkse onderhoudsbeurt tot complete reparaties. Onze ervaren monteurs hebben meer dan 20 jaar ervaring met alle merken en typen caravans.',
    features: ['Jaarlijkse technische keuring', 'Chassis onderhoud', 'Gasleidingen en elektra', 'Dakonderhoud en -reparatie', 'Interieur herstelwerk', 'Alle merken en typen'],
    color: 'bg-ocean/10 text-ocean',
  },
  {
    id: 'caravanrepair',
    icon: Sparkles,
    title: 'CaravanRepair®',
    sub: 'Masterdealer',
    desc: 'Als officieel CaravanRepair® Masterdealer gebruiken wij het gepatenteerde herstelsysteem voor wandreparaties. Levenslange garantie op wandherstel, onzichtbare resultaten.',
    features: ['Officieel Masterdealer', 'Gepatenteerd herstelsysteem', 'Levenslange garantie op wanden', 'Onzichtbare reparaties', 'Europees keurmerk', 'Hagelschade specialist'],
    color: 'bg-warning/10 text-warning',
    badge: 'Masterdealer',
  },
  {
    id: 'transport',
    icon: Truck,
    title: 'Transport',
    sub: '7 transporteenheden',
    desc: 'Met 7 eigen transporteenheden halen en brengen wij uw caravan door heel Europa. Van Nederland naar Spanje of onderling tussen campings aan de Costa Brava.',
    features: ['7 eigen transporteenheden', 'Door heel Europa', 'Ophalen bij uw thuis', 'Afleveren op camping', 'Gesloten transport mogelijk', 'Track & trace'],
    color: 'bg-primary/10 text-primary',
  },
  {
    id: 'verkoop',
    icon: ShoppingBag,
    title: 'Verkoop',
    sub: 'Tweedehands caravans',
    desc: 'Wij bemiddelen bij de verkoop van uw caravan of camper. Of zoek in ons aanbod van gebruikte, volledig nagekeken caravans die direct klaar staan voor gebruik in Spanje.',
    features: ['Verkoopbemiddeling', 'Gebruikte caravans op voorraad', 'Volledig nagekeken', 'Eerlijke taxatie', 'Administratieve afhandeling', 'Directe levering mogelijk'],
    color: 'bg-danger/10 text-danger',
  },
  {
    id: 'verhuur',
    icon: Bike,
    title: 'Verhuur',
    sub: 'Fietsen, koelkasten & airco',
    desc: 'Verhuur van hoogwaardige fietsen, koelkasten en mobiele airco\'s. Handige extra\'s voor uw verblijf aan de Costa Brava, direct leverbaar op uw terrein.',
    features: ['Elektrische fietsen', 'Stadsfietsen & kinderfietsen', 'Koelkasten (versch. formaten)', 'Mobiele airco-units', 'Bezorging op uw camping', 'Seizoens- of weekhuur'],
    color: 'bg-accent/10 text-accent',
  },
  {
    id: 'schoonmaak',
    icon: SprayCan,
    title: 'Schoonmaak',
    sub: 'Professionele reiniging',
    desc: 'Laat uw caravan professioneel reinigen voor of na het seizoen. Van basiswas tot complete interieur- en exterieurbehandeling.',
    features: ['Exterieur handwas', 'Interieur reiniging', 'Polishbehandeling', 'Anti-mos & alg behandeling', 'Dakbehandeling', 'Seizoensklaar pakket'],
    color: 'bg-ocean/10 text-ocean',
  },
];

export default function DienstenPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative bg-surface-dark text-white py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary/80 to-primary-dark" />
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4">Onze diensten</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] mb-6">
              Alles voor uw <span className="gradient-text">caravan</span>
            </h1>
            <p className="text-white/50 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Van veilige stalling tot verkoop, van transport tot het gepatenteerde CaravanRepair® systeem. Wij ontzorgen u volledig aan de Costa Brava.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="space-y-20 sm:space-y-28">
            {diensten.map((d, i) => (
              <A key={d.id}>
                <div id={d.id} className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${i % 2 === 1 ? 'lg:[direction:rtl]' : ''}`}>
                  <div className={i % 2 === 1 ? 'lg:[direction:ltr]' : ''}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 ${d.color} rounded-xl flex items-center justify-center`}>
                        <d.icon size={22} />
                      </div>
                      {d.badge && <span className="text-[10px] font-bold bg-accent/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider">{d.badge}</span>}
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black mb-2">{d.title}</h2>
                    <p className="text-primary font-bold text-sm mb-4">{d.sub}</p>
                    <p className="text-warm-gray leading-relaxed mb-8">{d.desc}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-8">
                      {d.features.map(f => (
                        <li key={f} className="flex items-center gap-2.5 text-sm"><CheckCircle size={14} className="text-success shrink-0" /> {f}</li>
                      ))}
                    </ul>
                    {d.id === 'stalling' ? (
                      <Link href="/stalling" className="bg-accent hover:bg-accent-dark text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2">
                        Bekijk stallingsopties <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <Link href="/contact" className="bg-surface-dark hover:bg-primary text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2">
                        Meer informatie <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                  <div className={`bg-surface rounded-2xl aspect-[4/3] flex items-center justify-center border border-sand-dark/[0.04] ${i % 2 === 1 ? 'lg:[direction:ltr]' : ''}`}>
                    <div className="text-center p-8">
                      <div className={`w-20 h-20 ${d.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                        <d.icon size={36} />
                      </div>
                      <p className="text-sm text-warm-gray font-medium">{d.title}</p>
                    </div>
                  </div>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* CaravanRepair® Badge */}
      <section className="py-16 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <A>
            <div className="bg-white rounded-2xl p-8 sm:p-12 border border-sand-dark/[0.06] text-center">
              <div className="flex items-center justify-center gap-2 mb-5">
                <Star className="text-primary" size={24} fill="currentColor" />
                <Star className="text-primary" size={24} fill="currentColor" />
                <Star className="text-primary" size={24} fill="currentColor" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-4">Officieel CaravanRepair® Masterdealer</h2>
              <p className="text-warm-gray max-w-xl mx-auto mb-6 leading-relaxed">
                Als één van de weinige Masterdealers in Europa bieden wij het gepatenteerde CaravanRepair® herstelsysteem aan. 
                Wandschade, hagelschade of vochtschade? Wij herstellen uw caravan onzichtbaar met levenslange garantie.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="bg-accent/8 text-primary text-xs font-bold px-4 py-2 rounded-full">Gepatenteerd systeem</span>
                <span className="bg-accent/8 text-primary text-xs font-bold px-4 py-2 rounded-full">Levenslange garantie</span>
                <span className="bg-accent/8 text-primary text-xs font-bold px-4 py-2 rounded-full">Europees keurmerk</span>
              </div>
            </div>
          </A>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface-dark relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center relative">
          <A>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Hulp nodig? Wij staan voor u klaar</h2>
            <p className="text-white/40 mb-8">Neem contact op voor een vrijblijvende offerte of meer informatie over onze diensten.</p>
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
