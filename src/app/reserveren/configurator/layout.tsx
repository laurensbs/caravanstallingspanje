import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Plan ophaaldatum — reserveer je stalling',
  description:
    'Reserveer een stallingplek aan de Costa Brava in 4 stappen. Configurator → gegevens → overzicht → bevestiging.',
  alternates: alternatesFor('/reserveren/configurator'),
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
