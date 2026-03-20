'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Bike, CheckCircle, ArrowRight, HelpCircle, ThermometerSnowflake, Wind } from 'lucide-react';
import A from '@/components/AnimateIn';
import CtaSection from '@/components/CtaSection';
import PageHero from '@/components/PageHero';
import { FaqItem } from '@/components/FaqAccordion';
import QuizModal from '@/components/QuizModal';

const faqs = [
  { q: 'Kan ik een fiets of koelkast huren?', a: 'Ja, wij verhuren elektrische fietsen (€65/week), koelkasten (€120/seizoen) en mobiele airco-units (€85/week). Ideaal als aanvulling bij uw vakantie aan de Costa Brava.' },
  { q: 'Worden de verhuurartikelen bezorgd op mijn camping?', a: 'Ja, wij bezorgen en halen op bij campings in de Costa Brava-regio. De bezorgkosten zijn bij de meeste artikelen inbegrepen.' },
  { q: 'Hoe lang kan ik een fiets huren?', a: 'U kunt fietsen huren per dag, per week of voor het hele seizoen. De meest populaire optie is wekelijks. Neem contact op voor de exacte tarieven.' },
  { q: 'In welke staat zijn de verhuurartikelen?', a: 'Al onze verhuurartikelen worden regelmatig onderhouden en gecontroleerd. Fietsen worden voor elke verhuur nagekeken op banden, remmen en versnelling. Koelkasten en airco-units worden schoongemaakt en getest.' },
  { q: 'Kan ik items reserveren voor het seizoen?', a: 'Ja, wij raden aan om populaire items zoals elektrische fietsen en koelkasten tijdig te reserveren, vooral voor het hoogseizoen (juli-augustus). U kunt reserveren via telefoon, e-mail of het klantportaal.' },
];

const verhuurItems = [
  {
    icon: Bike,
    title: 'Fietsen huren',
    desc: 'Ontdek de Costa Brava op uw eigen tempo. Wij verhuren stadsfietsen, mountainbikes en elektrische fietsen. Ideaal om de prachtige kustlijn, het achterland en de mooie dorpjes te verkennen. Levering en ophalen op uw camping mogelijk.',
    features: ['Elektrische fietsen', 'Stadsfietsen & mountainbikes', 'Kinderfietsen beschikbaar', 'Bezorging op camping'],
    price: 'Vanaf €65/week',
    color: 'bg-accent/10 text-accent',
  },
  {
    icon: ThermometerSnowflake,
    title: 'Koelkast huren',
    desc: 'Een koelkast huren is voordeliger dan er één kopen en meenemen. Wij verhuren koelkasten in verschillende formaten, in prima staat. Bespaart u transport en opslag. Levering en ophalen op uw vakantieadres.',
    features: ['Verschillende formaten', 'Seizoensverhuur mogelijk', 'In uitstekende staat', 'Bezorging inbegrepen'],
    price: '€120/seizoen',
    color: 'bg-ocean/10 text-ocean',
  },
  {
    icon: Wind,
    title: 'Airco huren',
    desc: 'Geniet van koelere temperaturen tijdens warme zomerdagen. Onze mobiele airco-units zijn betrouwbaar, energiezuinig en eenvoudig te bedienen. Huur nu en geniet van een comfortabele vakantie.',
    features: ['Mobiele units', 'Energiezuinig', 'Eenvoudig te bedienen', 'Week- of seizoensverhuur'],
    price: 'Vanaf €85/week',
    color: 'bg-warning/10 text-warning',
  },
];

export default function VerhuurPage() {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
      <Header />

      <PageHero
        badge="Verhuur"
        title={<>Fietsen, koelkasten &amp; <span className="text-primary-light">airco verhuur</span></>}
        subtitle="Extra's voor uw verblijf aan de Costa Brava. Direct leverbaar op uw camping. Elektrische fietsen, koelkasten en mobiele airco-units."
        image="https://u.cubeupload.com/laurensbos/caravanstoragespain3.jpg"
      />

      {/* Verhuur items */}
      <section className="py-14 sm:py-24 bg-card relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Wat kunt u huren?</h2>
            <p className="text-gray-500 leading-relaxed text-sm">Direct leverbaar op uw camping aan de Costa Brava.</p>
          </A>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {verhuurItems.map((v, i) => (
              <A key={v.title} delay={i * 0.1}>
                <div className="card-premium p-7 h-full flex flex-col">
                  <div className={`w-12 h-12 ${v.color} rounded-xl flex items-center justify-center mb-5`}>
                    <v.icon size={22} />
                  </div>
                  <h3 className="font-bold text-lg mb-3">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{v.desc}</p>
                  <div className="space-y-2 mb-5">
                    {v.features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-xs"><CheckCircle size={12} className="text-success shrink-0" /> {f}</div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm font-bold text-primary">{v.price}</p>
                    <button onClick={() => setQuizOpen(true)} className="text-xs font-bold text-primary hover:text-primary-light transition-colors cursor-pointer flex items-center gap-1">
                      Aanvragen <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* Hoe het werkt */}
      <section className="py-14 sm:py-24 bg-surface relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Hoe het werkt</h2>
            <p className="text-gray-500 text-sm">Eenvoudig en zorgeloos huren.</p>
          </A>

          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Kies uw artikel', desc: 'Selecteer wat u wilt huren: fiets, koelkast of airco.' },
              { step: '02', title: 'Reserveer', desc: 'Boek tijdig, vooral in het hoogseizoen. Via telefoon, mail of portaal.' },
              { step: '03', title: 'Levering', desc: 'Wij bezorgen het artikel op uw camping of op onze stalling.' },
              { step: '04', title: 'Ophalen', desc: 'Aan het einde van uw huurperiode halen wij het artikel op.' },
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

      {/* Alle tarieven */}
      <section className="py-14 sm:py-24 bg-card relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Verhuurtarieven</h2>
          </A>
          <A>
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              {[
                { item: 'Elektrische fiets', price: '€65/week' },
                { item: 'Stadsfiets', price: '€35/week' },
                { item: 'Mountainbike', price: '€45/week' },
                { item: 'Kinderfiets', price: '€25/week' },
                { item: 'Koelkast (klein)', price: '€90/seizoen' },
                { item: 'Koelkast (groot)', price: '€120/seizoen' },
                { item: 'Mobiele airco', price: '€85/week' },
              ].map((t, i) => (
                <div key={t.item} className={`flex items-center justify-between px-5 py-3.5 text-sm ${i !== 6 ? 'border-b border-gray-200' : ''}`}>
                  <span className="font-medium">{t.item}</span>
                  <span className="font-bold text-primary">{t.price}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">Bezorging en ophalen op campings in de Costa Brava-regio inbegrepen.</p>
          </A>
        </div>
      </section>

      {/* Andere diensten */}
      <section className="py-10 sm:py-14 bg-surface border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">Bekijk ook</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/stalling" className="card-premium px-5 py-3 text-sm font-medium hover:border-primary/30 transition-all">Stalling</Link>
            <Link href="/diensten/transport" className="card-premium px-5 py-3 text-sm font-medium hover:border-primary/30 transition-all">Transport</Link>
            <Link href="/diensten/verkoop" className="card-premium px-5 py-3 text-sm font-medium hover:border-primary/30 transition-all">Verkoop</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-24 bg-card relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3"><HelpCircle size={11} className="text-primary" /><span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">Veelgestelde vragen</span></span>
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Vragen over verhuur?</h2>
          </A>
          <A>
            <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-gray-100 px-6 sm:px-8">
              {faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </A>
        </div>
      </section>

      <CtaSection title="Iets nodig voor uw vakantie?" subtitle="Boek uw fiets, koelkast of airco nu en geniet zorgeloos van de Costa Brava." primaryLabel="Verhuur aanvragen" onPrimaryClick={() => setQuizOpen(true)} />

      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} source="diensten-verhuur" initialInterest="verhuur" />
      <Footer />
    </>
  );
}
