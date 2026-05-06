import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Veelgestelde vragen',
  description:
    'Antwoorden op veelgestelde vragen over stalling, reparatie, transport, betaling en het klantportaal.',
  alternates: alternatesFor('/faq'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
