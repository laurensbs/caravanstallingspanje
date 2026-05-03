import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Verwerkers',
  description: 'Lijst van partijen die persoonsgegevens namens ons verwerken (AVG art. 28).',
  alternates: alternatesFor('/verwerkers'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
