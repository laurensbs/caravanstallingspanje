'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Phone, Shield, HelpCircle, ChevronDown, Sparkles } from 'lucide-react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';

function A({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const v = useInView(ref, { once: true, margin: '-60px' });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={v ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }} className={className}>{children}</motion.div>;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-sand-dark/[0.06] last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left group">
        <span className="font-bold text-sm pr-6">{q}</span>
        <ChevronDown size={18} className={`text-warm-gray shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <p className="text-sm text-warm-gray leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  {
    title: 'Seizoensstalling',
    price: '45',
    period: '/maand',
    desc: 'Voordelig tarief voor stalling uitsluitend buiten het kampeerseizoen (oktober t/m april). Uw caravan staat veilig terwijl u in Nederland bent. Upgrade naar jaarcontract altijd mogelijk.',
    features: ['Buitenstalling terrein', 'Oktober t/m april', 'Securitas Direct alarm', 'Standaard verzekerd', '24/7 camerabewaking', 'Controle tijdens stallingperiode'],
    popular: false,
    color: 'bg-warning/10 text-warning',
    cta: 'Meer informatie',
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
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative bg-surface-dark text-white py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary/80 to-primary-dark" />
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4">Tarieven</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] mb-6">
              Transparante <span className="gradient-text">tarieven</span>
            </h1>
            <p className="text-white/50 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Geen verborgen kosten. Bewaking, verzekering, tweewekelijkse controles en jaarlijkse technische keuring zijn bij elk stallingstype inbegrepen. U betaalt een vast maandtarief en weet precies waar u aan toe bent.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((p, i) => (
              <A key={p.title} delay={i * 0.1}>
                <div className={`relative bg-white rounded-2xl p-7 sm:p-8 border h-full flex flex-col ${p.popular ? 'border-accent/30 ring-1 ring-accent/10 shadow-lg' : 'border-sand-dark/[0.06]'}`}>
                  {p.popular && <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-sm uppercase tracking-wider">Populair</span>}
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
                  <Link href="/contact" className={`w-full font-bold px-6 py-3.5 rounded-xl text-sm transition-all inline-flex items-center justify-center gap-2 ${p.popular ? 'bg-accent hover:bg-accent-dark text-white shadow-sm' : 'bg-surface-dark/[0.04] hover:bg-sand-dark/[0.08] text-surface-dark'}`}>
                    {p.cta} <ArrowRight size={14} />
                  </Link>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* Extra Services */}
      <section className="py-20 sm:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Extra diensten</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Aanvullende services</h2>
            <div className="section-divider mt-5 mb-5" />
            <p className="text-warm-gray leading-relaxed">Naast stalling bieden wij een breed scala aan extra diensten. Van professionele schoonmaak tot transport en verhuur.</p>
          </A>

          <A>
            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-sand-dark/[0.06] overflow-hidden">
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
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <A>
            <div className="bg-surface rounded-2xl p-8 sm:p-10 border border-sand-dark/[0.04] flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
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
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Veelgestelde vragen</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Heeft u vragen?</h2>
            <div className="section-divider mt-5" />
          </A>

          <A>
            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-sand-dark/[0.06] px-6 sm:px-8">
              {faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </A>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface-dark relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center relative">
          <A>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Klaar om uw caravan te stallen?</h2>
            <p className="text-white/40 mb-8">Vraag vrijblijvend een offerte aan of bel voor direct advies.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/contact" className="bg-accent hover:bg-accent-dark text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all inline-flex items-center gap-2 shadow-sm">
                Offerte aanvragen <ArrowRight size={15} />
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
