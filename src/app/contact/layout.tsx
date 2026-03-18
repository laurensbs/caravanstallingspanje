import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Neem Contact Op',
  description: 'Neem contact op met Caravanstalling Spanje. Bel +34 650 036 755, mail info@caravanstalling-spanje.com of vul het contactformulier in. Wij spreken Nederlands.',
  alternates: { canonical: 'https://caravanstalling-spanje.com/contact' },
  openGraph: {
    title: 'Contact | Caravanstalling Spanje',
    description: 'Neem contact op: +34 650 036 755 of info@caravanstalling-spanje.com. Wij spreken Nederlands.',
    url: 'https://caravanstalling-spanje.com/contact',
    type: 'website',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Contact Caravanstalling Spanje' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Caravanstalling Spanje',
    description: 'Bel +34 650 036 755 of mail info@caravanstalling-spanje.com. Wij spreken Nederlands.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
