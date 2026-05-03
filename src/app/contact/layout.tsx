import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Vragen over stalling, transport, reparatie of een service? Stuur ons een bericht — we sturen je snel een persoonlijke reactie.',
  alternates: alternatesFor('/contact'),
  openGraph: {
    title: 'Contact · Caravanstalling Spanje',
    description: 'Stel je vraag — we koppelen snel terug.',
    url: '/contact',
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
