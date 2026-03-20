'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Wrench, CheckCircle, ArrowRight, HelpCircle, Clock, Shield, Zap, Settings, Thermometer, Droplets, Lightbulb, Cog } from 'lucide-react';
import A from '@/components/AnimateIn';
import CtaSection from '@/components/CtaSection';
import PageHero from '@/components/PageHero';
import { FaqItem } from '@/components/FaqAccordion';
import QuizModal from '@/components/QuizModal';

const faqs = [
  { q: 'Welke reparaties kunnen jullie uitvoeren?', a: 'Wij voeren vrijwel alle reparaties uit: remmen, banden, verlichting, gasinstallatie, waterleiding, dakluiken, ramen, vloer, elektra en carrosserie. Van kleine klussen tot complete renovaties. Onze werkplaats is volledig uitgerust voor alle merken caravans en campers.' },
  { q: 'Hoe snel kunnen reparaties worden uitgevoerd?', a: 'Kleine reparaties (bandenwissel, lampen, simpele lekkages) voeren wij meestal dezelfde dag of volgende dag uit. Grotere reparaties plannen wij in overleg met u in. U ontvangt altijd vooraf een tijdsinschatting.' },
  { q: 'Moet mijn caravan bij jullie gestald staan voor reparaties?', a: 'Nee, wij repareren ook caravans die elders gestald staan of op een camping in de regio staan. Neem contact op en wij plannen de werkzaamheden in.' },
  { q: 'Werken jullie met alle merken?', a: 'Ja, onze werkplaats is uitgerust voor alle merken en typen caravans en campers. Of het nu een Hobby, Fendt, Knaus, Adria, Dethleffs of een ander merk betreft — wij helpen u.' },
  { q: 'Krijg ik een offerte vooraf?', a: 'Ja, bij grotere reparaties ontvangt u altijd eerst een offerte. Wij bespreken samen het werk, de kosten en de planning. Bij kleinere werkzaamheden geven wij vooraf een indicatie van de kosten.' },
  { q: 'Kan de verzekering de reparatie dekken?', a: 'Bij schade door storm, hagel of aanrijding kan uw verzekering de kosten dekken. Wij helpen u met de schaderapportage en afhandeling. Neem contact op en wij adviseren u over de mogelijkheden.' },
];

const reparaties = [
  { icon: Cog, title: 'Remmen & chassis', items: ['Remrevisie & remleidingen', 'Chassiscontrole & reparatie', 'Koppeling en trekhaak', 'Wielophanging'] },
  { icon: Settings, title: 'Banden & wielen', items: ['Banden wisselen & uitlijnen', 'Wiellagering', 'Reservewielbeugel', 'Bandendrukcontrole'] },
  { icon: Zap, title: 'Elektra & verlichting', items: ['Complete bekabeling', 'Achterlichten & richtingaanwijzers', 'Binnenverlichting', '12V & 230V systemen'] },
  { icon: Thermometer, title: 'Gas & verwarming', items: ['Gasinstallatie keuring', 'Boiler & verwarming', 'Gasslangen & leidingen', 'Koelkast op gas'] },
  { icon: Droplets, title: 'Water & sanitair', items: ['Waterleiding & kranen', 'Toilet & cassette', 'Boileronderhoud', 'Lekkageopsporing'] },
  { icon: Lightbulb, title: 'Interieur & exterieur', items: ['Dakluiken & ramen', 'Vloer & meubels', 'Luifels & markiezen', 'Deur- & slotmechanismen'] },
];

export default function ReparatiePage() {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
      <Header />

      <PageHero
        badge="Reparatie & Onderhoud"
        title={<>Complete werkplaats voor <span className="text-primary-light">alle merken</span></>}
        subtitle="Heeft u pech met uw caravan aan de Costa Brava? Of wilt u uw caravan laten checken voor het volgende seizoen? Onze goed uitgeruste werkplaats helpt u met alle reparaties en onderhoudswerkzaamheden."
        image="https://u.cubeupload.com/laurensbos/caravanstoragespain5.jpg"
      />

      {/* Intro */}
      <section className="py-14 sm:py-24 bg-card relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-ocean/8 rounded-full px-3 py-1 mb-3">
                  <Wrench size={11} className="text-ocean" />
                  <span className="text-ocean text-xs font-bold tracking-[0.15em] uppercase">Werkplaats</span>
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold mb-4">Alles onder één dak</h2>
                <p className="text-gray-500 leading-relaxed mb-4">
                  Wij besteden het hele jaar door aandacht aan uw caravan. Naast de technische aspecten zoals banden, remmen en verlichting verzorgen wij ook reparaties aan het interieur en exterieur. Alle merken en typen caravans zijn welkom.
                </p>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Ons team van ervaren monteurs kent de meest voorkomende problemen van binnenuit. Van het wisselen van banden tot remrevisies, van dakluiken en ramen tot de airconditioning — wij lossen het snel en vakkundig op.
                </p>
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2 text-sm"><Clock size={15} className="text-primary" /> <span className="font-medium">Snel geholpen</span></div>
                  <div className="flex items-center gap-2 text-sm"><Shield size={15} className="text-primary" /> <span className="font-medium">Alle merken</span></div>
                  <div className="flex items-center gap-2 text-sm"><Wrench size={15} className="text-primary" /> <span className="font-medium">Eigen werkplaats</span></div>
                </div>
                <button onClick={() => setQuizOpen(true)} className="bg-ocean hover:bg-ocean/90 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2 cursor-pointer">
                  Reparatie aanvragen <ArrowRight size={14} />
                </button>
              </div>
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <Image src="https://u.cubeupload.com/laurensbos/caravanstoragespain5.jpg" alt="Werkplaats reparatie en onderhoud" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-xs font-medium bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg inline-block">Goed uitgeruste werkplaats · Alle merken</p>
                </div>
              </div>
            </div>
          </A>
        </div>
      </section>

      {/* Reparatie categorieën */}
      <section className="py-14 sm:py-24 bg-surface relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Wat wij repareren</h2>
            <p className="text-gray-500 text-sm">Van kleine klussen tot complete renovaties — onze werkplaats is volledig uitgerust.</p>
          </A>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {reparaties.map((r, i) => (
              <A key={r.title} delay={i * 0.08}>
                <div className="card-premium p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-ocean/10 rounded-xl flex items-center justify-center">
                      <r.icon size={18} className="text-ocean" />
                    </div>
                    <h3 className="font-bold">{r.title}</h3>
                  </div>
                  <div className="space-y-2">
                    {r.items.map(item => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle size={13} className="text-success shrink-0" /> {item}
                      </div>
                    ))}
                  </div>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* Proces */}
      <section className="py-14 sm:py-24 bg-card relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Hoe het werkt</h2>
            <p className="text-gray-500 text-sm">Van eerste contact tot afgeleverde caravan — wij houden u op de hoogte.</p>
          </A>

          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Contact', desc: 'U meldt uw probleem via telefoon, e-mail of het klantportaal.' },
              { step: '02', title: 'Inspectie', desc: 'Wij bekijken de caravan en stellen een diagnose.' },
              { step: '03', title: 'Offerte', desc: 'U ontvangt een offerte met kosten en planning.' },
              { step: '04', title: 'Reparatie', desc: 'Wij voeren de werkzaamheden uit en informeren u bij oplevering.' },
            ].map((s, i) => (
              <A key={s.step} delay={i * 0.1}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">{s.step}</div>
                  <h3 className="font-bold text-sm mb-1">{s.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
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
            <Link href="/diensten/caravanrepair" className="card-premium px-5 py-3 text-sm font-medium hover:border-primary/30 transition-all">CaravanRepair® schadeherstel</Link>
            <Link href="/diensten/transport" className="card-premium px-5 py-3 text-sm font-medium hover:border-primary/30 transition-all">Transport</Link>
            <Link href="/stalling" className="card-premium px-5 py-3 text-sm font-medium hover:border-primary/30 transition-all">Stalling</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-24 bg-card relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3"><HelpCircle size={11} className="text-primary" /><span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">Veelgestelde vragen</span></span>
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Vragen over reparatie?</h2>
          </A>
          <A>
            <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-gray-100 px-6 sm:px-8">
              {faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </A>
        </div>
      </section>

      <CtaSection title="Reparatie nodig?" subtitle="Neem contact op voor een vrijblijvende offerte. Wij helpen u snel en vakkundig." primaryLabel="Reparatie aanvragen" onPrimaryClick={() => setQuizOpen(true)} />

      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} source="diensten-reparatie" initialInterest="reparatie" />
      <Footer />
    </>
  );
}
