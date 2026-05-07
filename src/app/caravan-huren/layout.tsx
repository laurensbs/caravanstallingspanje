import type { Metadata } from 'next';
import { alternatesFor, breadcrumbLd, serviceLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Caravan huren — Costa Brava',
  description:
    'Geen eigen caravan? Onze zustersite Caravanverhuur Spanje verzorgt complete caravan-vakanties — bezorgd op je camping, opgesteld en klaar voor gebruik.',
  alternates: alternatesFor('/caravan-huren'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="caravan-huren"
        payload={[
          breadcrumbLd([
            { name: 'Home', href: '/' },
            { name: 'Caravan huren', href: '/caravan-huren' },
          ]),
          serviceLd({
            name: 'Caravanverhuur Costa Brava',
            description: 'Volledig uitgeruste caravans bezorgd op aangesloten campings aan de Costa Brava — opgesteld en klaar bij aankomst.',
            url: '/caravan-huren',
            serviceType: 'Caravanverhuur',
          }),
        ]}
      />
      {children}
    </>
  );
}
