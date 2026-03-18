import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diensten | Reparatie, Onderhoud, Transport & CaravanRepair®',
  description: 'Alle diensten van Caravanstalling Spanje: reparatie, onderhoud, CaravanRepair® schadeherstel, transport, verkoop, verhuur en schoonmaak.',
  alternates: { canonical: 'https://caravanstalling-spanje.com/diensten' },
};

export default function DienstenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
