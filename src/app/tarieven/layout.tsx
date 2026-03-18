import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tarieven | Transparante Prijzen Caravanstalling',
  description: 'Transparante maandtarieven voor caravanstalling aan de Costa Brava. Buitenstalling vanaf €65/mnd, binnenstalling vanaf €95/mnd. Inclusief beveiliging en verzekering.',
  alternates: { canonical: 'https://caravanstalling-spanje.com/tarieven' },
  openGraph: {
    title: 'Tarieven | Transparante Prijzen Caravanstalling Spanje',
    description: 'Transparante maandtarieven: buitenstalling vanaf €65/mnd, binnenstalling vanaf €95/mnd. Inclusief beveiliging en verzekering.',
    url: 'https://caravanstalling-spanje.com/tarieven',
    type: 'website',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Tarieven Caravanstalling Spanje' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarieven Caravanstalling Spanje',
    description: 'Buitenstalling vanaf €65/mnd, binnenstalling vanaf €95/mnd. Inclusief beveiliging.',
  },
};

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Caravanstalling Spanje',
  description: 'Professionele caravanstalling aan de Costa Brava met 24/7 bewaking, inclusief verzekering.',
  brand: { '@type': 'Organization', name: 'Caravan Storage Spain S.L.' },
  url: 'https://caravanstalling-spanje.com/tarieven',
  offers: [
    {
      '@type': 'Offer',
      name: 'Seizoensstalling (apr-okt)',
      price: '45',
      priceCurrency: 'EUR',
      unitText: 'maand',
      availability: 'https://schema.org/InStock',
      url: 'https://caravanstalling-spanje.com/reserveren',
    },
    {
      '@type': 'Offer',
      name: 'Buitenstalling (jaarrond)',
      price: '65',
      priceCurrency: 'EUR',
      unitText: 'maand',
      availability: 'https://schema.org/InStock',
      url: 'https://caravanstalling-spanje.com/reserveren',
    },
    {
      '@type': 'Offer',
      name: 'Binnenstalling (jaarrond)',
      price: '95',
      priceCurrency: 'EUR',
      unitText: 'maand',
      availability: 'https://schema.org/InStock',
      url: 'https://caravanstalling-spanje.com/reserveren',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    bestRating: '5',
    ratingCount: '25',
  },
};

export default function TarievenLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      {children}
    </>
  );
}
