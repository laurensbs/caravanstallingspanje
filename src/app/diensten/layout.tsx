import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diensten | Reparatie, Onderhoud, Transport & CaravanRepair®',
  description: 'Alle diensten van Caravanstalling Spanje: reparatie, onderhoud, CaravanRepair® schadeherstel, transport, verkoop, verhuur en schoonmaak.',
  alternates: { canonical: 'https://caravanstalling-spanje.com/diensten' },
  openGraph: {
    title: 'Diensten | Reparatie, Onderhoud, Transport & CaravanRepair®',
    description: 'Reparatie, onderhoud, CaravanRepair® schadeherstel, transport, verkoop, verhuur en schoonmaak aan de Costa Brava.',
    url: 'https://caravanstalling-spanje.com/diensten',
    type: 'website',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Diensten Caravanstalling Spanje' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diensten Caravanstalling Spanje',
    description: 'Reparatie, onderhoud, transport en CaravanRepair® schadeherstel aan de Costa Brava.',
  },
};

export default function DienstenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
