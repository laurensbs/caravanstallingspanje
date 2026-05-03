import type { Metadata } from 'next';
import { alternatesFor, breadcrumbLd, serviceLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Transport stalling ↔ camping',
  description:
    'Wij brengen je caravan van de stalling naar de camping en weer terug. Heen-en-terug, vaste prijs.',
  alternates: alternatesFor('/diensten/transport'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="transport"
        payload={[
          breadcrumbLd([
            { name: 'Home', href: '/' },
            { name: 'Diensten', href: '/diensten' },
            { name: 'Transport', href: '/diensten/transport' },
          ]),
          serviceLd({
            name: 'Caravan-transport',
            description: 'Heen-en-terug van stalling naar je camping aan de Costa Brava.',
            url: '/diensten/transport',
            serviceType: 'Voertuigtransport',
          }),
        ]}
      />
      {children}
    </>
  );
}
