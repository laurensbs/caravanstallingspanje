import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Direct Reserveren | Stallingsplek Aanvragen',
  description: 'Vraag direct een stallingsplek aan voor uw caravan aan de Costa Brava. Online beschikbaarheid checken en reserveren. Binnen 24 uur bevestiging.',
  alternates: { canonical: 'https://caravanstalling-spanje.com/reserveren' },
  openGraph: {
    title: 'Direct Reserveren | Stallingsplek Costa Brava',
    description: 'Vraag direct een stallingsplek aan voor uw caravan aan de Costa Brava. Binnen 24 uur bevestiging.',
    url: 'https://caravanstalling-spanje.com/reserveren',
    type: 'website',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Reserveren Caravanstalling Spanje' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stallingsplek Reserveren',
    description: 'Vraag direct een stallingsplek aan aan de Costa Brava. Binnen 24 uur bevestiging.',
  },
};

export default function ReserverenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
