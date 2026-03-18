import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Caravanstalling Costa Brava | Buiten- & Binnenstalling',
  description: 'Veilige buiten- en binnenstalling voor uw caravan aan de Costa Brava. Securitas Direct alarm, 24/7 camerabewaking, standaard verzekerd. Vanaf €45/mnd.',
  alternates: { canonical: 'https://caravanstalling-spanje.com/stalling' },
};

export default function StallingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
