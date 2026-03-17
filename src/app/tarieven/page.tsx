import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

export const metadata = { title: 'Tarieven' };

const PLANS = [
  {
    name: 'Buitenstalling',
    price: '€65',
    period: '/maand',
    desc: 'Veilige buitenstalling op beveiligd terrein',
    features: ['Afgesloten terrein', '24/7 bewaking', 'Standaard verzekerd', 'Tweewekelijkse controle', 'Jaarlijkse technische keuring', 'Gratis plaatsen/verplaatsen op terrein'],
    popular: false,
  },
  {
    name: 'Binnenstalling',
    price: '€95',
    period: '/maand',
    desc: 'Overdekte stalling met maximale bescherming',
    features: ['Alle voordelen buitenstalling', 'Geïsoleerde hal', 'Bescherming tegen zon & regen', 'Geen temperatuurschommelingen', 'Premium locatie', 'Beperkt beschikbaar'],
    popular: true,
  },
  {
    name: 'Seizoensstalling',
    price: '€45',
    period: '/maand',
    desc: 'Tijdelijke stalling buiten het seizoen (okt-apr)',
    features: ['Buitenstalling', 'Beveiligd terrein', 'Camerabewaking', 'Minimaal 6 maanden', 'Flexibele start/einddatum', 'Overgang naar jaarstalling mogelijk'],
    popular: false,
  },
];

const EXTRAS = [
  { name: 'Transport (binnen 30km)', price: 'Vanaf €75' },
  { name: 'Transport (30-60km)', price: 'Vanaf €125' },
  { name: 'Jaarlijks onderhoud pakket', price: '€149/jaar' },
  { name: 'Exterieur wassen & waxen', price: 'Vanaf €89' },
  { name: 'Interieur dieptereiniging', price: 'Vanaf €129' },
  { name: 'Bandenwissel (4 banden)', price: 'Vanaf €49' },
  { name: 'Voortent op-/afbouw', price: 'Vanaf €59' },
  { name: 'Accu laden & onderhoud', price: '€25' },
];

export default function TarievenPage() {
  return (
    <>
      <Header />

      <section className="bg-primary-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Onze <span className="text-accent">Tarieven</span></h1>
          <p className="text-white/70 max-w-2xl text-lg">Transparante prijzen zonder verrassingen. Alle prijzen zijn exclusief 21% IVA.</p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map(p => (
              <div key={p.name} className={`relative rounded-2xl p-8 border-2 ${p.popular ? 'border-primary shadow-xl scale-[1.02]' : 'border-gray-200'}`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">POPULAIR</div>}
                <h3 className="text-xl font-bold text-primary-dark">{p.name}</h3>
                <p className="text-sm text-muted mt-1 mb-4">{p.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-primary-dark">{p.price}</span>
                  <span className="text-muted">{p.period}</span>
                </div>
                <ul className="space-y-2 mb-8">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm"><CheckCircle size={14} className="text-success shrink-0" /> {f}</li>
                  ))}
                </ul>
                <Link href="/offerte" className={`block text-center font-semibold px-6 py-3 rounded-xl text-sm transition-colors ${p.popular ? 'bg-primary hover:bg-primary-light text-white' : 'bg-surface hover:bg-gray-200 text-primary-dark'}`}>
                  Offerte aanvragen <ArrowRight size={14} className="inline ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Extra services */}
      <section className="py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-primary-dark text-center mb-10">Extra diensten</h2>
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
            {EXTRAS.map(e => (
              <div key={e.name} className="flex items-center justify-between px-6 py-4">
                <span className="text-sm font-medium">{e.name}</span>
                <span className="text-sm font-bold text-primary-dark">{e.price}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted mt-4">Alle prijzen zijn exclusief 21% IVA (Spaans BTW). Maatwerk tarieven op aanvraag.</p>
        </div>
      </section>

      <Footer />
    </>
  );
}
