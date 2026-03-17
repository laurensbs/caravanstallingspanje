import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Shield, Wrench, Truck, Eye, MapPin, Star, CheckCircle, ArrowRight, Phone } from 'lucide-react';

const FEATURES = [
  { icon: Shield, title: 'Beveiligd terrein', desc: 'Securitas Direct alarmsysteem, 24/7 camerabewaking en afgesloten terrein.' },
  { icon: Eye, title: 'Tweewekelijkse controle', desc: 'Elke 2 weken controleren wij alle caravans op schades door weersomstandigheden.' },
  { icon: Wrench, title: 'Onderhoud & reparatie', desc: 'Complete werkplaats voor alle reparaties aan uw caravan, van banden tot interieur.' },
  { icon: Truck, title: 'Transport service', desc: '7 transporteenheden om uw caravan op de camping af te leveren en op te halen.' },
];

const SERVICES = [
  { title: 'Buitenstalling', desc: 'Veilige buitenstalling op beveiligd terrein', price: 'Vanaf €65/mnd' },
  { title: 'Binnenstalling', desc: 'Overdekte stalling met extra bescherming', price: 'Vanaf €95/mnd' },
  { title: 'Onderhoud', desc: 'Technische controles en onderhoud', price: 'Op aanvraag' },
  { title: 'Transport', desc: 'Op- en afzetten op uw camping', price: 'Op aanvraag' },
];

const REVIEWS = [
  { name: 'Wieger V.', text: 'Zeer fijne caravan stalling. Niet alleen stalling goed geregeld maar ook reparaties en assistentie bij eventuele problemen.', rating: 5 },
  { name: 'Harald H.', text: 'Perfecte service. Ze voeren alle reparaties uit. Nederlandssprekende eigenaar. We zijn perfect geholpen.', rating: 5 },
  { name: 'Wim D.', text: 'Een hele goede service. Klantvriendelijkheid kent geen grens. Echt vijf stralende sterren!', rating: 5 },
];

export default function HomePage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative bg-primary-dark text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-primary-dark/80" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-36">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-accent text-sm font-semibold mb-4">
              <MapPin size={16} /> Costa Brava, Spanje
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Meer dan alleen<br /><span className="text-accent">caravanstalling</span>
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-lg">
              Veilig stallen, professioneel onderhoud en betrouwbaar transport van uw caravan aan de Costa Brava. Al meer dan 10 jaar uw partner in Spanje.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/offerte" className="bg-accent hover:bg-accent-light text-primary-dark font-semibold px-7 py-3 rounded-xl text-sm transition-colors inline-flex items-center gap-2">
                Offerte aanvragen <ArrowRight size={16} />
              </Link>
              <Link href="/stalling" className="border border-white/30 hover:bg-white/10 text-white font-medium px-7 py-3 rounded-xl text-sm transition-colors">
                Meer informatie
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { val: '2000+', label: 'Caravans in beheer' },
              { val: '10+', label: 'Jaar ervaring' },
              { val: '4.9★', label: 'Google beoordeling' },
              { val: '12', label: 'Medewerkers in seizoen' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-accent">{s.val}</div>
                <div className="text-sm text-white/60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-primary-dark">Waarom Caravanstalling Spanje?</h2>
            <p className="text-muted mt-3 max-w-2xl mx-auto">Wij bieden meer dan alleen een plek voor uw caravan. Bij ons krijgt u een totaalpakket aan services.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-primary-dark">Onze diensten</h2>
            <p className="text-muted mt-3">Alles wat u nodig heeft voor uw caravan in Spanje</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map(s => (
              <div key={s.title} className="border border-gray-200 rounded-2xl p-6 hover:border-primary/30 transition-colors">
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted mb-4">{s.desc}</p>
                <p className="text-accent font-bold">{s.price}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/diensten" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
              Bekijk alle diensten <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 bg-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Wat onze klanten zeggen</h2>
            <div className="flex items-center justify-center gap-1 mt-3 text-accent">
              {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="currentColor" />)}
              <span className="text-white/70 ml-2">4.9 op Google</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map(r => (
              <div key={r.name} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-1 text-accent mb-3">
                  {Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p>
                <p className="text-white font-semibold text-sm">{r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-accent/10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-primary-dark mb-4">Klaar om uw caravan veilig te stallen?</h2>
          <p className="text-muted mb-8">Neem contact met ons op voor een vrijblijvende offerte. Wij beantwoorden uw vragen graag.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/offerte" className="bg-primary hover:bg-primary-light text-white font-semibold px-7 py-3 rounded-xl text-sm transition-colors inline-flex items-center gap-2">
              <CheckCircle size={16} /> Offerte aanvragen
            </Link>
            <a href="tel:+34972000000" className="border border-primary/30 hover:bg-primary/5 text-primary font-medium px-7 py-3 rounded-xl text-sm transition-colors inline-flex items-center gap-2">
              <Phone size={16} /> Bel ons direct
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
