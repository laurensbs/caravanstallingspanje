'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Wrench, Truck, ShoppingBag, Bike, SprayCan, ArrowRight, CheckCircle,  Sparkles, ThermometerSnowflake, Wind, Eye, Camera, Lock, Zap, Award, Clock, MapPin, Users, FileCheck, HelpCircle } from 'lucide-react';
import A from '@/components/AnimateIn';
import CtaSection from '@/components/CtaSection';
import PageHero from '@/components/PageHero';
import { FaqItem } from '@/components/FaqAccordion';
import QuizModal from '@/components/QuizModal';

const dienstenFaqs = [
  { q: 'Welke reparaties kunnen jullie uitvoeren?', a: 'Wij voeren vrijwel alle reparaties uit: remmen, banden, verlichting, gasinstallatie, waterleiding, dakluiken, ramen, vloer, elektra en carrosserie. Van kleine klussen tot complete renovaties. Onze werkplaats is volledig uitgerust voor alle merken caravans en campers.' },
  { q: 'Wat is CaravanRepair® precies?', a: 'CaravanRepair® is het gepatenteerde schadeherstelsysteem voor geprofileerde buitenwanden. Deuken, barsten en vochtschade worden onzichtbaar hersteld zonder spuiten of verven. Als officieel Masterdealer bieden wij levenslange garantie. Alle verzekeraars erkennen dit systeem.' },
  { q: 'Hoe werkt het transport van Nederland naar Spanje?', a: 'Wij beschikken over 7 eigen transporteenheden. Wij halen uw caravan op in Nederland, België of Duitsland en leveren hem af op onze stalling of rechtstreeks op uw camping aan de Costa Brava. Retour is natuurlijk ook mogelijk. Neem contact op voor een offerte.' },
  { q: 'Kan ik een fiets of koelkast huren?', a: 'Ja, wij verhuren elektrische fietsen (€65/week), koelkasten (€120/seizoen) en mobiele airco-units (€85/week). Ideaal als aanvulling bij uw vakantie aan de Costa Brava. U kunt verhuurdiensten aanvragen via het klantportaal of telefonisch.' },
  { q: 'Regelen jullie de verzekeringsafhandeling bij schade?', a: 'Ja. Bij CaravanRepair® schadeherstel verzorgen wij de volledige afhandeling met uw verzekeraar, inclusief schaderapportage, foto\'s en offertes. U hoeft alleen uw polisnummer door te geven.' },
  { q: 'Hoe snel kunnen reparaties worden uitgevoerd?', a: 'Kleine reparaties (bandenwissel, lampen, simpele lekkages) voeren wij meestal dezelfde dag of volgende dag uit. Grotere reparaties plannen wij in overleg met u in. CaravanRepair® herstel duurt gemiddeld 2-5 werkdagen, afhankelijk van de omvang.' },
];


export default function DienstenPage() {
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizInterest, setQuizInterest] = useState('');
  const [activeSection, setActiveSection] = useState('stalling');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const openQuiz = (interest: string) => { setQuizInterest(interest); setQuizOpen(true); };

  useEffect(() => {
    const ids = ['stalling', 'reparatie', 'caravanrepair', 'transport', 'verkoop', 'verhuur', 'schoonmaak'];
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);
  return (
    <>
      <Header />

      <PageHero badge="Onze diensten" title={<>Meer dan alleen <span className="gradient-text">stalling</span></>} subtitle="Caravanstalling Spanje is uw totaalaanbieder aan de Costa Brava. Van veilige stalling en professionele reparaties tot het gepatenteerde CaravanRepair® schadeherstel, transport door heel Europa en verhuur van fietsen en koelkasten." image="https://u.cubeupload.com/laurensbos/caravanstoragespain5.jpg">
        <div className="flex flex-wrap justify-center gap-3 mt-8">
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
      </PageHero>

      {/* Sticky service nav */}
      <nav className="sticky top-16 z-30 bg-card/95 backdrop-blur-xl border-b border-sand-dark/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2.5 no-scrollbar relative">
            {[
              { icon: Shield, label: 'Stalling', href: '#stalling', id: 'stalling' },
              { icon: Wrench, label: 'Reparatie', href: '#reparatie', id: 'reparatie' },
              { icon: Sparkles, label: 'CaravanRepair®', href: '#caravanrepair', id: 'caravanrepair' },
              { icon: Truck, label: 'Transport', href: '#transport', id: 'transport' },
              { icon: ShoppingBag, label: 'Verkoop', href: '#verkoop', id: 'verkoop' },
              { icon: Bike, label: 'Verhuur', href: '#verhuur', id: 'verhuur' },
              { icon: SprayCan, label: 'Schoonmaak', href: '#schoonmaak', id: 'schoonmaak' },
            ].map(s => (
              <a key={s.label} href={s.href} className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${activeSection === s.id ? 'text-primary bg-primary/8' : 'text-warm-gray hover:text-primary hover:bg-primary/5'}`}>
                <s.icon size={13} /> {s.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Compact service overview grid */}
      <section className="py-8 sm:py-12 bg-surface border-b border-sand-dark/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { icon: Shield, label: 'Stalling', price: 'Vanaf €65/mnd', href: '#stalling', color: 'text-accent' },
              { icon: Wrench, label: 'Reparatie', price: 'Op aanvraag', href: '#reparatie', color: 'text-ocean' },
              { icon: Sparkles, label: 'CaravanRepair®', price: 'Verzekerd', href: '#caravanrepair', color: 'text-primary' },
              { icon: Truck, label: 'Transport', price: 'Op aanvraag', href: '#transport', color: 'text-primary' },
              { icon: ShoppingBag, label: 'Verkoop', price: 'Vanaf €5.250', href: '#verkoop', color: 'text-danger' },
              { icon: Bike, label: 'Verhuur', price: 'Vanaf €65/wk', href: '#verhuur', color: 'text-accent' },
              { icon: SprayCan, label: 'Schoonmaak', price: 'Vanaf €75', href: '#schoonmaak', color: 'text-ocean' },
            ].map(s => (
              <a key={s.label} href={s.href} className="card-premium p-4 text-center shine-on-hover group">
                <s.icon size={20} className={`${s.color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                <p className="text-xs font-bold">{s.label}</p>
                <p className="text-[10px] text-warm-gray mt-0.5">{s.price}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ STALLING ═══════════ */}
      <section id="stalling" className="py-14 sm:py-24 bg-card scroll-mt-28 relative overflow-hidden">
        <div className="absolute inset-0 line-pattern opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center"><Shield size={22} /></div>
                  <span className="text-xs font-bold bg-accent/8 text-accent px-3 py-1 rounded-full uppercase tracking-wider">Buiten &amp; Binnen</span>
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
                    <p className="text-xs text-warm-gray font-medium">Buiten /mnd</p>
                  </div>
                  <div className="w-px h-10 bg-sand-dark/30" />
                  <div className="text-center">
                    <p className="text-2xl font-black">€95</p>
                    <p className="text-xs text-warm-gray font-medium">Binnen /mnd</p>
                  </div>
                </div>

                <Link href="/stalling" className="bg-accent hover:bg-accent-dark text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2">
                  Bekijk stallingsopties <ArrowRight size={14} />
                </Link>
              </div>
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <Image src="https://u.cubeupload.com/laurensbos/caravanstoragespain2.jpg" alt="Beveiligd stallingsterrein aan de Costa Brava" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
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
      <section id="reparatie" className="py-14 sm:py-24 bg-premium-cool scroll-mt-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
              <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden aspect-[4/3]">
                <Image src="https://u.cubeupload.com/laurensbos/caravanstoragespain5.jpg" alt="Werkplaats reparatie en onderhoud" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-xs font-medium bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg inline-block">Goed uitgeruste werkplaats · Alle merken</p>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-ocean/10 text-ocean rounded-xl flex items-center justify-center"><Wrench size={22} /></div>
                  <span className="text-xs font-bold bg-ocean/8 text-ocean px-3 py-1 rounded-full uppercase tracking-wider">Werkplaats</span>
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

                <button onClick={() => openQuiz('reparatie')} className="bg-ocean hover:bg-ocean-dark text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2 cursor-pointer">
                  Reparatie aanvragen <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </A>
        </div>
      </section>

      {/* ═══════════ CARAVANREPAIR® ═══════════ */}
      <section id="caravanrepair" className="section-immersive scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <A className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-white/10 text-primary-light px-4 py-1.5 rounded-full text-xs font-bold mb-3">
              <Award size={14} /> Officieel Masterdealer
            </div>
            <h2 className="text-2xl sm:text-4xl font-black mb-3 text-white">CaravanRepair® schadeherstel</h2>
            <div className="divider-animated mt-3 mb-4" />
            <p className="text-white/60 leading-relaxed text-sm sm:text-base">
              CaravanRepair® is de grootste keten van erkende caravan- en camperschadespecialisten in Nederland en Europa. Caravanstalling Spanje is officieel CaravanRepair® Masterdealer — het hoogste niveau binnen het dealernetwerk.
            </p>
          </A>

          <A>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
              <div>
                <h3 className="text-xl font-black mb-4 text-white">Gepatenteerd reparatiesysteem</h3>
                <p className="text-white/60 leading-relaxed mb-4">
                  Dankzij het gepatenteerde CaravanRepair® systeem zijn wij in staat om alle geprofileerde caravan- en camperwanden volledig onzichtbaar te herstellen. Of het nu gaat om een kleine deuk, hagelschade, een scheur, vochtschade, krassen of schade door een aanrijding — bij ons bent u aan het juiste adres.
                </p>
                <p className="text-white/60 leading-relaxed mb-4">
                  Waarom een complete zijwand vervangen als een reparatie volstaat? Het vervangen van een zijwand is vaak onnodig en sterk af te raden. Onze herstelmethode is duurzaam, sneller dan traditioneel herstel of wandvervanging, en het resultaat is volledig onzichtbaar.
                </p>
                <p className="text-white/60 leading-relaxed mb-6">
                  Op alle door ons uitgevoerde geprofileerde wandreparaties bieden wij <strong className="text-white">levenslange garantie</strong>. Ons systeem wordt erkend door alle verzekeraars in Nederland en Europa. Wij zorgen ook voor de volledige afwikkeling met uw verzekeraar.
                </p>

                <div className="space-y-2 mb-8">
                  <p className="text-sm font-bold mb-2 text-white">Schades die wij herstellen:</p>
                  {[
                    'Hagel- en stormschade aan wanden',
                    'Aanrijdings- en parkeerschade',
                    'Scheuren of deuken in caravanwand',
                    'Lekkages en vochtschade',
                    'Krassen en beschadigingen',
                    'Schade aan geprofileerde wanden',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-white/70"><CheckCircle size={14} className="text-primary-light shrink-0" /> {f}</div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="card-glass p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Sparkles size={18} className="text-primary-light" /></div>
                    <h4 className="font-bold text-white">Onzichtbaar herstel</h4>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">Het gepatenteerde systeem garandeert dat reparaties aan geprofileerde wanden 100% onzichtbaar zijn.</p>
                </div>

                <div className="card-glass p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Shield size={18} className="text-accent-light" /></div>
                    <h4 className="font-bold text-white">Levenslange garantie</h4>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">Op alle geprofileerde wandreparaties ontvangt u levenslange garantie.</p>
                </div>

                <div className="card-glass p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><FileCheck size={18} className="text-ocean-light" /></div>
                    <h4 className="font-bold text-white">Erkend door alle verzekeraars</h4>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">Wij verzorgen de complete afhandeling van uw schadeclaim.</p>
                </div>

                <div className="card-glass p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Zap size={18} className="text-warning" /></div>
                    <h4 className="font-bold text-white">Sneller &amp; duurzamer</h4>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">Sneller dan een complete wandvervanging en levert een duurzamer resultaat op.</p>
                </div>
              </div>
            </div>
          </A>

          <A>
            <div className="mt-12 text-center">
              <button onClick={() => openQuiz('schadeherstel')} className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all inline-flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer">
                Schade melden <ArrowRight size={14} />
              </button>
            </div>
          </A>
        </div>
      </section>

      {/* ═══════════ TRANSPORT ═══════════ */}
      <section id="transport" className="py-14 sm:py-24 bg-premium-warm scroll-mt-28 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center"><Truck size={22} /></div>
                  <span className="text-xs font-bold bg-primary/8 text-primary px-3 py-1 rounded-full uppercase tracking-wider">7 eenheden</span>
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

                <button onClick={() => openQuiz('transport')} className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2 cursor-pointer">
                  Transport aanvragen <ArrowRight size={14} />
                </button>
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
                    <div key={r.route} className="flex items-center justify-between p-3 bg-card rounded-xl border border-sand-dark/20">
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
      <section id="verkoop" className="py-14 sm:py-24 bg-card scroll-mt-28 relative overflow-hidden">
        <div className="absolute inset-0 line-pattern opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
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
                    <div key={c.model} className="flex items-center justify-between p-3 bg-card rounded-xl border border-sand-dark/20">
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
                  <span className="text-xs font-bold bg-danger/8 text-danger px-3 py-1 rounded-full uppercase tracking-wider">Occasion</span>
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

                <button onClick={() => openQuiz('verkoop')} className="bg-hero hover:bg-primary text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2 cursor-pointer">
                  Aanbod bekijken <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </A>
        </div>
      </section>

      {/* ═══════════ VERHUUR ═══════════ */}
      <section id="verhuur" className="py-14 sm:py-24 bg-premium-accent scroll-mt-28 relative overflow-hidden">
        <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-accent/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center mx-auto mb-3"><Bike size={22} /></div>
            <h2 className="text-2xl sm:text-4xl font-black mb-3">Verhuur</h2>
            <div className="divider-animated mt-3 mb-4" />
            <p className="text-warm-gray leading-relaxed text-sm">Extra&apos;s voor uw verblijf aan de Costa Brava. Direct leverbaar op uw camping.</p>
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
                <div className="card-premium p-7 h-full flex flex-col">
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
      <section id="schoonmaak" className="py-14 sm:py-24 bg-card scroll-mt-28 relative overflow-hidden">
        <div className="absolute inset-0 line-pattern opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-ocean/10 text-ocean rounded-xl flex items-center justify-center"><SprayCan size={22} /></div>
                  <span className="text-xs font-bold bg-ocean/8 text-ocean px-3 py-1 rounded-full uppercase tracking-wider">Exterieur &amp; Interieur</span>
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

                <button onClick={() => openQuiz('schoonmaak')} className="bg-ocean hover:bg-ocean-dark text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2 cursor-pointer">
                  Schoonmaak boeken <ArrowRight size={14} />
                </button>
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
                <div className="mt-6 p-4 bg-card rounded-xl border border-sand-dark/20 text-center">
                  <p className="text-3xl font-black">€245</p>
                  <p className="text-xs text-warm-gray">Compleet pakket</p>
                </div>
              </div>
            </div>
          </A>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-24 bg-premium-warm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3"><HelpCircle size={11} className="text-primary" /><span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">Veelgestelde vragen</span></span>
            <h2 className="text-2xl sm:text-4xl font-black mb-3">Vragen over onze diensten?</h2>
            <div className="divider-animated mt-3" />
          </A>
          <A>
            <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-sand-dark/[0.06] px-6 sm:px-8">
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

      <CtaSection title="Hulp nodig? Wij staan voor u klaar" subtitle="Neem contact op voor een vrijblijvende offerte of meer informatie. Wij spreken Nederlands, Engels en Spaans." hours="Op werkdagen bereikbaar van 09:30 tot 16:30 uur" primaryLabel="Neem contact op" onPrimaryClick={() => setQuizOpen(true)} />

      <QuizModal open={quizOpen} onClose={() => { setQuizOpen(false); setQuizInterest(''); }} source="diensten" initialInterest={quizInterest || undefined} />
      <Footer />
    </>
  );
}
