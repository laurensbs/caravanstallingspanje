import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Caravanstalling Costa Brava | Buiten- & Binnenstalling',
  description: 'Veilige buiten- en binnenstalling voor uw caravan aan de Costa Brava. Securitas Direct alarm, 24/7 camerabewaking, standaard verzekerd. Vanaf €45/mnd.',
  alternates: { canonical: 'https://caravanstalling-spanje.com/stalling' },
  openGraph: {
    title: 'Caravanstalling Costa Brava | Buiten- & Binnenstalling',
    description: 'Veilige buiten- en binnenstalling voor uw caravan aan de Costa Brava. Securitas Direct alarm, 24/7 camerabewaking. Vanaf €45/mnd.',
    url: 'https://caravanstalling-spanje.com/stalling',
    type: 'website',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Caravanstalling Costa Brava' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Caravanstalling Costa Brava | Buiten- & Binnenstalling',
    description: 'Veilige stalling voor uw caravan aan de Costa Brava. Vanaf €45/mnd.',
  },
};

export default function StallingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
