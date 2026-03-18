import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Direct Reserveren | Stallingsplek Aanvragen',
  description: 'Vraag direct een stallingsplek aan voor uw caravan aan de Costa Brava. Online beschikbaarheid checken en reserveren. Binnen 24 uur bevestiging.',
  alternates: { canonical: 'https://caravanstalling-spanje.com/reserveren' },
};

export default function ReserverenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
