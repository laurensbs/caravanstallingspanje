import type { Metadata } from 'next';
import { alternatesFor, breadcrumbLd, serviceLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Inspectie aanvragen',
  description:
    'Technische keuring van je caravan met rapport — geschikt voor vóór het seizoen, na schade of voor verkoop.',
  alternates: alternatesFor('/diensten/inspectie'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="inspection"
        payload={[
          breadcrumbLd([
            { name: 'Home', href: '/' },
            { name: 'Diensten', href: '/diensten' },
            { name: 'Inspectie', href: '/diensten/inspectie' },
          ]),
          serviceLd({
            name: 'Caravaninspectie',
            description: 'Technische keuring met rapport — pre-season, post-damage of voor verkoop.',
            url: '/diensten/inspectie',
            serviceType: 'Voertuiginspectie',
          }),
        ]}
      />
      {children}
    </>
  );
}
