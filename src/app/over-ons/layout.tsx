import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Over ons',
  description:
    'Een familiebedrijf op de Costa Brava — al 25 jaar caravanstalling, reparatie en service voor Nederlandse en Belgische klanten.',
  alternates: alternatesFor('/over-ons'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
