import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tarieven | Transparante Prijzen Caravanstalling',
  description: 'Transparante maandtarieven voor caravanstalling aan de Costa Brava. Buitenstalling vanaf €65/mnd, binnenstalling vanaf €95/mnd. Inclusief beveiliging en verzekering.',
  alternates: { canonical: 'https://caravanstalling-spanje.com/tarieven' },
};

export default function TarievenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
