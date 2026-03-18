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

const placeSchema = {
  '@context': 'https://schema.org',
  '@type': 'Place',
  name: 'Caravanstalling Spanje — Sant Climent de Peralta',
  description: 'Professionele caravanstallinglocatie aan de Costa Brava met 24/7 bewaking, Securitas alarm en ruime stalplaatsen.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Ctra de Palamós, 91',
    addressLocality: 'Sant Climent de Peralta',
    addressRegion: 'Girona',
    postalCode: '17110',
    addressCountry: 'ES',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 41.9983,
    longitude: 3.1142,
  },
  telephone: '+34650036755',
  url: 'https://caravanstalling-spanje.com/locaties',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:30',
    closes: '16:30',
  },
};

export default function LocatiesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(placeSchema) }} />
      {children}
    </>
  );
}
