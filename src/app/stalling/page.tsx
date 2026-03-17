import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Thermometer, Camera, CheckCircle } from 'lucide-react';

export const metadata = { title: 'Stalling' };

const TYPES = [
  {
    title: 'Buitenstalling',
    desc: 'Veilige buitenstalling op ons afgesloten en beveiligde terrein. Ideaal voor seizoensstalling van uw caravan.',
    features: ['Afgesloten terrein', '24/7 camerabewaking', 'Securitas Direct alarm', 'Standdaard verzekerd', 'Tweewekelijkse controle', 'Jaarlijkse technische keuring'],
    price: 'Vanaf €65/maand',
  },
  {
    title: 'Binnenstalling (Overdekt)',
    desc: 'Overdekte parkeerplaatsen voor extra bescherming tegen zon, regen en temperatuurschommelingen. Ideaal voor langdurige stalling.',
    features: ['Geïsoleerde hal', 'Bescherming tegen weersomstandigheden', 'Geen last van hitte of koude', 'Alle voordelen van buitenstalling', 'Beperkte beschikbaarheid', 'Premium locatie'],
    price: 'Vanaf €95/maand',
  },
];

export default function StallingPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-primary-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Caravanstalling aan de <span className="text-accent">Costa Brava</span></h1>
          <p className="text-white/70 max-w-2xl text-lg">Dé specialist in het veilig en betrouwbaar stallen van uw caravan in Sant Climent de Peralta, Girona.</p>
        </div>
      </section>

      {/* Storage types */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          {TYPES.map(t => (
            <div key={t.title} className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-bold text-primary-dark mb-3">{t.title}</h2>
              <p className="text-muted mb-6">{t.desc}</p>
              <ul className="space-y-2 mb-6">
                {t.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm"><CheckCircle size={16} className="text-success shrink-0" /> {f}</li>
                ))}
              </ul>
              <p className="text-2xl font-bold text-accent">{t.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-primary-dark text-center mb-12">Veiligheid staat voorop</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Securitas Direct', desc: 'Professioneel alarmsysteem van Securitas Direct met directe alarmopvolging.' },
              { icon: Camera, title: '24/7 Camerabewaking', desc: 'Geavanceerd camerasysteem met continue registratie van alle bewegingen op het terrein.' },
              { icon: Thermometer, title: 'Standaard verzekerd', desc: 'Uw caravan is op onze stalling standaard verzekerd tegen schade en diefstal.' },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <f.icon className="text-primary" size={28} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
