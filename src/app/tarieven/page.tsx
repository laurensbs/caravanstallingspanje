'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { CheckCircle, ArrowRight,  Shield, HelpCircle, Sparkles } from 'lucide-react';
import A from '@/components/AnimateIn';
import CtaSection from '@/components/CtaSection';
import PageHero from '@/components/PageHero';
import { FaqItem } from '@/components/FaqAccordion';
import QuizModal from '@/components/QuizModal';


const plans = [
  {
    title: 'Buitenstalling',
    price: '65',
    period: '/maand',
    desc: 'Onze populairste optie. Veilige buitenstalling op ons beveiligde terrein met Securitas Direct alarm. Ideaal voor de meeste caravans en campers — het milde Spaanse klimaat beschermt tegen vorst en strooizout.',
    features: ['Eigen vaste plek met pleknummer', '24/7 camerabewaking', 'Securitas Direct alarm', 'Standaard verzekerd tegen schade & diefstal', 'Tweewekelijkse controle op weerschade', 'Jaarlijkse technische keuring'],
    popular: true,
    color: 'bg-accent/10 text-accent',
    cta: 'Stalling aanvragen',
  },
  {
    title: 'Binnenstalling',
    price: '95',
    period: '/maand',
    desc: 'Maximale bescherming in onze geïsoleerde hal. Geen UV-straling, geen extreme temperaturen, geen mos of alg op de wanden. Ideaal voor nieuwere of duurdere caravans en campers.',
    features: ['Alles van buitenstalling', 'Geïsoleerde overdekte hal', 'Geen UV-schade of verbleking', 'Stabiele temperatuur jaarrond', 'Geen mos- of algvorming', 'Beperkt beschikbaar — reserveer tijdig'],
    popular: false,
    color: 'bg-ocean/10 text-ocean',
    cta: 'Beschikbaarheid checken',
  },
];

const extras = [
  { service: 'Jaarlijkse technische keuring', price: 'Inbegrepen' },
  { service: 'Tweewekelijkse controle', price: 'Inbegrepen' },
  { service: 'Basiswas exterieur', price: '€ 75' },
  { service: 'Complete schoonmaak (ext. + int.)', price: '€ 150' },
  { service: 'Polishbehandeling', price: '€ 195' },
  { service: 'Anti-mos & alg behandeling', price: '€ 95' },
  { service: 'Dakbehandeling', price: '€ 85' },
  { service: 'Seizoensklaar pakket', price: '€ 245' },
  { service: 'Transport NL ↔ Spanje', price: 'Op aanvraag' },
  { service: 'Koelkast verhuur (seizoen)', price: '€ 120' },
  { service: 'Elektrische fiets verhuur (week)', price: '€ 65' },
  { service: 'Mobiele airco verhuur (week)', price: '€ 85' },
];

const faqs = [
  { q: 'Wat is inbegrepen bij de stallingsprijs?', a: 'Bij alle stallingstypen is inbegrepen: een eigen vaste plek met pleknummer, 24/7 camerabewaking, het Securitas Direct alarmsysteem, standaardverzekering tegen schade en diefstal, tweewekelijkse controle op weerschade en een jaarlijkse volledige technische keuring. U betaalt geen extra kosten voor deze diensten.' },
  { q: 'Kan ik mijn caravan het hele jaar door ophalen?', a: 'Ja, tijdens onze openingstijden (ma-vr 09:30-16:30) kunt u uw caravan ophalen. Wij vragen u wel om minimaal 48 uur van tevoren contact op te nemen, zodat wij uw caravan kunnen voorbereiden en rijklaar zetten op de afgesproken datum.' },
  { q: 'Hoe werkt de verzekering?', a: 'Alle gestalde caravans zijn standaard verzekerd via onze collectieve polis. Deze dekt schade en diefstal op ons terrein. De kosten zijn inbegrepen in de stallingsprijs. Voor uitgebreidere dekking of bijzondere objecten kunt u bij ons informeren naar aanvullende opties.' },
  { q: 'Zijn er langetermijnkortingen?', a: 'Ja, bij een jaarcontract bieden wij een aantrekkelijker tarief dan bij maandbetaling. Ook voor meerdere voertuigen gelden speciale tarieven. Neem contact op voor een persoonlijke offerte op maat.' },
  { q: 'Kan ik ook een camper of boot stallen?', a: 'Zeker. Wij stallen naast caravans ook campers (integraal en halfintegraal), vouwwagens, boten en trailers. Tarieven zijn afhankelijk van de afmetingen van uw voertuig. Neem contact op voor een offerte.' },
  { q: 'Hoe regel ik transport van Nederland naar Spanje?', a: 'Wij beschikken over 7 eigen transporteenheden en circa 12 medewerkers in het seizoen. Wij halen uw caravan op vanuit Nederland, België of Duitsland en leveren deze af op onze stalling of rechtstreeks op uw camping aan de Costa Brava. Transport is ook mogelijk tussen campings onderling.' },
  { q: 'Wat is CaravanRepair® en kan ik daar gebruik van maken?', a: 'CaravanRepair® is het gepatenteerde schadeherstelsysteem voor geprofileerde caravan- en camperwanden. Als officieel Masterdealer bieden wij onzichtbaar herstel van hagel-, storm-, aanrijdings- en vochtschade met levenslange garantie. Alle verzekeraars erkennen dit systeem. Wij verzorgen ook de complete afhandeling met uw verzekeraar.' },
  { q: 'Wat gebeurt er als mijn caravan schade oploopt tijdens stalling?', a: 'Tijdens onze tweewekelijkse controles signaleren wij eventuele schade direct. Wij nemen contact met u op, documenteren de schade en pakken het op in onze eigen werkplaats. De kosten zijn afhankelijk van het type schade en vallen vaak onder de verzekering.' },
];

export default function TarievenPage() {
  const [quizOpen, setQuizOpen] = useState(false);
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Header />

      <PageHero badge="Tarieven" title={<>Transparante <span className="gradient-text">tarieven</span></>} subtitle="Geen verborgen kosten. Bewaking, verzekering, tweewekelijkse controles en jaarlijkse technische keuring zijn bij elk stallingstype inbegrepen. U betaalt een vast maandtarief en weet precies waar u aan toe bent." image="https://u.cubeupload.com/laurensbos/caravanstoragespain2.jpg" />

      {/* Pricing Cards */}
      <section className="py-14 sm:py-24 bg-card relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.map((p, i) => (
              <A key={p.title} delay={i * 0.1}>
                <div className={`card-premium p-7 sm:p-8 h-full flex flex-col ${p.popular ? 'ring-2 ring-accent/20 shadow-lg' : ''}`}>
                  {p.popular && <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-md uppercase tracking-wider">Populair</span>}
                  <div className={`w-12 h-12 ${p.color} rounded-xl flex items-center justify-center mb-5`}>
                    <Shield size={20} />
                  </div>
                  <h3 className="text-xl font-black mb-1">{p.title}</h3>
                  <p className="text-xs text-warm-gray leading-relaxed mb-5">{p.desc}</p>
                  <div className="flex items-end gap-1 mb-6">
                    <span className="text-sm text-warm-gray">Vanaf</span>
                    <span className="text-4xl font-black">€{p.price}</span>
                    <span className="text-warm-gray text-sm">{p.period}</span>
                  </div>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {p.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm"><CheckCircle size={14} className="text-success shrink-0" /> {f}</li>
                    ))}
                  </ul>
                  <button onClick={() => setQuizOpen(true)} className={`w-full font-bold px-6 py-3.5 rounded-xl text-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 ${p.popular ? 'bg-accent hover:bg-accent-dark text-white shadow-lg shadow-accent/20 hover:shadow-xl' : 'bg-hero/[0.04] hover:bg-sand-dark/[0.08] text-surface-dark'}`}>
                    {p.cta} <ArrowRight size={14} />
                  </button>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-14 sm:py-24 bg-premium-warm relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3"><span className="w-1.5 h-1.5 rounded-full bg-primary" /><span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">Vergelijking</span></span>
            <h2 className="text-2xl sm:text-3xl font-black mb-4">Wat is inbegrepen?</h2>
            <div className="divider-animated mt-3 mb-4" />
          </A>
          <A>
            <div className="overflow-x-auto">
              <table className="w-full bg-card rounded-2xl border border-sand-dark/[0.06] overflow-hidden text-sm">
                <thead>
                  <tr className="border-b border-sand-dark/10">
                    <th className="text-left px-5 py-4 font-bold">Kenmerk</th>
                    <th className="text-center px-4 py-4 font-bold bg-accent/5">Buiten <span className="block text-xs font-normal text-warm-gray">€65/mnd</span></th>
                    <th className="text-center px-4 py-4 font-bold">Binnen <span className="block text-xs font-normal text-warm-gray">€95/mnd</span></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Securitas Direct alarm', buiten: true, binnen: true },
                    { feature: '24/7 camerabewaking', buiten: true, binnen: true },
                    { feature: 'Standaard verzekerd', buiten: true, binnen: true },
                    { feature: 'Eigen vaste plek', buiten: true, binnen: true },
                    { feature: 'Tweewekelijkse controle', buiten: true, binnen: true },
                    { feature: 'Jaarlijkse technische keuring', buiten: true, binnen: true },
                    { feature: 'Jaarrond beschikbaar', buiten: true, binnen: true },
                    { feature: 'Overdekte hal', buiten: false, binnen: true },
                    { feature: 'Geen UV-schade', buiten: false, binnen: true },
                    { feature: 'Stabiele temperatuur', buiten: false, binnen: true },
                    { feature: 'Geen mos/algvorming', buiten: false, binnen: true },
                  ].map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? 'bg-surface/50' : ''}>
                      <td className="px-5 py-3 font-medium">{row.feature}</td>
                      <td className="text-center px-4 py-3 bg-accent/5">{row.buiten ? <CheckCircle size={16} className="text-success mx-auto" /> : <span className="text-warm-gray/40">—</span>}</td>
                      <td className="text-center px-4 py-3">{row.binnen ? <CheckCircle size={16} className="text-success mx-auto" /> : <span className="text-warm-gray/40">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </A>
        </div>
      </section>

      {/* Extra Services */}
      <section className="py-14 sm:py-24 bg-surface relative overflow-hidden">
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-primary/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3"><Sparkles size={11} className="text-primary" /><span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">Extra diensten</span></span>
            <h2 className="text-2xl sm:text-4xl font-black mb-3">Aanvullende services</h2>
            <div className="divider-animated mt-3 mb-4" />
            <p className="text-warm-gray leading-relaxed text-sm">Schoonmaak, transport, verhuur en meer.</p>
          </A>

          <A>
            <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-sand-dark/[0.06] overflow-hidden">
              {extras.map((e, i) => (
                <div key={e.service} className={`flex items-center justify-between px-6 py-4 text-sm ${i !== extras.length - 1 ? 'border-b border-sand-dark/[0.04]' : ''}`}>
                  <span className="font-medium">{e.service}</span>
                  <span className={`font-bold shrink-0 ml-4 ${e.price === 'Inbegrepen' ? 'text-success' : e.price === 'Op aanvraag' ? 'text-primary' : ''}`}>{e.price}</span>
                </div>
              ))}
            </div>
          </A>
        </div>
      </section>

      {/* CaravanRepair */}
      <section className="py-14 sm:py-16 bg-card relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <A>
            <div className="card-premium p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                <Sparkles className="text-primary" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-lg mb-1">CaravanRepair® Masterdealer</h3>
                <p className="text-sm text-warm-gray leading-relaxed">Wand-, hagel- en vochtschade? Als officieel Masterdealer bieden wij het gepatenteerde CaravanRepair® herstelsysteem met levenslange garantie.</p>
              </div>
              <Link href="/diensten#caravanrepair" className="bg-accent hover:bg-accent-dark text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all inline-flex items-center gap-2 shrink-0 shadow-sm">
                Meer info <ArrowRight size={14} />
              </Link>
            </div>
          </A>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-24 bg-premium-warm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3"><HelpCircle size={11} className="text-primary" /><span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">Veelgestelde vragen</span></span>
            <h2 className="text-2xl sm:text-4xl font-black mb-3">Heeft u vragen?</h2>
            <div className="divider-animated mt-3" />
          </A>

          <A>
            <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-sand-dark/[0.06] px-6 sm:px-8">
              {faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </A>
        </div>
      </section>

      <CtaSection title="Klaar om uw caravan te stallen?" subtitle="Vraag vrijblijvend een offerte aan of bel voor direct advies." primaryLabel="Offerte aanvragen" primaryColor="accent" onPrimaryClick={() => setQuizOpen(true)} />

      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} source="tarieven" />
      <Footer />
    </>
  );
}
