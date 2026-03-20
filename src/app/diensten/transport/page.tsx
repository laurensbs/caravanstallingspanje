'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Truck, CheckCircle, ArrowRight, HelpCircle, MapPin, Users, Shield, Eye, Clock } from 'lucide-react';
import A from '@/components/AnimateIn';
import CtaSection from '@/components/CtaSection';
import PageHero from '@/components/PageHero';
import { FaqItem } from '@/components/FaqAccordion';
import QuizModal from '@/components/QuizModal';

const faqs = [
  { q: 'Hoe werkt het transport van Nederland naar Spanje?', a: 'Wij beschikken over 7 eigen transporteenheden. Wij halen uw caravan op in Nederland, België of Duitsland en leveren hem af op onze stalling of rechtstreeks op uw camping aan de Costa Brava. Retour is natuurlijk ook mogelijk. Neem contact op voor een offerte.' },
  { q: 'Hoe lang duurt het transport?', a: 'Transport vanuit Nederland of Duitsland duurt gemiddeld 2 dagen. Vanuit België circa 1,5 dag. Regionaal transport (camping-stalling) wordt meestal dezelfde dag afgehandeld.' },
  { q: 'Is mijn caravan verzekerd tijdens het transport?', a: 'Ja, uw caravan is volledig verzekerd tijdens het transport. Onze chauffeurs zijn ervaren en controleren uw caravan voorafgaand aan het transport op banden, verlichting en koppeling.' },
  { q: 'Kan ik ook transport tussen campings boeken?', a: 'Zeker. Wij verplaatsen uw caravan ook van de ene camping naar de andere binnen de Costa Brava-regio. Dit wordt meestal dezelfde dag afgehandeld.' },
  { q: 'Wanneer is het drukste seizoen voor transport?', a: 'De drukste maanden zijn april-mei (aanvoer naar campings) en september-oktober (retour naar stalling of Nederland). Boek tijdig om er zeker van te zijn dat uw gewenste datum beschikbaar is.' },
  { q: 'Hoe wordt mijn caravan voorbereid op transport?', a: 'Wij controleren banden, verlichting, koppeling en verankering. Losse items worden vastgezet, luifels ingenomen en dakluiken gesloten. Uw caravan wordt rijklaar en veilig afgeleverd.' },
];

const routes = [
  { route: 'Nederland → Costa Brava', time: '± 2 dagen', popular: true },
  { route: 'België → Costa Brava', time: '± 1,5 dag', popular: true },
  { route: 'Duitsland → Costa Brava', time: '± 2 dagen', popular: false },
  { route: 'Camping → Stalling (regionaal)', time: 'Zelfde dag', popular: false },
  { route: 'Stalling → Camping (regionaal)', time: 'Zelfde dag', popular: true },
  { route: 'Costa Brava → Nederland (retour)', time: '± 2 dagen', popular: false },
];

export default function TransportPage() {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
      <Header />

      <PageHero
        badge="Transport"
        title={<>Caravantransport door <span className="text-primary-light">heel Europa</span></>}
        subtitle="Met 7 eigen transporteenheden en circa 12 medewerkers in het seizoen bezorgen en halen wij uw caravan op in Nederland, België, Duitsland en heel de Costa Brava."
        image="https://u.cubeupload.com/laurensbos/caravanstoragespain3.jpg"
      />

      {/* USP strip */}
      <section className="py-8 sm:py-10 bg-card border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { icon: Truck, label: '7 transporteenheden', sub: 'Eigen wagenpark' },
              { icon: Users, label: '12 medewerkers', sub: 'In het seizoen' },
              { icon: MapPin, label: 'Door heel Europa', sub: 'NL, BE, DE, ES' },
              { icon: Shield, label: 'Verzekerd transport', sub: 'Volledig gedekt' },
            ].map((u, i) => (
              <A key={u.label} delay={i * 0.08}>
                <div className="text-center">
                  <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <u.icon size={18} className="text-primary" />
                  </div>
                  <p className="text-sm font-bold">{u.label}</p>
                  <p className="text-xs text-gray-500">{u.sub}</p>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* Intro + routes */}
      <section className="py-14 sm:py-24 bg-surface relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3">
                  <Truck size={11} className="text-primary" />
                  <span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">7 eenheden</span>
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold mb-4">Veilig en betrouwbaar transport</h2>
                <p className="text-gray-500 leading-relaxed mb-4">
                  In het seizoen werken wij met een wagenpark van 7 transporteenheden en circa 12 medewerkers om alle caravans op gezette tijden op de camping af te leveren en weer op te halen. Of u nu uw caravan vanuit Nederland naar Spanje wilt laten brengen of tussen campings aan de Costa Brava wilt verplaatsen — wij regelen het.
                </p>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Uw caravan wordt door ervaren chauffeurs veilig getransporteerd. Wij bereiden uw caravan voor op het transport, controleren de banden, verlichting en koppeling, en leveren hem rijklaar af op de gewenste locatie.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { icon: Truck, label: '7 eigen transporteenheden' },
                    { icon: Users, label: '12 medewerkers in seizoen' },
                    { icon: MapPin, label: 'Door heel Europa' },
                    { icon: Shield, label: 'Verzekerd transport' },
                    { icon: Clock, label: 'Ophalen & afleveren' },
                    { icon: Eye, label: 'Vooraf gecontroleerd' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-2.5 text-sm"><f.icon size={14} className="text-primary shrink-0" /> {f.label}</div>
                  ))}
                </div>

                <button onClick={() => setQuizOpen(true)} className="bg-primary hover:bg-primary-light text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2 cursor-pointer">
                  Transport aanvragen <ArrowRight size={14} />
                </button>
              </div>

              <div className="bg-primary/5 rounded-2xl p-8 border border-gray-200">
                <h3 className="font-bold text-lg mb-4">Veelgevraagde routes</h3>
                <div className="space-y-3">
                  {routes.map(r => (
                    <div key={r.route} className="flex items-center justify-between p-3 bg-card rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{r.route}</span>
                        {r.popular && <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">Populair</span>}
                      </div>
                      <span className="text-xs text-primary font-bold">{r.time}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">Tarieven op aanvraag. Afhankelijk van afstand en type voertuig.</p>
              </div>
            </div>
          </A>
        </div>
      </section>

      {/* Voorbereiding */}
      <section className="py-14 sm:py-24 bg-card relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Hoe wij uw caravan voorbereiden</h2>
            <p className="text-gray-500 text-sm">Voordat uw caravan op transport gaat, doorlopen wij een vaste checklist.</p>
          </A>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Banden controleren', desc: 'Bandenspanning en profiel worden gecontroleerd. Bij slijtage adviseren wij vervanging.' },
              { title: 'Verlichting testen', desc: 'Alle achterlichten, richtingaanwijzers en remlichten worden getest.' },
              { title: 'Koppeling inspecteren', desc: 'Trekkoppeling en veiligheidskabels worden gecontroleerd en gesmeerd.' },
              { title: 'Luifels & dakluiken', desc: 'Alle luifels worden ingenomen en dakluiken stevig gesloten.' },
              { title: 'Losse items vastzetten', desc: 'Alle losse items in de caravan worden vastgezet of verwijderd.' },
              { title: 'Verankering controleren', desc: 'De caravan wordt stevig verankerd op de transporteenheid.' },
            ].map((item, i) => (
              <A key={item.title} delay={i * 0.08}>
                <div className="card-premium p-5 h-full">
                  <div className="flex items-center gap-2.5 mb-2">
                    <CheckCircle size={15} className="text-success shrink-0" />
                    <h3 className="font-bold text-sm">{item.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* Andere diensten */}
      <section className="py-10 sm:py-14 bg-surface border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">Bekijk ook</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/stalling" className="card-premium px-5 py-3 text-sm font-medium hover:border-primary/30 transition-all">Stalling</Link>
            <Link href="/diensten/reparatie" className="card-premium px-5 py-3 text-sm font-medium hover:border-primary/30 transition-all">Reparatie & Onderhoud</Link>
            <Link href="/diensten/caravanrepair" className="card-premium px-5 py-3 text-sm font-medium hover:border-primary/30 transition-all">CaravanRepair®</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-24 bg-card relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3"><HelpCircle size={11} className="text-primary" /><span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">Veelgestelde vragen</span></span>
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Vragen over transport?</h2>
          </A>
          <A>
            <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-gray-100 px-6 sm:px-8">
              {faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </A>
        </div>
      </section>

      <CtaSection title="Transport nodig?" subtitle="Neem contact op voor een offerte. Wij regelen het transport van deur tot deur." primaryLabel="Transport aanvragen" onPrimaryClick={() => setQuizOpen(true)} />

      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} source="diensten-transport" initialInterest="transport" />
      <Footer />
    </>
  );
}
