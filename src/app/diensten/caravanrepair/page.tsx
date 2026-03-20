'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Sparkles, CheckCircle, ArrowRight, HelpCircle, Shield, FileCheck, Zap, Award, Eye } from 'lucide-react';
import A from '@/components/AnimateIn';
import CtaSection from '@/components/CtaSection';
import PageHero from '@/components/PageHero';
import { FaqItem } from '@/components/FaqAccordion';
import QuizModal from '@/components/QuizModal';

const faqs = [
  { q: 'Wat is CaravanRepair® precies?', a: 'CaravanRepair® is het gepatenteerde schadeherstelsysteem voor geprofileerde buitenwanden. Deuken, barsten en vochtschade worden onzichtbaar hersteld zonder spuiten of verven. Als officieel Masterdealer bieden wij levenslange garantie. Alle verzekeraars erkennen dit systeem.' },
  { q: 'Welke schades kunnen jullie herstellen?', a: 'Wij herstellen alle schade aan geprofileerde caravan- en camperwanden: hagelschade, stormschade, aanrijdingsschade, parkeerschade, scheuren, deuken, vochtschade en krassen. Het resultaat is 100% onzichtbaar.' },
  { q: 'Hoe lang duurt een CaravanRepair® reparatie?', a: 'De meeste reparaties zijn binnen 2-5 werkdagen afgerond, afhankelijk van de omvang. Bij uitgebreide hagelschade kan het iets langer duren. Wij informeren u altijd vooraf over de planning.' },
  { q: 'Wordt de reparatie vergoed door mijn verzekering?', a: 'Ja. CaravanRepair® wordt erkend door alle Nederlandse en Europese verzekeraars. Wij verzorgen de volledige afhandeling met uw verzekeraar, inclusief schaderapportage, foto\'s en offertes. U hoeft alleen uw polisnummer door te geven.' },
  { q: 'Waarom geen complete wandvervanging?', a: 'Een complete wandvervanging is vaak onnodig, duurder en risicovol. Bij het vervangen van een wand kunnen nieuwe problemen ontstaan (lekkage bij naden). Het CaravanRepair® systeem biedt een duurzamer, sneller en voordeliger alternatief met levenslange garantie.' },
  { q: 'Wat is het verschil tussen Dealer en Masterdealer?', a: 'Een Masterdealer is het hoogste niveau binnen het CaravanRepair® netwerk. Wij hebben de meest uitgebreide training gevolgd en beschikken over de volledige gereedschapset. Hierdoor kunnen wij ook de meest complexe schades onzichtbaar herstellen.' },
];

export default function CaravanRepairPage() {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
      <Header />

      <PageHero
        badge="CaravanRepair® Masterdealer"
        title={<>Onzichtbaar schadeherstel met <span className="text-primary-light">levenslange garantie</span></>}
        subtitle="Als officieel CaravanRepair® Masterdealer herstellen wij alle schade aan geprofileerde caravan- en camperwanden volledig onzichtbaar. Erkend door alle verzekeraars."
        image="https://u.cubeupload.com/laurensbos/caravanstoragespain5.jpg"
      />

      {/* USP strip */}
      <section className="py-8 sm:py-10 bg-card border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { icon: Award, label: 'Masterdealer', sub: 'Hoogste niveau' },
              { icon: Shield, label: 'Levenslange garantie', sub: 'Op alle reparaties' },
              { icon: FileCheck, label: 'Alle verzekeraars', sub: 'Volledige afhandeling' },
              { icon: Zap, label: 'Onzichtbaar resultaat', sub: '100% onherkenbaar' },
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

      {/* Wat is CaravanRepair */}
      <section className="py-14 sm:py-24 bg-surface relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3">
                  <Award size={11} className="text-primary" />
                  <span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">Gepatenteerd systeem</span>
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold mb-4">Wat is CaravanRepair®?</h2>
                <p className="text-gray-500 leading-relaxed mb-4">
                  CaravanRepair® is de grootste keten van erkende caravan- en camperschadespecialisten in Nederland en Europa. Dankzij het gepatenteerde herstelsysteem zijn wij in staat om alle geprofileerde caravan- en camperwanden volledig onzichtbaar te herstellen.
                </p>
                <p className="text-gray-500 leading-relaxed mb-4">
                  Of het nu gaat om een kleine deuk, hagelschade, een scheur, vochtschade, krassen of schade door een aanrijding — het resultaat is 100% onzichtbaar. Waarom een complete zijwand vervangen als een reparatie volstaat?
                </p>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Caravanstalling Spanje is officieel <strong>CaravanRepair® Masterdealer</strong> — het hoogste niveau binnen het dealernetwerk. Wij hebben de meest uitgebreide training gevolgd en beschikken over de volledige gereedschapset.
                </p>
                <button onClick={() => setQuizOpen(true)} className="bg-primary hover:bg-primary-light text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20">
                  Schade melden <ArrowRight size={14} />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Sparkles, title: 'Onzichtbaar herstel', desc: 'Het gepatenteerde systeem garandeert dat reparaties aan geprofileerde wanden 100% onzichtbaar zijn. Geen verf, geen spuitwerk.' },
                  { icon: Shield, title: 'Levenslange garantie', desc: 'Op alle door ons uitgevoerde geprofileerde wandreparaties ontvangt u levenslange garantie.' },
                  { icon: FileCheck, title: 'Erkend door alle verzekeraars', desc: 'Wij verzorgen de complete afhandeling van uw schadeclaim. U hoeft alleen uw polisnummer door te geven.' },
                  { icon: Zap, title: 'Sneller & duurzamer', desc: 'Sneller dan een complete wandvervanging en levert een duurzamer resultaat op. Geen risico op nieuwe lekkages.' },
                ].map((f, i) => (
                  <A key={f.title} delay={i * 0.08}>
                    <div className="card-premium p-5">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center shrink-0">
                          <f.icon size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-sm mb-0.5">{f.title}</p>
                          <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                    </div>
                  </A>
                ))}
              </div>
            </div>
          </A>
        </div>
      </section>

      {/* Schades die wij herstellen */}
      <section className="py-14 sm:py-24 bg-card relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Schades die wij herstellen</h2>
            <p className="text-gray-500 text-sm">Alle geprofileerde wanden, onzichtbaar hersteld.</p>
          </A>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { title: 'Hagelschade', desc: 'Deuken en beschadigingen door hagel volledig onzichtbaar hersteld.' },
              { title: 'Stormschade', desc: 'Schade door zware wind, vallende takken of wegvliegende objecten.' },
              { title: 'Aanrijdingsschade', desc: 'Parkeer- en aanrijdingsschade aan zijwanden en achterzijde.' },
              { title: 'Vochtschade', desc: 'Lekkages en vochtschade aan geprofileerde wanden.' },
              { title: 'Scheuren & deuken', desc: 'Scheuren, barsten en deuken in de buitenwanden.' },
              { title: 'Krassen', desc: 'Oppervlakkige en diepe krassen aan de buitenzijde.' },
            ].map((s, i) => (
              <A key={s.title} delay={i * 0.08}>
                <div className="card-premium p-5 h-full">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Eye size={15} className="text-primary shrink-0" />
                    <h3 className="font-bold text-sm">{s.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* Proces */}
      <section className="py-14 sm:py-24 bg-surface relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Het herstelproces</h2>
            <p className="text-gray-500 text-sm">Van schademelding tot oplevering — wij nemen alles uit handen.</p>
          </A>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Schade melden', desc: 'Meld uw schade via telefoon, e-mail of het contactformulier. Stuur foto\'s mee als u die heeft.' },
              { step: '02', title: 'Inspectie & offerte', desc: 'Wij inspecteren de schade en stellen een gedetailleerde offerte op voor u en uw verzekeraar.' },
              { step: '03', title: 'Reparatie', desc: 'Onze gecertificeerde monteurs herstellen de schade onzichtbaar met het gepatenteerde systeem.' },
              { step: '04', title: 'Oplevering', desc: 'Controle, schoonmaak en oplevering. U ontvangt een garantiecertificaat.' },
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
      <section className="py-10 sm:py-14 bg-card border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">Bekijk ook</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/diensten/reparatie" className="card-premium px-5 py-3 text-sm font-medium hover:border-primary/30 transition-all">Reparatie & Onderhoud</Link>
            <Link href="/diensten/transport" className="card-premium px-5 py-3 text-sm font-medium hover:border-primary/30 transition-all">Transport</Link>
            <Link href="/stalling" className="card-premium px-5 py-3 text-sm font-medium hover:border-primary/30 transition-all">Stalling</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-24 bg-surface relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3"><HelpCircle size={11} className="text-primary" /><span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">Veelgestelde vragen</span></span>
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Vragen over CaravanRepair®?</h2>
          </A>
          <A>
            <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-gray-100 px-6 sm:px-8">
              {faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </A>
        </div>
      </section>

      <CtaSection title="Schade aan uw caravan?" subtitle="Meld uw schade en wij nemen alles uit handen — inclusief de verzekeringsafhandeling." primaryLabel="Schade melden" onPrimaryClick={() => setQuizOpen(true)} />

      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} source="diensten-caravanrepair" initialInterest="schadeherstel" />
      <Footer />
    </>
  );
}
