import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Caravan huren — Costa Brava',
  description:
    'Geen eigen caravan? Onze zustersite Caravanverhuur Spanje verzorgt complete caravan-vakanties — bezorgd op je camping, opgesteld en klaar voor gebruik.',
  alternates: alternatesFor('/caravan-huren'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
