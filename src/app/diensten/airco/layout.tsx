import type { Metadata } from 'next';
import { alternatesFor, breadcrumbLd, serviceLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Airco huren op je staanplaats',
  description:
    'Verkoeling op je caravan-staanplaats — bezorgd, geïnstalleerd en weer opgehaald. Vanaf één week.',
  alternates: alternatesFor('/diensten/airco'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="airco"
        payload={[
          breadcrumbLd([
            { name: 'Home', href: '/' },
            { name: 'Diensten', href: '/diensten' },
            { name: 'Airco huren', href: '/diensten/airco' },
          ]),
          serviceLd({
            name: 'Airco huren',
            description: 'Mobile airco bezorgd, geïnstalleerd en opgehaald op de camping. Vanaf één week.',
            url: '/diensten/airco',
            serviceType: 'Airco-verhuur',
          }),
        ]}
      />
      {children}
    </>
  );
}
