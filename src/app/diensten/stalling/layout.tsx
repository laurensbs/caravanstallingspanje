import type { Metadata } from 'next';
import { alternatesFor, breadcrumbLd, serviceLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Stalling — binnen of buiten',
  description:
    'Caravan stallen aan de Costa Brava — binnen in de loods of buiten op een vaste plek. 24/7 beveiligd, alarm + camera, verzekering inbegrepen.',
  alternates: alternatesFor('/diensten/stalling'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="storage"
        payload={[
          breadcrumbLd([
            { name: 'Home', href: '/' },
            { name: 'Diensten', href: '/diensten' },
            { name: 'Stalling', href: '/diensten/stalling' },
          ]),
          serviceLd({
            name: 'Caravanstalling',
            description: 'Overdekte of buitenplek stalling aan de Costa Brava — beveiligd 24/7.',
            url: '/diensten/stalling',
            serviceType: 'Voertuigstalling',
          }),
        ]}
      />
      {children}
    </>
  );
}
