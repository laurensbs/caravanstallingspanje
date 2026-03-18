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

export default function TarievenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
