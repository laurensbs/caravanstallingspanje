'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Thermometer, Camera, CheckCircle, ArrowRight, Lock, Eye, Sparkles, Truck, Phone, Sun, Droplets, Wind, FileCheck, MapPin, Clock, Wrench, HelpCircle } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FaqItem } from '@/components/FaqAccordion';

const stallingFaqs = [
  { q: 'Hoe is de beveiliging van het terrein geregeld?', a: 'Ons terrein is volledig omsloten en beveiligd met het Securitas Direct professioneel alarmsysteem met directe alarmopvolging. Daarnaast filmt een geavanceerd camerasysteem 24/7 alle bewegingen. Ons personeel is dagelijks aanwezig voor toezicht.' },
  { q: 'Is mijn caravan verzekerd tijdens de stalling?', a: 'Ja, alle gestalde caravans zijn via onze collectieve polis standaard verzekerd tegen schade en diefstal op ons terrein. De kosten zijn inbegrepen in de stallingsprijs. Voor uitgebreidere dekking kunt u bij ons informeren.' },
  { q: 'Hoe vaak wordt mijn caravan gecontroleerd?', a: 'Elke twee weken lopen onze medewerkers langs alle gestalde caravans voor een visuele controle op storm-, hagel- en weerschade. Jaarlijks voeren wij een volledige technische keuring uit inclusief vochtmeting.' },
  { q: 'Kan ik mijn caravan op elk moment ophalen?', a: 'Tijdens onze openingstijden (ma-vr 09:30-16:30) kunt u uw caravan ophalen. Wij vragen wel om minimaal 48 uur van tevoren contact op te nemen, zodat wij uw caravan kunnen voorbereiden en rijklaar zetten.' },
  { q: 'Kan ik ook een camper, vouwwagen of boot stallen?', a: 'Ja, wij stallen naast caravans ook campers (integraal en halfintegraal), vouwwagens, boten en trailers. Tarieven zijn afhankelijk van de afmetingen. Neem contact op voor een offerte op maat.' },
  { q: 'Wat kost binnenstalling versus buitenstalling?', a: 'Buitenstalling begint vanaf €65 per maand, binnenstalling vanaf €95 per maand en seizoensstalling (oktober-april) vanaf €45 per maand. Alle prijzen zijn inclusief beveiliging, verzekering en controles.' },
];

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
      <section className="relative bg-hero text-white py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=1920&q=80" alt="" fill className="object-cover opacity-20" priority />
          <div className="hero-overlay absolute inset-0" />
        </div>
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-primary-light text-xs font-bold tracking-[0.2em] uppercase mb-4">Caravanstalling</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] mb-6">
              Veilige stalling aan de <span className="gradient-text">Costa Brava</span>
            </h1>
            <p className="text-white/50 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Al meer dan 20 jaar dé specialist in het veilig en betrouwbaar stallen van caravans, campers, vouwwagens en boten in Sant Climent de Peralta. Securitas Direct bewaking, 24/7 camerabewaking en standaard verzekerd.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro / Waarom bij ons stallen */}
      <section className="py-20 sm:py-28 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Waarom bij ons stallen?</p>
                <h2 className="text-3xl sm:text-4xl font-black mb-6">Uw caravan in goede handen aan de Costa Brava</h2>
                <div className="section-divider mt-0 mb-6" />
                <p className="text-warm-gray leading-relaxed mb-4">
                  Waarom zou u uw caravan elk seizoen heen en weer slepen over 1.500 kilometer snelweg? Laat uw caravan staan waar u hem gebruikt — aan de prachtige Costa Brava. Geen slijtage door lange ritten, geen tolkosten, geen gedoe met opslag thuis. Uw caravan staat veilig op ons terrein, klaar wanneer u aankomt.
                </p>
                <p className="text-warm-gray leading-relaxed mb-4">
                  Ons stallingsterrein in Sant Climent de Peralta is volledig afgesloten en voorzien van het Securitas Direct alarmsysteem met directe alarmopvolging. Daarnaast filmt een geavanceerd camerasysteem 24 uur per dag, 7 dagen per week alle bewegingen op het terrein. Uw caravan is bij ons standaard verzekerd tegen schade en diefstal.
                </p>
                <p className="text-warm-gray leading-relaxed mb-6">
                  Maar wij doen meer dan alleen stallen. Elke twee weken controleren wij alle caravans op schades die kunnen ontstaan door weersomstandigheden. Daarnaast voeren wij jaarlijks een volledige technische keuring uit, zodat uw caravan altijd in topconditie staat. Eventuele problemen pakken wij direct aan in onze eigen werkplaats.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm"><Shield size={15} className="text-success" /> <span className="font-medium">Securitas Direct</span></div>
                  <div className="flex items-center gap-2 text-sm"><Camera size={15} className="text-success" /> <span className="font-medium">24/7 camera&apos;s</span></div>
                  <div className="flex items-center gap-2 text-sm"><Eye size={15} className="text-success" /> <span className="font-medium">Tweewekelijks gecontroleerd</span></div>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { icon: Sun, title: 'Geen heen-en-weer gerij', desc: 'Bespaar uzelf 3.000 km per jaar. Uw caravan staat al in Spanje wanneer u op vakantie gaat.', color: 'bg-warning/10 text-warning' },
                  { icon: Shield, title: 'Professioneel beveiligd', desc: 'Securitas Direct alarmsysteem met directe alarmopvolging. 24/7 camerabewaking. Afgesloten terrein.', color: 'bg-accent/10 text-accent' },
                  { icon: Eye, title: 'Regelmatige controles', desc: 'Elke 2 weken controle op weer- en stormschade. Jaarlijks volledige technische keuring.', color: 'bg-ocean/10 text-ocean' },
                  { icon: Wrench, title: 'Eigen werkplaats', desc: 'Reparaties worden direct uitgevoerd. Van banden en remmen tot dakluiken en vochtschade.', color: 'bg-primary/10 text-primary' },
                ].map((f, i) => (
                  <A key={f.title} delay={i * 0.08}>
                    <div className="flex gap-4 bg-surface rounded-xl p-4 border border-sand-dark/20">
                      <div className={`w-11 h-11 ${f.color} rounded-xl flex items-center justify-center shrink-0`}>
                        <f.icon size={19} />
                      </div>
                      <div>
                        <p className="font-bold text-sm mb-0.5">{f.title}</p>
                        <p className="text-xs text-warm-gray leading-relaxed">{f.desc}</p>
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
      <section className="py-20 sm:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Stallingstypen</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Kies uw stallingtype</h2>
            <div className="section-divider mt-5 mb-5" />
            <p className="text-warm-gray">Alle stallingstypen inclusief beveiliging, verzekering en tweewekelijkse controle.</p>
          </A>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: 'Buitenstalling', icon: Shield, price: '65',
                desc: 'Onze populairste optie. Uw caravan staat op een afgesloten, beveiligd buitenterrein. De milde Spaanse winters zorgen ervoor dat uw caravan geen last heeft van vorst of strooizout.',
                features: ['Eigen vaste plek met pleknummer', '24/7 camerabewaking', 'Securitas Direct alarm', 'Standaard verzekerd', 'Tweewekelijkse weerschadecontrole', 'Jaarlijkse technische keuring', 'Caravans, campers, vouwwagens & boten'],
                tag: 'Populair', gradient: 'bg-accent/10 text-accent'
              },
              {
                title: 'Binnenstalling', icon: Thermometer, price: '95',
                desc: 'Maximale bescherming in onze geïsoleerde hal. Geen hitte, geen kou, geen UV-straling. Ideaal voor nieuwere of duurdere caravans die u optimaal wilt beschermen.',
                features: ['Geïsoleerde overdekte hal', 'Geen UV-schade of verbleking', 'Stabiele temperatuur', 'Geen mos- of algvorming', 'Alle voordelen buitenstalling', 'Beperkte beschikbaarheid', 'Reserveer tijdig'],
                tag: 'Premium', gradient: 'bg-ocean/10 text-ocean'
              },
              {
                title: 'Seizoensstalling', icon: Clock, price: '45',
                desc: 'Voordeliger tarief voor stalling uitsluitend buiten het kampeerseizoen (oktober t/m april). Ideaal als u uw caravan in de winter veilig wilt onderbrengen.',
                features: ['Buitenstalling terrein', 'Oktober t/m april', 'Securitas Direct alarm', 'Standaard verzekerd', 'Camerabewaking', 'Controle tijdens stalling', 'Upgrade naar jaarcontract mogelijk'],
                tag: 'Voordelig', gradient: 'bg-warning/10 text-warning'
              },
            ].map((t, i) => (
              <A key={t.title} delay={i * 0.1}>
                <div className="relative bg-card rounded-2xl p-7 sm:p-8 border border-sand-dark/20 card-hover h-full flex flex-col">
                  {t.tag && <span className="absolute top-6 right-6 bg-primary/8 text-primary text-[10px] font-bold px-3 py-1 rounded-full">{t.tag}</span>}
                  <div className={`w-12 h-12 ${t.gradient} rounded-xl flex items-center justify-center mb-5`}>
                    <t.icon size={22} />
                  </div>
                  <h3 className="text-xl font-black mb-2">{t.title}</h3>
                  <p className="text-sm text-warm-gray mb-5 leading-relaxed">{t.desc}</p>
                  <ul className="space-y-2 mb-8 flex-1">
                    {t.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm"><CheckCircle size={13} className="text-success shrink-0" /> {f}</li>
                    ))}
                  </ul>
                  <div className="flex items-end gap-1 mb-5">
                    <span className="text-sm text-warm-gray">Vanaf</span>
                    <span className="text-4xl font-black">€{t.price}</span>
                    <span className="text-warm-gray text-sm">/maand</span>
                  </div>
                  <Link href="/contact" className="w-full bg-accent hover:bg-accent-dark text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all inline-flex items-center justify-center gap-2 shadow-sm">
                    Stalling aanvragen <ArrowRight size={14} />
                  </Link>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* Wat wij doen tijdens stalling */}
      <section className="py-20 sm:py-28 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Onze zorg</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Wat wij doen terwijl uw caravan bij ons staat</h2>
            <div className="section-divider mt-5 mb-5" />
            <p className="text-warm-gray leading-relaxed">Stallen is bij ons meer dan alleen parkeren. Wij besteden het hele jaar door actief aandacht aan uw caravan.</p>
          </A>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Eye, title: 'Tweewekelijkse visuele controle',
                desc: 'Elke twee weken lopen onze medewerkers langs alle gestalde caravans. Wij controleren op beschadigingen door storm, hagel, vallende takken of andere weersomstandigheden. Eventuele schade melden wij direct aan u en pakken wij op in onze werkplaats.',
                color: 'bg-ocean/10 text-ocean'
              },
              {
                icon: FileCheck, title: 'Jaarlijkse technische keuring',
                desc: 'Eén keer per jaar voeren wij een uitgebreide technische keuring uit. Wij controleren banden, remmen, verlichting, koppeling, gasinstallatie, dakluiken, ramen en naden. U ontvangt een keuringsrapport via uw klantportaal.',
                color: 'bg-accent/10 text-accent'
              },
              {
                icon: Droplets, title: 'Vochtcontrole',
                desc: 'Vocht is de grootste vijand van uw caravan. Wij controleren regelmatig op vochtsporen en lekkages. Door vroege signalering voorkomen wij kostbare vervolgschade. Eventuele lekkages worden direct door ons team verholpen.',
                color: 'bg-warning/10 text-warning'
              },
              {
                icon: Wind, title: 'Storm- en weerbescherming',
                desc: 'Bij zware stormen of extreme weersomstandigheden nemen wij extra maatregelen. Wij controleren de verankering, sluiten luifels en dakluiken en beschermen kwetsbare onderdelen. Na de storm volgt altijd een extra ronde.',
                color: 'bg-primary/10 text-primary'
              },
            ].map((f, i) => (
              <A key={f.title} delay={i * 0.08}>
                <div className="bg-surface rounded-2xl p-6 border border-sand-dark/20 card-hover h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 ${f.color} rounded-xl flex items-center justify-center shrink-0`}>
                      <f.icon size={18} />
                    </div>
                    <h3 className="font-bold">{f.title}</h3>
                  </div>
                  <p className="text-sm text-warm-gray leading-relaxed">{f.desc}</p>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* Security Detail */}
      <section className="py-20 sm:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Beveiliging</p>
                <h2 className="text-3xl sm:text-4xl font-black mb-6">Uw caravan is bij ons veilig</h2>
                <div className="section-divider mt-0 mb-6" />
                <p className="text-warm-gray leading-relaxed mb-4">
                  Beveiliging is onze eerste prioriteit. Ons terrein is volledig omsloten en alleen toegankelijk voor geautoriseerd personeel. Het Securitas Direct alarmsysteem is gekoppeld aan een alarmcentrale die bij ongeautoriseerde toegang direct actie onderneemt.
                </p>
                <p className="text-warm-gray leading-relaxed mb-6">
                  Alle gestalde caravans zijn via onze collectieve polis standaard verzekerd tegen schade en diefstal op ons terrein. Heeft u behoefte aan een uitgebreidere dekking? Neem dan contact met ons op voor de mogelijkheden.
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
                  { icon: Lock, title: 'Securitas Direct', desc: 'Professioneel alarmsysteem met directe alarmopvolging bij ongeautoriseerde toegang.', color: 'bg-accent/10 text-accent' },
                  { icon: Camera, title: '24/7 Camera\'s', desc: 'Geavanceerd camerasysteem met continue registratie. Beeldmateriaal wordt opgeslagen.', color: 'bg-ocean/10 text-ocean' },
                  { icon: Shield, title: 'Verzekerd', desc: 'Collectieve verzekeringspolis dekt schade en diefstal op ons terrein.', color: 'bg-primary/10 text-primary' },
                  { icon: Eye, title: 'Dagelijks toezicht', desc: 'Ons personeel is dagelijks aanwezig op het terrein voor toezicht en onderhoud.', color: 'bg-warning/10 text-warning' },
                ].map((f, i) => (
                  <A key={f.title} delay={i * 0.08}>
                    <div className="bg-card rounded-2xl p-5 border border-sand-dark/20 card-hover h-full text-center">
                      <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                        <f.icon size={20} />
                      </div>
                      <h3 className="font-bold text-sm mb-1">{f.title}</h3>
                      <p className="text-xs text-warm-gray leading-relaxed">{f.desc}</p>
                    </div>
                  </A>
                ))}
              </div>
            </div>
          </A>
        </div>
      </section>

      {/* Spot System */}
      <section className="py-20 sm:py-28 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="text-center lg:text-left">
                <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Organisatie</p>
                <h2 className="text-3xl sm:text-4xl font-black mb-6">Vaste plek met pleknummer</h2>
                <div className="section-divider mt-0 mb-6 mx-auto lg:mx-0" />
                <p className="text-warm-gray mb-4 leading-relaxed">Elke caravan krijgt bij ons een eigen, vaste plek met een uniek pleknummer. Zo weet u altijd precies waar uw caravan staat en kunnen wij efficiënt werken bij controles, reparaties en transport.</p>
                <p className="text-warm-gray mb-4 leading-relaxed">Via uw persoonlijk klantportaal kunt u altijd uw pleknummer, contractstatus, inspectierapportages en facturen online inzien. U kunt ook service aanvragen indienen voor reparatie, schoonmaak of transport.</p>
                <p className="text-warm-gray mb-8 leading-relaxed">Ons terrein is ingedeeld in overzichtelijke zones. De buitenstalling is verdeeld over zones A tot en met D, de binnenstalling is zone H, en de seizoensstalling heeft een eigen zone S.</p>
                <div className="space-y-3 text-left max-w-sm mx-auto lg:mx-0">
                  {['Zones A-D: Buitenstalling (jaarrond)', 'Zone H: Binnenstalling (geïsoleerde hal)', 'Zone S: Seizoensstalling (oktober-april)'].map(z => (
                    <div key={z} className="flex items-center gap-3 text-sm"><CheckCircle size={14} className="text-success shrink-0" /><span className="font-medium">{z}</span></div>
                  ))}
                </div>
              </div>
              <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-sand-dark/20">
                <div className="grid grid-cols-4 gap-2">
                  {['A-001','A-002','A-003','A-004','A-005','A-006','A-007','A-008','B-001','B-002','B-003','B-004','H-001','H-002','H-003','H-004'].map((spot, i) => {
                    const c = i < 8 ? (i % 3 === 0 ? 'bg-accent/15 text-accent-dark' : i % 3 === 1 ? 'bg-ocean/15 text-ocean-dark' : 'bg-warning/15 text-warning') : i < 12 ? 'bg-accent/15 text-accent-dark' : 'bg-ocean/15 text-ocean-dark';
                    return <div key={spot} className={`${c} rounded-xl p-3 text-center text-xs font-bold`}>{spot}</div>;
                  })}
                </div>
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-sand-dark/20">
                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-warm-gray"><span className="w-2.5 h-2.5 bg-accent rounded-full" /> Vrij</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-warm-gray"><span className="w-2.5 h-2.5 bg-ocean rounded-full" /> Bezet</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-warm-gray"><span className="w-2.5 h-2.5 bg-warning rounded-full" /> Gereserveerd</span>
                </div>
              </div>
            </div>
          </A>
        </div>
      </section>

      {/* Wat kunt u stallen */}
      <section className="py-16 sm:py-20 bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black mb-4">Wat kunt u bij ons stallen?</h2>
            <p className="text-warm-gray text-sm">Wij stallen niet alleen caravans, maar ook campers, vouwwagens en boten.</p>
          </A>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: 'Caravans', desc: 'Alle merken en lengtes' },
              { type: 'Campers', desc: 'Integraal & halfintegraal' },
              { type: 'Vouwwagens', desc: 'Compact gestald' },
              { type: 'Boten & trailers', desc: 'Op aanvraag' },
            ].map((v, i) => (
              <A key={v.type} delay={i * 0.08}>
                <div className="bg-card rounded-xl p-5 border border-sand-dark/20 text-center card-hover">
                  <p className="font-bold text-sm mb-1">{v.type}</p>
                  <p className="text-xs text-warm-gray">{v.desc}</p>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Veelgestelde vragen</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Vragen over stalling?</h2>
            <div className="section-divider mt-5" />
          </A>
          <A>
            <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-sand-dark/[0.06] px-6 sm:px-8">
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

      {/* CTA */}
      <section className="bg-hero relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center relative">
          <A>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Wilt u uw caravan bij ons stallen?</h2>
            <p className="text-white/40 mb-4 max-w-lg mx-auto">Neem contact op voor een vrijblijvende offerte of bel voor direct advies. Wij spreken Nederlands, Engels en Spaans.</p>
            <p className="text-white/30 text-sm mb-8">Op werkdagen bereikbaar van 09:30 tot 16:30 uur</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/contact" className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all inline-flex items-center gap-2 shadow-sm">
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
