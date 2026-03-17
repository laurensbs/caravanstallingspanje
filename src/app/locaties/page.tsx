import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, Shield, Car, CheckCircle } from 'lucide-react';

export const metadata = { title: 'Locaties' };

const LOCATIONS = [
  {
    name: 'Hoofdlocatie - Sant Climent de Peralta',
    address: 'Ctra de Palamos, 91, 17110 Sant Climent de Peralta, Girona',
    type: 'Buiten- & binnenstalling',
    capacity: '800+ plaatsen',
    features: ['Buitenstalling', 'Overdekte binnenstalling', 'Werkplaats', 'Wasplaats', 'Securitas Direct bewaking', '24/7 camerabewaking'],
  },
  {
    name: 'Locatie Pals',
    address: 'Omgeving Pals, Costa Brava',
    type: 'Buitenstalling',
    capacity: '600+ plaatsen',
    features: ['Ruim buitenterrein', 'Afgesloten terrein', 'Camerabewaking', 'Goede bereikbaarheid', 'Dichtbij populaire campings'],
  },
  {
    name: 'Locatie Blanes',
    address: 'Omgeving Blanes, Costa Brava',
    type: 'Buitenstalling',
    capacity: '500+ plaatsen',
    features: ['Buitenstalling', 'Beveiligd terrein', 'Camerabewaking', 'Zuid Costa Brava', 'Seizoensstalling'],
  },
];

export default function LocatiesPage() {
  return (
    <>
      <Header />

      <section className="bg-primary-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Onze <span className="text-accent">Locaties</span></h1>
          <p className="text-white/70 max-w-2xl text-lg">Meerdere beveiligde terreinen verspreid over de Costa Brava voor optimale service.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          {LOCATIONS.map(l => (
            <div key={l.name} className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin className="text-primary" size={28} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-primary-dark mb-1">{l.name}</h2>
                  <p className="text-muted text-sm mb-4">{l.address}</p>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <span className="flex items-center gap-1.5 text-sm"><Shield size={14} className="text-primary" /> {l.type}</span>
                    <span className="flex items-center gap-1.5 text-sm"><Car size={14} className="text-primary" /> {l.capacity}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {l.features.map(f => (
                      <span key={f} className="flex items-center gap-1.5 text-sm text-muted"><CheckCircle size={13} className="text-success shrink-0" /> {f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
