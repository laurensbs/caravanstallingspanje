'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Wrench, Truck, ShoppingBag, Bike, SprayCan, ArrowRight, CheckCircle, Phone, Sparkles, ThermometerSnowflake, Wind, Eye, Camera, Lock, Zap, Award, Clock, MapPin, Users, FileCheck, HelpCircle } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FaqItem } from '@/components/FaqAccordion';

const dienstenFaqs = [
  { q: 'Welke reparaties kunnen jullie uitvoeren?', a: 'Wij voeren vrijwel alle reparaties uit: remmen, banden, verlichting, gasinstallatie, waterleiding, dakluiken, ramen, vloer, elektra en carrosserie. Van kleine klussen tot complete renovaties. Onze werkplaats is volledig uitgerust voor alle merken caravans en campers.' },
  { q: 'Wat is CaravanRepair® precies?', a: 'CaravanRepair® is het gepatenteerde schadeherstelsysteem voor geprofileerde buitenwanden. Deuken, barsten en vochtschade worden onzichtbaar hersteld zonder spuiten of verven. Als officieel Masterdealer bieden wij levenslange garantie. Alle verzekeraars erkennen dit systeem.' },
  { q: 'Hoe werkt het transport van Nederland naar Spanje?', a: 'Wij beschikken over 7 eigen transporteenheden. Wij halen uw caravan op in Nederland, België of Duitsland en leveren hem af op onze stalling of rechtstreeks op uw camping aan de Costa Brava. Retour is natuurlijk ook mogelijk. Neem contact op voor een offerte.' },
  { q: 'Kan ik een fiets of koelkast huren?', a: 'Ja, wij verhuren elektrische fietsen (€65/week), koelkasten (€120/seizoen) en mobiele airco-units (€85/week). Ideaal als aanvulling bij uw vakantie aan de Costa Brava. U kunt verhuurdiensten aanvragen via het klantportaal of telefonisch.' },
  { q: 'Regelen jullie de verzekeringsafhandeling bij schade?', a: 'Ja. Bij CaravanRepair® schadeherstel verzorgen wij de volledige afhandeling met uw verzekeraar, inclusief schaderapportage, foto\'s en offertes. U hoeft alleen uw polisnummer door te geven.' },
  { q: 'Hoe snel kunnen reparaties worden uitgevoerd?', a: 'Kleine reparaties (bandenwissel, lampen, simpele lekkages) voeren wij meestal dezelfde dag of volgende dag uit. Grotere reparaties plannen wij in overleg met u in. CaravanRepair® herstel duurt gemiddeld 2-5 werkdagen, afhankelijk van de omvang.' },
];

function A({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const v = useInView(ref, { once: true, margin: '-60px' });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={v ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }} className={className}>{children}</motion.div>;
}

export default function DienstenPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative bg-surface-dark text-white py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1920&q=80" alt="" fill className="object-cover opacity-20" priority />
          <div className="hero-overlay absolute inset-0" />
        </div>
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-primary-light text-xs font-bold tracking-[0.2em] uppercase mb-4">Onze diensten</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] mb-6">
              Meer dan alleen <span className="gradient-text">stalling</span>
            </h1>
            <p className="text-white/50 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed mb-8">
              Caravanstalling Spanje is uw totaalaanbieder aan de Costa Brava. Van veilige stalling en professionele reparaties tot het gepatenteerde CaravanRepair® schadeherstel, transport door heel Europa en verhuur van fietsen en koelkasten.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: Shield, label: 'Stalling', href: '#stalling' },
                { icon: Wrench, label: 'Reparatie', href: '#reparatie' },
                { icon: Sparkles, label: 'CaravanRepair®', href: '#caravanrepair' },
                { icon: Truck, label: 'Transport', href: '#transport' },
                { icon: ShoppingBag, label: 'Verkoop', href: '#verkoop' },
                { icon: Bike, label: 'Verhuur', href: '#verhuur' },
                { icon: SprayCan, label: 'Schoonmaak', href: '#schoonmaak' },
              ].map(s => (
                <a key={s.label} href={s.href} className="flex items-center gap-2 bg-white/[0.06] border border-white/10 text-white/70 hover:text-white hover:border-white/20 px-4 py-2 rounded-xl text-xs font-medium transition-all">
                  <s.icon size={14} /> {s.label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sticky service nav */}
      <nav className="sticky top-16 z-30 bg-white/95 backdrop-blur-xl border-b border-sand-dark/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2.5 no-scrollbar">
            {[
              { icon: Shield, label: 'Stalling', href: '#stalling' },
              { icon: Wrench, label: 'Reparatie', href: '#reparatie' },
              { icon: Sparkles, label: 'CaravanRepair®', href: '#caravanrepair' },
              { icon: Truck, label: 'Transport', href: '#transport' },
              { icon: ShoppingBag, label: 'Verkoop', href: '#verkoop' },
              { icon: Bike, label: 'Verhuur', href: '#verhuur' },
              { icon: SprayCan, label: 'Schoonmaak', href: '#schoonmaak' },
            ].map(s => (
              <a key={s.label} href={s.href} className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold text-warm-gray hover:text-primary hover:bg-primary/5 transition-all shrink-0">
                <s.icon size={13} /> {s.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ═══════════ STALLING ═══════════ */}
      <section id="stalling" className="py-20 sm:py-28 bg-white scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center"><Shield size={22} /></div>
                  <span className="text-[10px] font-bold bg-accent/8 text-accent px-3 py-1 rounded-full uppercase tracking-wider">Buiten &amp; Binnen</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black mb-4">Beveiligde caravanstalling</h2>
                <p className="text-warm-gray leading-relaxed mb-4">
                  Onze caravanstalling ligt in het prachtige Sant Climent de Peralta, aan de Costa Brava. Wij zijn dé specialist in het veilig en betrouwbaar stallen van caravans, campers, vouwwagens en boten. Al meer dan 20 jaar vertrouwen honderden eigenaren hun caravan aan ons toe.
                </p>
                <p className="text-warm-gray leading-relaxed mb-6">
                  Alle locaties zijn beveiligd met Securitas Direct alarmsysteem en 24/7 camerabewaking. Uw caravan is op onze stalling standaard verzekerd tegen schade en diefstal. Elke 2 weken worden alle caravans gecontroleerd op schades die kunnen ontstaan door weersomstandigheden. Jaarlijks voeren wij een volledige technische keuring uit.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { icon: Lock, label: 'Securitas Direct alarm' },
                    { icon: Camera, label: '24/7 camerabewaking' },
                    { icon: Shield, label: 'Standaard verzekerd' },
                    { icon: Eye, label: 'Tweewekelijkse controle' },
                    { icon: FileCheck, label: 'Jaarlijkse technische keuring' },
                    { icon: MapPin, label: 'Vaste pleknummers' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-2.5 text-sm"><f.icon size={14} className="text-success shrink-0" /> {f.label}</div>
                  ))}
                </div>

                <div className="flex items-center gap-6 mb-8 p-4 bg-sand/50 rounded-xl border border-sand-dark/20">
                  <div className="text-center">
                    <p className="text-2xl font-black">€65</p>
                    <p className="text-[10px] text-warm-gray font-medium">Buiten /mnd</p>
                  </div>
                  <div className="w-px h-10 bg-sand-dark/30" />
                  <div className="text-center">
                    <p className="text-2xl font-black">€95</p>
                    <p className="text-[10px] text-warm-gray font-medium">Binnen /mnd</p>
                  </div>
                  <div className="w-px h-10 bg-sand-dark/30" />
                  <div className="text-center">
                    <p className="text-2xl font-black">€45</p>
                    <p className="text-[10px] text-warm-gray font-medium">Seizoen /mnd</p>
                  </div>
                </div>

                <Link href="/stalling" className="bg-accent hover:bg-accent-dark text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2">
                  Bekijk stallingsopties <ArrowRight size={14} />
                </Link>
              </div>
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <Image src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80" alt="Beveiligd stallingsterrein aan de Costa Brava" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-xs font-medium bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg inline-block">Sant Climent de Peralta, Girona</p>
                </div>
              </div>
            </div>
          </A>
        </div>
      </section>

      {/* ═══════════ REPARATIE & ONDERHOUD ═══════════ */}
      <section id="reparatie" className="py-20 sm:py-28 bg-surface scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden aspect-[4/3] bg-ocean/5 border border-sand-dark/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-ocean/10 text-ocean rounded-2xl flex items-center justify-center mx-auto mb-4"><Wrench size={36} /></div>
                    <p className="text-sm font-bold text-surface-dark">Goed uitgeruste werkplaats</p>
                    <p className="text-xs text-warm-gray mt-1">Ervaren monteurs · Alle merken</p>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-ocean/10 text-ocean rounded-xl flex items-center justify-center"><Wrench size={22} /></div>
                  <span className="text-[10px] font-bold bg-ocean/8 text-ocean px-3 py-1 rounded-full uppercase tracking-wider">Werkplaats</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black mb-4">Reparatie &amp; onderhoud</h2>
                <p className="text-warm-gray leading-relaxed mb-4">
                  Heeft u pech met uw caravan aan de Costa Brava? Of wilt u uw caravan laten checken voor het volgende seizoen? Onze goed uitgeruste werkplaats met ervaren monteurs helpt u met alle voorkomende reparaties en onderhoudswerkzaamheden. Van het wisselen van banden tot remrevisies, van dakluiken en ramen tot de airconditioning.
                </p>
                <p className="text-warm-gray leading-relaxed mb-6">
                  Wij besteden het hele jaar door aandacht aan uw caravan. Naast de technische aspecten zoals banden, remmen en verlichting verzorgen wij ook reparaties aan het interieur en exterieur. Alle merken en typen caravans zijn welkom. Twijfel niet en laat uw caravan voor de zekerheid bij ons checken, zodat u veilig op weg gaat.
                </p>

                <div className="space-y-2 mb-8">
                  <p className="text-sm font-bold mb-2">Wat wij onder andere doen:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Banden wisselen & uitlijnen',
                      'Remrevisie & remleidingen',
                      'Gas- en elektra installaties',
                      'Dakluiken & ramen repareren',
                      'Airconditioning service',
                      'Chassis en koppeling',
                      'Vochtschade & lekkages',
                      'Interieur herstellingen',
                      'Verlichting & bekabeling',
                      'Jaarlijkse technische keuring',
                    ].map(f => (
                      <div key={f} className="flex items-center gap-2 text-sm"><CheckCircle size={13} className="text-success shrink-0" /> {f}</div>
                    ))}
                  </div>
                </div>

                <Link href="/contact" className="bg-ocean hover:bg-ocean-dark text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2">
                  Reparatie aanvragen <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </A>
        </div>
      </section>

      {/* ═══════════ CARAVANREPAIR® ═══════════ */}
      <section id="caravanrepair" className="py-20 sm:py-28 bg-white scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/8 text-primary px-4 py-1.5 rounded-full text-xs font-bold mb-4">
              <Award size={14} /> Officieel Masterdealer
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">CaravanRepair® schadeherstel</h2>
            <div className="section-divider mt-5 mb-5" />
            <p className="text-warm-gray leading-relaxed">
              CaravanRepair® is de grootste keten van erkende caravan- en camperschadespecialisten in Nederland en Europa. Caravanstalling Spanje is officieel CaravanRepair® Masterdealer — het hoogste niveau binnen het dealernetwerk.
            </p>
          </A>

          <A>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div>
                <h3 className="text-xl font-black mb-4">Gepatenteerd reparatiesysteem</h3>
                <p className="text-warm-gray leading-relaxed mb-4">
                  Dankzij het gepatenteerde CaravanRepair® systeem zijn wij in staat om alle geprofileerde caravan- en camperwanden volledig onzichtbaar te herstellen. Of het nu gaat om een kleine deuk, hagelschade, een scheur, vochtschade, krassen of schade door een aanrijding — bij ons bent u aan het juiste adres.
                </p>
                <p className="text-warm-gray leading-relaxed mb-4">
                  Waarom een complete zijwand vervangen als een reparatie volstaat? Het vervangen van een zijwand is vaak onnodig en sterk af te raden. Onze herstelmethode is duurzaam, sneller dan traditioneel herstel of wandvervanging, en het resultaat is volledig onzichtbaar.
                </p>
                <p className="text-warm-gray leading-relaxed mb-6">
                  Op alle door ons uitgevoerde geprofileerde wandreparaties bieden wij <strong className="text-surface-dark">levenslange garantie</strong>. Ons systeem wordt erkend door alle verzekeraars in Nederland en Europa. Wij zorgen ook voor de volledige afwikkeling met uw verzekeraar.
                </p>

                <div className="space-y-2 mb-8">
                  <p className="text-sm font-bold mb-2">Schades die wij herstellen:</p>
                  {[
                    'Hagel- en stormschade aan wanden',
                    'Aanrijdings- en parkeerschade',
                    'Scheuren of deuken in caravanwand',
                    'Lekkages en vochtschade',
                    'Krassen en beschadigingen',
                    'Schade aan geprofileerde wanden',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm"><CheckCircle size={14} className="text-success shrink-0" /> {f}</div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-surface rounded-2xl p-6 border border-sand-dark/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center"><Sparkles size={18} className="text-primary" /></div>
                    <h4 className="font-bold">Onzichtbaar herstel</h4>
                  </div>
                  <p className="text-sm text-warm-gray leading-relaxed">Het gepatenteerde systeem garandeert dat reparaties aan geprofileerde wanden 100% onzichtbaar zijn. Geen verschil met de originele wand.</p>
                </div>

                <div className="bg-surface rounded-2xl p-6 border border-sand-dark/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center"><Shield size={18} className="text-accent" /></div>
                    <h4 className="font-bold">Levenslange garantie</h4>
                  </div>
                  <p className="text-sm text-warm-gray leading-relaxed">Op alle geprofileerde wandreparaties ontvangt u levenslange garantie. Dat geeft een betrouwbaar en veilig gevoel voor de toekomst.</p>
                </div>

                <div className="bg-surface rounded-2xl p-6 border border-sand-dark/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-ocean/10 rounded-xl flex items-center justify-center"><FileCheck size={18} className="text-ocean" /></div>
                    <h4 className="font-bold">Erkend door alle verzekeraars</h4>
                  </div>
                  <p className="text-sm text-warm-gray leading-relaxed">Het CaravanRepair® systeem wordt erkend door alle verzekeraars. Wij verzorgen de complete afhandeling van uw schadeclaim.</p>
                </div>

                <div className="bg-surface rounded-2xl p-6 border border-sand-dark/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center"><Zap size={18} className="text-warning" /></div>
                    <h4 className="font-bold">Sneller &amp; duurzamer</h4>
                  </div>
                  <p className="text-sm text-warm-gray leading-relaxed">Onze methode is sneller dan een complete wandvervanging en levert een duurzamer resultaat op. Geen onnodige vervanging van materiaal.</p>
                </div>
              </div>
            </div>
          </A>

          <A>
            <div className="mt-12 text-center">
              <Link href="/contact" className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all inline-flex items-center gap-2 shadow-sm">
                Schade melden <ArrowRight size={14} />
              </Link>
            </div>
          </A>
        </div>
      </section>

      {/* ═══════════ TRANSPORT ═══════════ */}
      <section id="transport" className="py-20 sm:py-28 bg-surface scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center"><Truck size={22} /></div>
                  <span className="text-[10px] font-bold bg-primary/8 text-primary px-3 py-1 rounded-full uppercase tracking-wider">7 eenheden</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black mb-4">Transport door heel Europa</h2>
                <p className="text-warm-gray leading-relaxed mb-4">
                  In het seizoen werken wij met een wagenpark van 7 transporteenheden en circa 12 medewerkers om alle caravans op gezette tijden op de camping af te leveren en weer op te halen. Of u nu uw caravan vanuit Nederland naar Spanje wilt laten brengen of tussen campings aan de Costa Brava wilt verplaatsen — wij regelen het.
                </p>
                <p className="text-warm-gray leading-relaxed mb-6">
                  Uw caravan wordt door ervaren chauffeurs veilig getransporteerd. Wij bereiden uw caravan voor op het transport, controleren de banden, verlichting en koppeling, en leveren hem rijklaar af op de gewenste locatie. Op verzoek is ook gesloten transport mogelijk voor maximale bescherming onderweg.
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

                <Link href="/contact" className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2">
                  Transport aanvragen <ArrowRight size={14} />
                </Link>
              </div>
              <div className="bg-primary/5 rounded-2xl p-8 border border-sand-dark/20">
                <h3 className="font-bold text-lg mb-4">Veelgevraagde routes</h3>
                <div className="space-y-3">
                  {[
                    { route: 'Nederland → Costa Brava', time: '± 2 dagen' },
                    { route: 'België → Costa Brava', time: '± 1,5 dag' },
                    { route: 'Duitsland → Costa Brava', time: '± 2 dagen' },
                    { route: 'Camping → Stalling (regionaal)', time: 'Zelfde dag' },
                    { route: 'Stalling → Camping (regionaal)', time: 'Zelfde dag' },
                  ].map(r => (
                    <div key={r.route} className="flex items-center justify-between p-3 bg-white rounded-xl border border-sand-dark/20">
                      <span className="text-sm font-medium">{r.route}</span>
                      <span className="text-xs text-primary font-bold">{r.time}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-warm-gray mt-4">Tarieven op aanvraag. Afhankelijk van afstand en type voertuig.</p>
              </div>
            </div>
          </A>
        </div>
      </section>

      {/* ═══════════ VERKOOP ═══════════ */}
      <section id="verkoop" className="py-20 sm:py-28 bg-white scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="order-2 lg:order-1 bg-danger/5 rounded-2xl p-8 border border-sand-dark/20">
                <h3 className="font-bold text-lg mb-2">Huidig aanbod</h3>
                <p className="text-sm text-warm-gray mb-4">Enkele voorbeelden uit ons wisselend aanbod:</p>
                <div className="space-y-3">
                  {[
                    { model: 'Hobby Prestige 650', year: '2002', beds: '5 slaapplaatsen', price: '€ 6.000' },
                    { model: 'HomeCar 450 Racer', year: '2003', beds: '4 slaapplaatsen', price: '€ 6.750' },
                    { model: 'Knaus Sport', year: '1997', beds: '4 slaapplaatsen', price: '€ 5.250' },
                    { model: 'Adria 430 Unica', year: '2001', beds: '4 slaapplaatsen', price: '€ 5.250' },
                  ].map(c => (
                    <div key={c.model} className="flex items-center justify-between p-3 bg-white rounded-xl border border-sand-dark/20">
                      <div>
                        <p className="text-sm font-bold">{c.model}</p>
                        <p className="text-xs text-warm-gray">{c.year} · {c.beds}</p>
                      </div>
                      <span className="text-sm font-black text-primary">{c.price}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-warm-gray mt-4">Aanbod wijzigt regelmatig. Neem contact op voor actuele beschikbaarheid.</p>
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-danger/10 text-danger rounded-xl flex items-center justify-center"><ShoppingBag size={22} /></div>
                  <span className="text-[10px] font-bold bg-danger/8 text-danger px-3 py-1 rounded-full uppercase tracking-wider">Occasion</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black mb-4">Verkoop tweedehands caravans</h2>
                <p className="text-warm-gray leading-relaxed mb-4">
                  Op zoek naar een betaalbare caravan voor uw vakantie in Spanje? Wij verkopen gecontroleerde tweedehands caravans die direct klaarstaan voor gebruik aan de Costa Brava. Geen gedoe met transport vanuit Nederland — uw caravan staat al in Spanje.
                </p>
                <p className="text-warm-gray leading-relaxed mb-4">
                  Elke occasion caravan wordt door onze werkplaats nagekeken op technische staat, banden, remmen, elektra en gasinstallatie. Wij geven u eerlijk advies over de staat en eventueel benodigde reparaties. Met meer dan 20 jaar ervaring helpen wij ook onervaren kampeerders het perfecte model te vinden.
                </p>
                <p className="text-warm-gray leading-relaxed mb-6">
                  Wilt u uw eigen caravan verkopen? Wij verzorgen ook de verkoopbemiddeling. Van taxatie en foto&apos;s tot de administratieve afhandeling — u hoeft zelf niets te doen.
                </p>

                <div className="space-y-2 mb-8">
                  {[
                    'Volledig nagekeken door onze werkplaats',
                    'Eerlijke taxatie en transparante prijzen',
                    'Caravan staat al in Spanje, geen transportkosten',
                    'Verkoopbemiddeling voor uw eigen caravan',
                    'Administratieve afhandeling',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm"><CheckCircle size={14} className="text-success shrink-0" /> {f}</div>
                  ))}
                </div>

                <Link href="/contact" className="bg-surface-dark hover:bg-primary text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2">
                  Aanbod bekijken <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </A>
        </div>
      </section>

      {/* ═══════════ VERHUUR ═══════════ */}
      <section id="verhuur" className="py-20 sm:py-28 bg-surface scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-14">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center mx-auto mb-4"><Bike size={22} /></div>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Verhuur</h2>
            <div className="section-divider mt-5 mb-5" />
            <p className="text-warm-gray leading-relaxed">Handige extra&apos;s voor uw verblijf aan de Costa Brava. Direct leverbaar op uw camping of vakantieadres.</p>
          </A>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
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
            ].map((v, i) => (
              <A key={v.title} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-7 border border-sand-dark/20 h-full flex flex-col card-hover">
                  <div className={`w-12 h-12 ${v.color} rounded-xl flex items-center justify-center mb-5`}>
                    <v.icon size={22} />
                  </div>
                  <h3 className="font-black text-lg mb-3">{v.title}</h3>
                  <p className="text-sm text-warm-gray leading-relaxed mb-4 flex-1">{v.desc}</p>
                  <div className="space-y-2 mb-5">
                    {v.features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-xs"><CheckCircle size={12} className="text-success shrink-0" /> {f}</div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-sand-dark/20">
                    <p className="text-sm font-black text-primary">{v.price}</p>
                  </div>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SCHOONMAAK ═══════════ */}
      <section id="schoonmaak" className="py-20 sm:py-28 bg-white scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-ocean/10 text-ocean rounded-xl flex items-center justify-center"><SprayCan size={22} /></div>
                  <span className="text-[10px] font-bold bg-ocean/8 text-ocean px-3 py-1 rounded-full uppercase tracking-wider">Exterieur &amp; Interieur</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black mb-4">Professionele schoonmaak</h2>
                <p className="text-warm-gray leading-relaxed mb-4">
                  Hygiëne van uw caravan is belangrijk, zeker bij langdurige stalling aan de Costa Brava. Wij bieden diverse schoonmaakpakketten aan — van een basiswas van het exterieur tot een complete interieur- en exterieurbehandeling inclusief polishbehandeling en dakbehandeling.
                </p>
                <p className="text-warm-gray leading-relaxed mb-6">
                  Naast stoomreiniging en waxen van de buitenkant zorgen wij ook voor een grondige reiniging van het interieur. Het seizoensklaar pakket maakt uw caravan helemaal klaar voor het nieuwe seizoen: schoon van binnen en van buiten, technisch gecontroleerd en opgepoetst.
                </p>

                <div className="bg-sand/50 rounded-xl border border-sand-dark/20 overflow-hidden mb-8">
                  {[
                    { service: 'Basiswas exterieur', price: '€75' },
                    { service: 'Complete schoonmaak (ext. + int.)', price: '€150' },
                    { service: 'Polishbehandeling', price: '€195' },
                    { service: 'Anti-mos & alg behandeling', price: '€95' },
                    { service: 'Dakbehandeling', price: '€85' },
                    { service: 'Seizoensklaar pakket', price: '€245' },
                  ].map((s, i) => (
                    <div key={s.service} className={`flex items-center justify-between px-5 py-3 text-sm ${i !== 5 ? 'border-b border-sand-dark/20' : ''}`}>
                      <span>{s.service}</span>
                      <span className="font-bold text-primary">{s.price}</span>
                    </div>
                  ))}
                </div>

                <Link href="/contact" className="bg-ocean hover:bg-ocean-dark text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2">
                  Schoonmaak boeken <ArrowRight size={14} />
                </Link>
              </div>
              <div className="bg-ocean/5 rounded-2xl p-8 border border-sand-dark/20">
                <h3 className="font-bold text-lg mb-4">Seizoensklaar pakket</h3>
                <p className="text-sm text-warm-gray leading-relaxed mb-4">Ons meest complete pakket om uw caravan helemaal klaar te maken voor het nieuwe seizoen:</p>
                <div className="space-y-3">
                  {[
                    'Volledige buitenwas met stoomreiniger',
                    'Polishbehandeling voor diepe glans',
                    'Anti-mos en alg behandeling',
                    'Dakbehandeling en naden controleren',
                    'Interieur stofzuigen en reinigen',
                    'Koelkast en sanitair schoonmaken',
                    'Ramen en luifels reinigen',
                    'Technische basiscontrole',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm"><CheckCircle size={13} className="text-success shrink-0" /> {f}</div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-white rounded-xl border border-sand-dark/20 text-center">
                  <p className="text-3xl font-black">€245</p>
                  <p className="text-xs text-warm-gray">Compleet pakket</p>
                </div>
              </div>
            </div>
          </A>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Veelgestelde vragen</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Vragen over onze diensten?</h2>
            <div className="section-divider mt-5" />
          </A>
          <A>
            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-sand-dark/[0.06] px-6 sm:px-8">
              {dienstenFaqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </A>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: dienstenFaqs.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }) }} />
      </section>

      {/* CTA */}
      <section className="bg-surface-dark relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center relative">
          <A>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Hulp nodig? Wij staan voor u klaar</h2>
            <p className="text-white/40 mb-4 max-w-lg mx-auto">Neem contact op voor een vrijblijvende offerte of meer informatie. Wij spreken Nederlands, Engels en Spaans.</p>
            <p className="text-white/30 text-sm mb-8">Op werkdagen bereikbaar van 09:30 tot 16:30 uur</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/contact" className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all inline-flex items-center gap-2 shadow-sm">
                Neem contact op <ArrowRight size={15} />
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
