import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Privacyverklaring',
  description: 'Hoe Caravan Storage Spain S.L. persoonsgegevens verwerkt — AVG-conform.',
  alternates: alternatesFor('/privacy'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
