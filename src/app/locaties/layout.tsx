import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Locaties | Sant Climent de Peralta, Costa Brava',
  description: 'Onze caravanstallinglocatie in Sant Climent de Peralta, Girona. Centraal aan de Costa Brava, dicht bij Pals, L\'Estartit en Begur. Bereikbaar via Girona Airport.',
  alternates: { canonical: 'https://caravanstalling-spanje.com/locaties' },
};

export default function LocatiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
