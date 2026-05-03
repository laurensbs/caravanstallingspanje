import type { Metadata } from 'next';
import { alternatesFor, breadcrumbLd, serviceLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Koelkast huren op je staanplaats',
  description:
    'Bezorgd op je staanplaats: grote koelkast of tafelmodel. Vanaf één week, geen gedoe — wij brengen en halen.',
  alternates: alternatesFor('/koelkast'),
  openGraph: {
    title: 'Koelkast huren · Caravanstalling Spanje',
    description: 'Bezorgd op je staanplaats. Vanaf één week.',
    url: '/koelkast',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="fridge"
        payload={[
          breadcrumbLd([
            { name: 'Home', href: '/' },
            { name: 'Koelkast huren', href: '/koelkast' },
          ]),
          serviceLd({
            name: 'Koelkast huren',
            description: 'Grote koelkast of tafelmodel bezorgd op je staanplaats — vanaf één week.',
            url: '/koelkast',
            serviceType: 'Koelkast-verhuur',
          }),
        ]}
      />
      {children}
    </>
  );
}
