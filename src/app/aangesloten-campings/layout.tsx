import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Aangesloten campings — Costa Brava',
  description:
    'Wij leveren koelkasten, airco-units en transport op meer dan 40 aangesloten campings aan de Costa Brava. Bekijk per regio of zoek je camping op naam.',
  alternates: alternatesFor('/aangesloten-campings'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
