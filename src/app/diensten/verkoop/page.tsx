'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ShoppingBag, CheckCircle, ArrowRight, HelpCircle, FileCheck, Shield, Eye, Wrench } from 'lucide-react';
import A from '@/components/AnimateIn';
import CtaSection from '@/components/CtaSection';
import PageHero from '@/components/PageHero';
import { FaqItem } from '@/components/FaqAccordion';
import QuizModal from '@/components/QuizModal';

const faqs = [
  { q: 'Welke caravans verkopen jullie?', a: 'Wij verkopen tweedehands caravans die in goede staat verkeren en klaarstaan in Spanje. Het aanbod wisselt regelmatig. Neem contact op voor het actuele aanbod.' },
  { q: 'Zijn de caravans gecontroleerd?', a: 'Ja, elke occasion wordt door onze werkplaats nagekeken op technische staat, banden, remmen, elektra en gasinstallatie. Wij zijn eerlijk over de staat en eventueel benodigde reparaties.' },
  { q: 'Kan ik mijn eigen caravan via jullie verkopen?', a: 'Ja, wij verzorgen verkoopbemiddeling. Van taxatie en foto\'s tot de administratieve afhandeling. De caravan hoeft niet bij ons gestald te staan, maar dat is wel een voordeel.' },
  { q: 'Waarom een caravan in Spanje kopen?', a: 'Een caravan die al in Spanje staat bespaart u duizenden euro\'s aan transportkosten. U kunt direct op vakantie zonder eerst 3.000 km te rijden. Bovendien staan de caravans in het milde Spaanse klimaat, waardoor ze minder te lijden hebben van vorst en strooizout.' },
  { q: 'Kan ik de caravan bezichtigen?', a: 'Ja, u bent van harte welkom op ons terrein in Sant Climent de Peralta. Maak een afspraak en wij tonen u de caravans die beschikbaar zijn. Wij adviseren u eerlijk over welk model bij uw wensen past.' },
];

const aanbod = [
  { model: 'Hobby Prestige 650', year: '2002', beds: '5 slaapplaatsen', price: '€ 6.000' },
  { model: 'HomeCar 450 Racer', year: '2003', beds: '4 slaapplaatsen', price: '€ 6.750' },
  { model: 'Knaus Sport', year: '1997', beds: '4 slaapplaatsen', price: '€ 5.250' },
  { model: 'Adria 430 Unica', year: '2001', beds: '4 slaapplaatsen', price: '€ 5.250' },
];

export default function VerkoopPage() {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
      <Header />

      <PageHero
        badge="Verkoop"
        title={<>Tweedehands caravans <span className="text-primary-light">in Spanje</span></>}
        subtitle="Op zoek naar een betaalbare caravan voor uw vakantie? Wij verkopen gecontroleerde tweedehands caravans die direct klaarstaan aan de Costa Brava. Geen transportkosten, direct op vakantie."
        image="https://u.cubeupload.com/laurensbos/caravanstoragespain2.jpg"
      />

      {/* Intro */}
      <section className="py-14 sm:py-24 bg-card relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3">
                  <ShoppingBag size={11} className="text-primary" />
                  <span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">Occasion</span>
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold mb-4">Direct klaar in Spanje</h2>
                <p className="text-gray-500 leading-relaxed mb-4">
                  Op zoek naar een betaalbare caravan voor uw vakantie in Spanje? Wij verkopen gecontroleerde tweedehands caravans die direct klaarstaan voor gebruik aan de Costa Brava. Geen gedoe met transport vanuit Nederland — uw caravan staat al in Spanje.
                </p>
                <p className="text-gray-500 leading-relaxed mb-4">
                  Elke occasion caravan wordt door onze werkplaats nagekeken op technische staat, banden, remmen, elektra en gasinstallatie. Wij geven u eerlijk advies over de staat en eventueel benodigde reparaties.
                </p>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Met meer dan 20 jaar ervaring helpen wij ook onervaren kampeerders het perfecte model te vinden.
                </p>

                <div className="space-y-2 mb-8">
                  {[
                    'Volledig nagekeken door onze werkplaats',
                    'Eerlijke taxatie en transparante prijzen',
                    'Caravan staat al in Spanje — geen transportkosten',
                    'Verkoopbemiddeling voor uw eigen caravan',
                    'Administratieve afhandeling door ons geregeld',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm"><CheckCircle size={14} className="text-success shrink-0" /> {f}</div>
                  ))}
                </div>

                <button onClick={() => setQuizOpen(true)} className="bg-primary hover:bg-primary-light text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2 cursor-pointer">
                  Meer informatie <ArrowRight size={14} />
                </button>
              </div>

              {/* Aanbod */}
              <div className="bg-primary/5 rounded-2xl p-8 border border-gray-200">
                <h3 className="font-bold text-lg mb-2">Huidig aanbod</h3>
                <p className="text-sm text-gray-500 mb-4">Enkele voorbeelden uit ons wisselend aanbod:</p>
                <div className="space-y-3">
                  {aanbod.map(c => (
                    <div key={c.model} className="flex items-center justify-between p-3 bg-card rounded-xl border border-gray-200">
                      <div>
                        <p className="text-sm font-bold">{c.model}</p>
                        <p className="text-xs text-gray-500">{c.year} · {c.beds}</p>
                      </div>
                      <span className="text-sm font-bold text-primary">{c.price}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">Aanbod wijzigt regelmatig. Neem contact op voor actuele beschikbaarheid.</p>
              </div>
            </div>
          </A>
        </div>
      </section>

      {/* Waarom kopen in Spanje */}
      <section className="py-14 sm:py-24 bg-surface relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Waarom kopen in Spanje?</h2>
            <p className="text-gray-500 text-sm">De voordelen van een caravan die al op locatie staat.</p>
          </A>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ShoppingBag, title: 'Geen transportkosten', desc: 'Bespaar duizenden euro\'s aan transport. De caravan staat al in Spanje.' },
              { icon: Shield, title: 'Werkplaats gecontroleerd', desc: 'Elke caravan wordt volledig nagekeken door onze eigen werkplaats.' },
              { icon: Eye, title: 'Eerlijk advies', desc: 'Wij zijn transparant over de staat en adviseren u eerlijk over uw aankoop.' },
              { icon: FileCheck, title: 'Administratie geregeld', desc: 'Van overschrijving tot papierwerk — wij regelen alles voor u.' },
              { icon: Wrench, title: 'Reparaties indien nodig', desc: 'Eventuele reparaties voeren wij direct uit in onze eigen werkplaats.' },
              { icon: ShoppingBag, title: 'Verkoopbemiddeling', desc: 'Wilt u uw caravan verkopen? Wij verzorgen de complete verkoopbemiddeling.' },
            ].map((item, i) => (
              <A key={item.title} delay={i * 0.08}>
                <div className="card-premium p-5 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <item.icon size={18} className="text-primary" />
                    </div>
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
      <section className="py-10 sm:py-14 bg-card border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">Bekijk ook</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/stalling" className="card-premium px-5 py-3 text-sm font-medium hover:border-primary/30 transition-all">Stalling</Link>
            <Link href="/diensten/reparatie" className="card-premium px-5 py-3 text-sm font-medium hover:border-primary/30 transition-all">Reparatie & Onderhoud</Link>
            <Link href="/diensten/verhuur" className="card-premium px-5 py-3 text-sm font-medium hover:border-primary/30 transition-all">Verhuur</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-24 bg-surface relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3"><HelpCircle size={11} className="text-primary" /><span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">Veelgestelde vragen</span></span>
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Vragen over verkoop?</h2>
          </A>
          <A>
            <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-gray-100 px-6 sm:px-8">
              {faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </A>
        </div>
      </section>

      <CtaSection title="Interesse in een tweedehands caravan?" subtitle="Neem contact op voor het actuele aanbod of maak een afspraak voor een bezichtiging." primaryLabel="Contact opnemen" onPrimaryClick={() => setQuizOpen(true)} />

      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} source="diensten-verkoop" initialInterest="verkoop" />
      <Footer />
    </>
  );
}
