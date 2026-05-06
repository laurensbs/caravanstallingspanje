import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Tarieven — alle prijzen op een rij',
  description:
    'Heldere prijzen voor stalling, verhuur (koelkast/airco), transport, schoonmaak, onderhoud en inspectie. Stalling op aanvraag — afhankelijk van caravan-maat.',
  alternates: alternatesFor('/tarieven'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
