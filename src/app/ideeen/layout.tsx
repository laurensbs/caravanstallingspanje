import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Ideeënbus',
  description:
    'Heb jij een idee voor ons? Een nieuwe service, een handigheidje voor op de camping, een bundel die we missen — wij lezen alles.',
  alternates: alternatesFor('/ideeen'),
  openGraph: { title: 'Ideeënbus · Caravanstalling Spanje', url: '/ideeen' },
};

export default function IdeeenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
