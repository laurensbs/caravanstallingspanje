import type { Metadata } from 'next';
import { alternatesFor, breadcrumbLd, serviceLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Service & onderhoud',
  description:
    'Waxen, schoonmaak, ozonbehandeling en meer onderhoudsdiensten voor je caravan. Direct online betalen.',
  alternates: alternatesFor('/diensten/service'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="service"
        payload={[
          breadcrumbLd([
            { name: 'Home', href: '/' },
            { name: 'Diensten', href: '/diensten' },
            { name: 'Service', href: '/diensten/service' },
          ]),
          serviceLd({
            name: 'Caravan service & onderhoud',
            description: 'Waxen, schoonmaak, ozonbehandeling en meer onderhoudsdiensten.',
            url: '/diensten/service',
            serviceType: 'Voertuigonderhoud',
          }),
        ]}
      />
      {children}
    </>
  );
}
