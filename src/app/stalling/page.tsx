'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Thermometer, Camera, CheckCircle, ArrowRight, Lock, Eye, Sparkles, Truck,  Sun, Droplets, Wind, FileCheck, MapPin, Clock, Wrench, HelpCircle } from 'lucide-react';
import A from '@/components/AnimateIn';
import CtaSection from '@/components/CtaSection';
import PageHero from '@/components/PageHero';
import { FaqItem } from '@/components/FaqAccordion';
import QuizModal from '@/components/QuizModal';
import { useCountUp } from '@/lib/useCountUp';

const stallingFaqs = [
  { q: 'Hoe is de beveiliging van het terrein geregeld?', a: 'Ons terrein is volledig omsloten en beveiligd met het Securitas Direct professioneel alarmsysteem met directe alarmopvolging. Daarnaast filmt een geavanceerd camerasysteem 24/7 alle bewegingen. Ons personeel is dagelijks aanwezig voor toezicht.' },
  { q: 'Is mijn caravan verzekerd tijdens de stalling?', a: 'Ja, alle gestalde caravans zijn via onze collectieve polis standaard verzekerd tegen schade en diefstal op ons terrein. De kosten zijn inbegrepen in de stallingsprijs. Voor uitgebreidere dekking kunt u bij ons informeren.' },
  { q: 'Hoe vaak wordt mijn caravan gecontroleerd?', a: 'Elke twee weken lopen onze medewerkers langs alle gestalde caravans voor een visuele controle op storm-, hagel- en weerschade. Jaarlijks voeren wij een volledige technische keuring uit inclusief vochtmeting.' },
  { q: 'Kan ik mijn caravan op elk moment ophalen?', a: 'Tijdens onze openingstijden (ma-vr 09:30-16:30) kunt u uw caravan ophalen. Wij vragen wel om minimaal 48 uur van tevoren contact op te nemen, zodat wij uw caravan kunnen voorbereiden en rijklaar zetten.' },
  { q: 'Kan ik ook een camper, vouwwagen of boot stallen?', a: 'Ja, wij stallen naast caravans ook campers (integraal en halfintegraal), vouwwagens, boten en trailers. Tarieven zijn afhankelijk van de afmetingen. Neem contact op voor een offerte op maat.' },
  { q: 'Wat kost binnenstalling versus buitenstalling?', a: 'Buitenstalling begint vanaf €65 per maand, binnenstalling vanaf €95 per maand. Alle prijzen zijn inclusief beveiliging, verzekering en controles.' },
];


export default function StallingPage() {
  const [quizOpen, setQuizOpen] = useState(false);
  const statYears = useCountUp(20);
  const statClients = useCountUp(200);
  const statDays = useCountUp(14);
  return (
    <>
      <Header />

      <PageHero badge="Caravanstalling" title={<>Veilige stalling aan de <span className="gradient-text">Costa Brava</span></>} subtitle="Al meer dan 20 jaar dé specialist in het veilig en betrouwbaar stallen van caravans, campers, vouwwagens en boten in Sant Climent de Peralta. Securitas Direct bewaking, 24/7 camerabewaking en standaard verzekerd." image="https://u.cubeupload.com/laurensbos/caravanstoragespain3.jpg" />

      {/* Stats strip */}
      <section className="py-10 sm:py-14 bg-card relative overflow-hidden">
        <div className="absolute inset-0 line-pattern opacity-15 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            <A delay={0}>
              <div className="text-center" ref={statYears.ref}>
                <p className="stat-number text-3xl sm:text-5xl mb-1.5">{statYears.value}+</p>
                <p className="text-gray-500 text-xs sm:text-sm font-medium">Jaar ervaring</p>
              </div>
            </A>
            <A delay={0.1}>
              <div className="text-center" ref={statClients.ref}>
                <p className="stat-number text-3xl sm:text-5xl mb-1.5">{statClients.value}+</p>
                <p className="text-gray-500 text-xs sm:text-sm font-medium">Tevreden klanten</p>
              </div>
            </A>
            <A delay={0.2}>
              <div className="text-center">
                <p className="stat-number text-3xl sm:text-5xl mb-1.5">24/7</p>
                <p className="text-gray-500 text-xs sm:text-sm font-medium">Camerabewaking</p>
              </div>
            </A>
            <A delay={0.3}>
              <div className="text-center" ref={statDays.ref}>
                <p className="stat-number text-3xl sm:text-5xl mb-1.5">{statDays.value}</p>
                <p className="text-gray-500 text-xs sm:text-sm font-medium">Daagse controles</p>
              </div>
            </A>
          </div>
        </div>
      </section>

      {/* Intro / Waarom bij ons stallen */}
      <section className="py-12 sm:py-24 bg-premium-warm relative overflow-hidden wave-divider-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3"><span className="w-1.5 h-1.5 rounded-full bg-primary" /><span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">Waarom bij ons stallen?</span></span>
                <h2 className="text-2xl sm:text-4xl font-bold mb-4">Uw caravan in goede handen</h2>
                <div className="divider-animated mt-0 mb-4 !mx-0" />
                <p className="text-gray-500 leading-relaxed mb-3 text-sm sm:text-base">
                  Laat uw caravan staan waar u hem gebruikt — aan de Costa Brava. Geen 3.000 km heen en weer, geen tolkosten, geen gedoe. Uw caravan staat veilig op ons terrein, klaar wanneer u aankomt.
                </p>
                <p className="text-gray-500 leading-relaxed mb-4 text-sm sm:text-base">
                  Securitas Direct alarm, 24/7 camera&apos;s, standaard verzekerd. Elke 2 weken controle op weerschade, jaarlijks technische keuring. Problemen pakken wij direct aan in onze eigen werkplaats.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm"><Shield size={15} className="text-success" /> <span className="font-medium">Securitas Direct</span></div>
                  <div className="flex items-center gap-2 text-sm"><Camera size={15} className="text-success" /> <span className="font-medium">24/7 camera&apos;s</span></div>
                  <div className="flex items-center gap-2 text-sm"><Eye size={15} className="text-success" /> <span className="font-medium">Tweewekelijks gecontroleerd</span></div>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { icon: Sun, title: 'Geen heen-en-weer gerij', desc: 'Bespaar uzelf 3.000 km per jaar. Uw caravan staat al in Spanje wanneer u op vakantie gaat.' },
                  { icon: Shield, title: 'Professioneel beveiligd', desc: 'Securitas Direct alarmsysteem met directe alarmopvolging. 24/7 camerabewaking. Afgesloten terrein.' },
                  { icon: Eye, title: 'Regelmatige controles', desc: 'Elke 2 weken controle op weer- en stormschade. Jaarlijks volledige technische keuring.' },
                  { icon: Wrench, title: 'Eigen werkplaats', desc: 'Reparaties worden direct uitgevoerd. Van banden en remmen tot dakluiken en vochtschade.' },
                ].map((f, i) => (
                  <A key={f.title} delay={i * 0.08}>
                    <div className="card-premium p-4 sm:p-5">
                      <div className="flex gap-4">
                        <div className="w-11 h-11 bg-primary/8 rounded-xl flex items-center justify-center shrink-0">
                          <f.icon size={19} className="text-primary" />
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

      {/* Stalling types */}
      <section className="py-14 sm:py-24 bg-surface relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3"><span className="w-1.5 h-1.5 rounded-full bg-primary" /><span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">Stallingstypen</span></span>
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Kies uw stallingtype</h2>
            <div className="divider-animated mt-3 mb-4" />
            <p className="text-gray-500 text-sm">Inclusief beveiliging, verzekering en controle.</p>
          </A>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              {
                title: 'Buitenstalling', icon: Shield, price: '65',
                desc: 'Onze populairste optie. Uw caravan staat op een afgesloten, beveiligd buitenterrein. De milde Spaanse winters zorgen ervoor dat uw caravan geen last heeft van vorst of strooizout.',
                features: ['Eigen vaste plek met pleknummer', '24/7 camerabewaking', 'Securitas Direct alarm', 'Standaard verzekerd', 'Tweewekelijkse weerschadecontrole', 'Jaarlijkse technische keuring', 'Caravans, campers, vouwwagens & boten'],
                tag: null
              },
              {
                title: 'Binnenstalling', icon: Thermometer, price: '95',
                desc: 'Maximale bescherming in onze geïsoleerde hal. Geen hitte, geen kou, geen UV-straling. Ideaal voor nieuwere of duurdere caravans die u optimaal wilt beschermen.',
                features: ['Geïsoleerde overdekte hal', 'Geen UV-schade of verbleking', 'Stabiele temperatuur', 'Geen mos- of algvorming', 'Alle voordelen buitenstalling', 'Beperkte beschikbaarheid', 'Reserveer tijdig'],
                tag: 'Premium'
              },
            ].map((t, i) => (
              <A key={t.title} delay={i * 0.1}>
                <div className={`card-premium p-7 sm:p-9 h-full flex flex-col ${t.tag ? 'ring-2 ring-primary/20' : ''}`}>
                  {t.tag && <span className="absolute top-6 right-6 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">{t.tag}</span>}
                  <div className={`w-12 h-12 ${t.tag ? 'bg-primary/8 text-primary' : 'bg-accent/8 text-accent'} rounded-xl flex items-center justify-center mb-5`}>
                    <t.icon size={22} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t.title}</h3>
                  <p className="text-sm text-gray-500 mb-5 leading-relaxed">{t.desc}</p>
                  <ul className="space-y-2 mb-8 flex-1">
                    {t.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm"><CheckCircle size={13} className="text-accent shrink-0" /> {f}</li>
                    ))}
                  </ul>
                  <div className="flex items-end gap-1 mb-5">
                    <span className="text-sm text-gray-500">Vanaf</span>
                    <span className="stat-number text-4xl">€{t.price}</span>
                    <span className="text-gray-500 text-sm">/maand</span>
                  </div>
                  <button onClick={() => setQuizOpen(true)} className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2 ${t.tag ? 'bg-primary hover:bg-primary-light text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5' : 'bg-primary hover:bg-hero/90 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'}`}>
                    Stalling aanvragen <ArrowRight size={14} />
                  </button>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* Wat wij doen tijdens stalling */}
      <section className="py-14 sm:py-24 bg-card relative overflow-hidden">
        <div className="absolute inset-0 line-pattern opacity-40 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <A className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-accent/8 rounded-full px-3 py-1 mb-3"><span className="w-1.5 h-1.5 rounded-full bg-accent" /><span className="text-accent text-xs font-bold tracking-[0.15em] uppercase">Onze zorg</span></span>
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Wat wij doen voor uw caravan</h2>
            <div className="divider-animated mt-3 mb-4" />
            <p className="text-gray-500 leading-relaxed text-sm">Meer dan alleen parkeren — het hele jaar door actieve zorg.</p>
          </A>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Eye, title: 'Tweewekelijkse visuele controle',
                desc: 'Elke twee weken lopen onze medewerkers langs alle gestalde caravans. Wij controleren op beschadigingen door storm, hagel, vallende takken of andere weersomstandigheden. Eventuele schade melden wij direct aan u en pakken wij op in onze werkplaats.',
              },
              {
                icon: FileCheck, title: 'Jaarlijkse technische keuring',
                desc: 'Eén keer per jaar voeren wij een uitgebreide technische keuring uit. Wij controleren banden, remmen, verlichting, koppeling, gasinstallatie, dakluiken, ramen en naden. U ontvangt een keuringsrapport via uw klantportaal.',
              },
              {
                icon: Droplets, title: 'Vochtcontrole',
                desc: 'Vocht is de grootste vijand van uw caravan. Wij controleren regelmatig op vochtsporen en lekkages. Door vroege signalering voorkomen wij kostbare vervolgschade. Eventuele lekkages worden direct door ons team verholpen.',
              },
              {
                icon: Wind, title: 'Storm- en weerbescherming',
                desc: 'Bij zware stormen of extreme weersomstandigheden nemen wij extra maatregelen. Wij controleren de verankering, sluiten luifels en dakluiken en beschermen kwetsbare onderdelen. Na de storm volgt altijd een extra ronde.',
              },
            ].map((f, i) => (
              <A key={f.title} delay={i * 0.08}>
                <div className="card-premium p-6 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center shrink-0">
                      <f.icon size={18} className="text-primary" />
                    </div>
                    <h3 className="font-bold">{f.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* Security Detail */}
      <section className="py-14 sm:py-24 bg-premium-cool relative overflow-hidden">
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-ocean/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <A>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-ocean/8 rounded-full px-3 py-1 mb-3"><Lock size={11} className="text-ocean" /><span className="text-ocean text-xs font-bold tracking-[0.15em] uppercase">Beveiliging</span></span>
                <h2 className="text-2xl sm:text-4xl font-bold mb-4">Uw caravan is bij ons veilig</h2>
                <div className="divider-animated mt-0 mb-4 !mx-0" />
                <p className="text-gray-500 leading-relaxed mb-3 text-sm sm:text-base">
                  Ons terrein is volledig omsloten, alleen toegankelijk voor personeel. Securitas Direct met directe alarmopvolging. Standaard verzekerd tegen schade en diefstal.
                </p>

                <div className="space-y-3">
                  {[
                    { icon: Lock, label: 'Securitas Direct professioneel alarmsysteem' },
                    { icon: Camera, label: '24/7 camerabewaking met registratie' },
                    { icon: Shield, label: 'Standaard verzekerd tegen schade & diefstal' },
                    { icon: MapPin, label: 'Volledig omsloten terrein' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-3 text-sm"><f.icon size={15} className="text-success shrink-0" /> <span className="font-medium">{f.label}</span></div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Lock, title: 'Securitas Direct', desc: 'Professioneel alarmsysteem met directe alarmopvolging bij ongeautoriseerde toegang.' },
                  { icon: Camera, title: '24/7 Camera\'s', desc: 'Geavanceerd camerasysteem met continue registratie. Beeldmateriaal wordt opgeslagen.' },
                  { icon: Shield, title: 'Verzekerd', desc: 'Collectieve verzekeringspolis dekt schade en diefstal op ons terrein.' },
                  { icon: Eye, title: 'Dagelijks toezicht', desc: 'Ons personeel is dagelijks aanwezig op het terrein voor toezicht en onderhoud.' },
                ].map((f, i) => (
                  <A key={f.title} delay={i * 0.08}>
                    <div className="card-premium p-5 h-full text-center">
                      <div className="w-12 h-12 bg-primary/8 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <f.icon size={20} className="text-primary" />
                      </div>
                      <h3 className="font-bold text-sm mb-1">{f.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                    </div>
                  </A>
                ))}
              </div>
            </div>
          </A>
        </div>
      </section>

      {/* Spot System */}
      <section className="py-14 sm:py-24 bg-card relative overflow-hidden">
        <div className="absolute inset-0 line-pattern opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <A>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div className="text-center lg:text-left">
                <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3"><MapPin size={11} className="text-primary" /><span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">Organisatie</span></span>
                <h2 className="text-2xl sm:text-4xl font-bold mb-4">Vaste plek met pleknummer</h2>
                <div className="divider-animated mt-0 mb-4 mx-auto lg:!mx-0" />
                <p className="text-gray-500 mb-3 leading-relaxed text-sm sm:text-base">Elke caravan krijgt een eigen, vaste plek. Online inzien via uw klantportaal — inclusief contract, facturen en inspecties.</p>
                <p className="text-gray-500 mb-6 leading-relaxed text-sm sm:text-base">Zones A-D buitenstalling, zone H binnenstalling.</p>
                <div className="space-y-3 text-left max-w-sm mx-auto lg:mx-0">
                  {['Zones A-D: Buitenstalling (jaarrond)', 'Zone H: Binnenstalling (geïsoleerde hal)'].map(z => (
                    <div key={z} className="flex items-center gap-3 text-sm"><CheckCircle size={14} className="text-success shrink-0" /><span className="font-medium">{z}</span></div>
                  ))}
                </div>
              </div>
              <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-gray-200">
                <div className="grid grid-cols-4 gap-2">
                  {['A-001','A-002','A-003','A-004','A-005','A-006','A-007','A-008','B-001','B-002','B-003','B-004','H-001','H-002','H-003','H-004'].map((spot, i) => {
                    const status = i % 5 === 0 ? 'open' : i % 4 === 0 ? 'reserved' : 'taken';
                    const c = status === 'open' ? 'bg-accent/10 text-accent border border-accent/15' : status === 'reserved' ? 'bg-primary/10 text-primary border border-primary/15' : 'bg-gray-100 text-gray-500 border border-gray-200';
                    return <div key={spot} className={`${c} rounded-xl p-3 text-center text-xs font-bold`}>{spot}</div>;
                  })}
                </div>
                <div className="flex items-center justify-center gap-5 mt-5 pt-4 border-t border-gray-200">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500"><span className="w-2.5 h-2.5 bg-accent/60 rounded-full" /> Vrij</span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500"><span className="w-2.5 h-2.5 bg-gray-200 rounded-full" /> Bezet</span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500"><span className="w-2.5 h-2.5 bg-primary/60 rounded-full" /> Gereserveerd</span>
                </div>
              </div>
            </div>
          </A>
        </div>
      </section>

      {/* Wat kunt u stallen */}
      <section className="py-14 sm:py-24 bg-premium-accent relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-accent/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
          <A className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-2 bg-accent/8 rounded-full px-3 py-1 mb-3"><Truck size={11} className="text-accent" /><span className="text-accent text-xs font-bold tracking-[0.15em] uppercase">Voertuigtypes</span></span>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Wat kunt u bij ons stallen?</h2>
            <div className="divider-animated mt-0 mb-4" />
            <p className="text-gray-500 text-sm">Wij stallen niet alleen caravans, maar ook campers, vouwwagens en boten.</p>
          </A>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: 'Caravans', desc: 'Alle merken en lengtes', icon: '🏕️' },
              { type: 'Campers', desc: 'Integraal & halfintegraal', icon: '🚐' },
              { type: 'Vouwwagens', desc: 'Compact gestald', icon: '⛺' },
              { type: 'Boten & trailers', desc: 'Op aanvraag', icon: '⛵' },
            ].map((v, i) => (
              <A key={v.type} delay={i * 0.08}>
                <div className="card-premium p-5 text-center">
                  <span className="text-2xl mb-2 block">{v.icon}</span>
                  <p className="font-bold text-sm mb-1">{v.type}</p>
                  <p className="text-xs text-gray-500">{v.desc}</p>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-24 bg-card relative">
        <div className="absolute inset-0 line-pattern opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3"><HelpCircle size={11} className="text-primary" /><span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">Veelgestelde vragen</span></span>
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Vragen over stalling?</h2>
            <div className="divider-animated mt-3" />
          </A>
          <A>
            <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-gray-300/[0.06] px-6 sm:px-8">
              {stallingFaqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </A>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: stallingFaqs.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }) }} />
      </section>

      <CtaSection title="Wilt u uw caravan bij ons stallen?" subtitle="Neem contact op voor een vrijblijvende offerte of bel voor direct advies. Wij spreken Nederlands, Engels en Spaans." hours="Op werkdagen bereikbaar van 09:30 tot 16:30 uur" primaryLabel="Stalling aanvragen" onPrimaryClick={() => setQuizOpen(true)} />

      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} source="stalling" initialInterest="stalling" />
      <Footer />
    </>
  );
}
