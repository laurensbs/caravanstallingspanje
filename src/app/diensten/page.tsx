import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Wrench, Sparkles, Truck, ClipboardCheck, CheckCircle } from 'lucide-react';

export const metadata = { title: 'Diensten' };

const DIENSTEN = [
  {
    icon: Wrench, title: 'Reparatie & Onderhoud',
    desc: 'Van het wisselen van banden tot remrevisies. Wij repareren dakluiken, ramen en airconditioning in onze goed uitgeruste werkplaats.',
    items: ['Banden & remmen', 'Elektra & verlichting', 'Dakluiken & ramen', 'Airco service', 'Chassis onderhoud', 'Interieur reparaties'],
  },
  {
    icon: ClipboardCheck, title: 'Technische keuring',
    desc: 'Jaarlijkse technische controle van uw caravan. Wij checken alles zodat u veilig op vakantie kunt.',
    items: ['Bandenspanning & profiel', 'Remmen & verlichting', 'Gasinstallatie', 'Elektra controle', 'Lekkage test', 'Veiligheidscheck'],
  },
  {
    icon: Sparkles, title: 'Schoonmaak',
    desc: 'Van stoomreiniging en waxen van de buitenkant tot grondige reiniging van het interieur.',
    items: ['Exterieur wassen & waxen', 'Stoomreiniging', 'Interieur dieptereiniging', 'Bekleding reinigen', 'Anti-schimmel behandeling', 'Raamreiniging'],
  },
  {
    icon: Truck, title: 'Transport',
    desc: 'Met 7 transporteenheden leveren wij uw caravan af op de camping en halen deze weer op.',
    items: ['Afleveren op camping', 'Ophalen van camping', 'Plaatsing op staanplaats', 'Seizoensvervoer', 'Noodtransport', 'Voortent op-/afbouw'],
  },
];

export default function DienstenPage() {
  return (
    <>
      <Header />

      <section className="bg-primary-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Onze <span className="text-accent">Diensten</span></h1>
          <p className="text-white/70 max-w-2xl text-lg">Meer dan alleen caravanstalling. Wij ontzorgen u volledig met onderhoud, reparatie, schoonmaak en transport.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          {DIENSTEN.map((d, i) => (
            <div key={d.title} id={d.title.toLowerCase().replace(/[^a-z]/g, '')} className={`flex flex-col ${i % 2 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-10 items-center`}>
              <div className="md:w-1/2">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <d.icon className="text-primary" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-primary-dark mb-3">{d.title}</h2>
                <p className="text-muted mb-6">{d.desc}</p>
                <ul className="grid grid-cols-2 gap-2">
                  {d.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm"><CheckCircle size={14} className="text-success shrink-0" /> {item}</li>
                  ))}
                </ul>
              </div>
              <div className="md:w-1/2 bg-surface rounded-2xl h-64 flex items-center justify-center">
                <d.icon className="text-primary/20" size={80} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
