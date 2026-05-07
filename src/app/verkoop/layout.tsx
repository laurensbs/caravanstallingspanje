import type { Metadata } from 'next';
import { alternatesFor, breadcrumbLd, serviceLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Verkoop & inkoop — caravans en campers',
  description:
    'Tweedehands caravans en campers — gekeurd door eigen monteurs, foto-rapport beschikbaar. Klaar met je caravan? Wij doen een marktconform inkoop-bod.',
  alternates: alternatesFor('/verkoop'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="verkoop"
        payload={[
          breadcrumbLd([
            { name: 'Home', href: '/' },
            { name: 'Verkoop', href: '/verkoop' },
          ]),
          serviceLd({
            name: 'Verkoop & inkoop tweedehands caravans',
            description: 'Tweedehands caravans en campers gekeurd door eigen monteurs, mét foto-rapport. Inkoop binnen 48 uur met indicatief bod.',
            url: '/verkoop',
            serviceType: 'Caravan-verkoop',
          }),
        ]}
      />
      {children}
    </>
  );
}
