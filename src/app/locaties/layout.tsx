import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Locaties | Sant Climent de Peralta, Costa Brava',
  description: 'Onze caravanstallinglocatie in Sant Climent de Peralta, Girona. Centraal aan de Costa Brava, dicht bij Pals, L\'Estartit en Begur. Bereikbaar via Girona Airport.',
  alternates: { canonical: 'https://caravanstalling-spanje.com/locaties' },
  openGraph: {
    title: 'Locaties | Sant Climent de Peralta, Costa Brava',
    description: 'Caravanstallinglocatie in Sant Climent de Peralta. Centraal aan de Costa Brava, dicht bij Pals, L\'Estartit en Begur.',
    url: 'https://caravanstalling-spanje.com/locaties',
    type: 'website',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Locatie Caravanstalling Spanje' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Locatie Sant Climent de Peralta',
    description: 'Caravanstalling in Sant Climent de Peralta, centraal aan de Costa Brava.',
  },
};

export default function LocatiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
