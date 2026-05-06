import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Verkoop & inkoop — caravans en campers',
  description:
    'Tweedehands caravans en campers — gekeurd door eigen monteurs, foto-rapport beschikbaar. Klaar met je caravan? Wij doen een eerlijk inkoop-bod.',
  alternates: alternatesFor('/verkoop'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
