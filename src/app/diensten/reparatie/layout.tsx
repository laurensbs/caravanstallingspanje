import type { Metadata } from 'next';
import { alternatesFor, breadcrumbLd, serviceLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Reparatie aanvragen',
  description:
    'Schade, beading, onderdelen of een ander probleem aan je caravan? Onze werkplaats pakt het op — vast team, eigen materiaal.',
  alternates: alternatesFor('/diensten/reparatie'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="repair"
        payload={[
          breadcrumbLd([
            { name: 'Home', href: '/' },
            { name: 'Diensten', href: '/diensten' },
            { name: 'Reparatie', href: '/diensten/reparatie' },
          ]),
          serviceLd({
            name: 'Reparatie caravan',
            description: 'Schade, beading, onderdelen of een ander probleem aan je caravan — eigen werkplaats aan de Costa Brava.',
            url: '/diensten/reparatie',
            serviceType: 'Caravanreparatie',
          }),
        ]}
      />
      {children}
    </>
  );
}
