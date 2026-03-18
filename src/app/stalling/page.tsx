'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Shield, Thermometer, Camera, CheckCircle, ArrowRight, Lock, Eye, Sparkles, Truck, Phone } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

function A({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const v = useInView(ref, { once: true, margin: '-60px' });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={v ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }} className={className}>{children}</motion.div>;
}

export default function StallingPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative bg-surface-dark text-white py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary/80 to-primary-dark" />
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4">Caravanstalling</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] mb-6">
              Veilige stalling aan de <span className="gradient-text">Costa Brava</span>
            </h1>
            <p className="text-white/50 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Dé specialist in het veilig en betrouwbaar stallen van uw caravan in Sant Climent de Peralta. Securitas Direct bewaking, standaard verzekerd.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stalling types */}
      <section className="py-20 sm:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Stallingstypen</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Kies uw stallingtype</h2>
            <div className="section-divider mt-5" />
          </A>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: 'Buitenstalling', icon: Shield, price: '65',
                desc: 'Veilige buitenstalling op ons afgesloten en beveiligd terrein. Ideaal voor seizoensstalling van uw caravan, camper of boot.',
                features: ['Afgesloten terrein', '24/7 camerabewaking', 'Securitas Direct alarm', 'Standaard verzekerd', 'Tweewekelijkse controle', 'Jaarlijkse technische keuring'],
                tag: 'Populair', gradient: 'bg-accent/10 text-accent'
              },
              {
                title: 'Binnenstalling (Overdekt)', icon: Thermometer, price: '95',
                desc: 'Overdekte parkeerplaatsen in geïsoleerde hal voor extra bescherming tegen zon, regen en temperatuurschommelingen.',
                features: ['Geïsoleerde hal', 'Bescherming tegen weer', 'Geen hitte of koude', 'Alle voordelen buitenstalling', 'Beperkte beschikbaarheid', 'Premium locatie'],
                tag: 'Premium', gradient: 'bg-ocean/10 text-ocean'
              },
            ].map((t, i) => (
              <A key={t.title} delay={i * 0.12}>
                <div className="relative bg-surface rounded-2xl p-8 sm:p-10 border border-sand-dark/[0.06] card-hover h-full">
                  {t.tag && <span className="absolute top-6 right-6 bg-accent/8 text-primary text-[10px] font-bold px-3 py-1 rounded-full">{t.tag}</span>}
                  <div className={`w-14 h-14 ${t.gradient} rounded-xl flex items-center justify-center mb-6`}>
                    <t.icon size={24} />
                  </div>
                  <h2 className="text-2xl font-black mb-3">{t.title}</h2>
                  <p className="text-warm-gray mb-6 leading-relaxed">{t.desc}</p>
                  <ul className="space-y-2.5 mb-8">
                    {t.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm"><CheckCircle size={14} className="text-success shrink-0" /> {f}</li>
                    ))}
                  </ul>
                  <div className="flex items-end gap-1 mb-6">
                    <span className="text-sm text-warm-gray">Vanaf</span>
                    <span className="text-4xl font-black">€{t.price}</span>
                    <span className="text-warm-gray text-sm">/maand</span>
                  </div>
                  <Link href="/contact" className="w-full bg-accent hover:bg-accent-dark text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-sm">
                    Stalling aanvragen <ArrowRight size={14} />
                  </Link>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-20 sm:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Beveiliging</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Veiligheid staat voorop</h2>
            <div className="section-divider mt-5" />
          </A>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Lock, title: 'Securitas Direct', desc: 'Professioneel alarmsysteem met directe alarmopvolging bij ongeautoriseerde toegang.' },
              { icon: Camera, title: '24/7 Camerabewaking', desc: 'Geavanceerd camerasysteem met continue registratie van alle bewegingen op het terrein.' },
              { icon: Shield, title: 'Standaard verzekerd', desc: 'Uw caravan is op onze stalling standaard verzekerd tegen schade en diefstal.' },
            ].map((f, i) => (
              <A key={f.title} delay={i * 0.1}>
                <div className="bg-surface rounded-2xl p-7 text-center border border-sand-dark/[0.04] card-hover h-full">
                  <div className="w-14 h-14 bg-surface-dark/[0.04] rounded-xl flex items-center justify-center mx-auto mb-5">
                    <f.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-bold text-[17px] mb-2">{f.title}</h3>
                  <p className="text-sm text-warm-gray leading-relaxed">{f.desc}</p>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* Spot System */}
      <section className="py-20 sm:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="text-center lg:text-left">
                <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Organisatie</p>
                <h2 className="text-3xl sm:text-4xl font-black mb-6">Pleknummersysteem</h2>
                <div className="section-divider mt-0 mb-6 mx-auto lg:mx-0" />
                <p className="text-warm-gray mb-6 leading-relaxed">Elke caravan krijgt een eigen, vaste plek met een uniek pleknummer. Zo weet u altijd precies waar uw caravan staat en plannen wij efficiënt werk.</p>
                <p className="text-warm-gray mb-8 leading-relaxed">In uw klantportaal kunt u uw pleknummer, contractstatus en inspecties altijd online inzien.</p>
                <div className="space-y-3 text-left max-w-sm mx-auto lg:mx-0">
                  {['Zones A-D: Buitenstalling', 'Zone H: Binnenstalling (overdekt)', 'Zone S: Seizoensstalling'].map(z => (
                    <div key={z} className="flex items-center gap-3 text-sm"><CheckCircle size={14} className="text-success shrink-0" /><span className="font-medium">{z}</span></div>
                  ))}
                </div>
              </div>
              <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-sand-dark/[0.04]">
                <div className="grid grid-cols-4 gap-2">
                  {['A-001','A-002','A-003','A-004','A-005','A-006','A-007','A-008','B-001','B-002','B-003','B-004','H-001','H-002','H-003','H-004'].map((spot, i) => {
                    const c = i < 8 ? (i % 3 === 0 ? 'bg-accent/15 text-accent-dark' : i % 3 === 1 ? 'bg-ocean/15 text-ocean-dark' : 'bg-warning/15 text-warning') : i < 12 ? 'bg-accent/15 text-accent-dark' : 'bg-ocean/15 text-ocean-dark';
                    return <div key={spot} className={`${c} rounded-xl p-3 text-center text-xs font-bold`}>{spot}</div>;
                  })}
                </div>
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-sand-dark/[0.04]">
                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-warm-gray"><span className="w-2.5 h-2.5 bg-accent rounded-full" /> Vrij</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-warm-gray"><span className="w-2.5 h-2.5 bg-ocean rounded-full" /> Bezet</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-warm-gray"><span className="w-2.5 h-2.5 bg-warning rounded-full" /> Gereserveerd</span>
                </div>
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
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Wilt u uw caravan bij ons stallen?</h2>
            <p className="text-white/40 mb-8">Neem contact op voor meer informatie of vraag direct een plek aan.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/contact" className="bg-accent hover:bg-accent-dark text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all inline-flex items-center gap-2 shadow-sm">
                Stalling aanvragen <ArrowRight size={15} />
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
