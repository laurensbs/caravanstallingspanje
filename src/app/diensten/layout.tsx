import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, serviceLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Diensten — reparatie, service, inspectie, transport, stalling',
  description:
    'Reparatie, service, inspectie, transport en stalling voor je caravan aan de Costa Brava. Eigen werkplaats, vast team, 24/7 beveiligd.',
  alternates: alternatesFor('/diensten'),
  openGraph: { title: 'Diensten · Caravanstalling Spanje', url: '/diensten' },
};

const SERVICES = [
  { name: 'Reparatie', description: 'Schade, beading, onderdelen of een ander probleem aan je caravan.', url: '/diensten/reparatie' },
  { name: 'Service', description: 'Waxen, schoonmaak, ozonbehandeling en meer onderhoudsdiensten.', url: '/diensten/service' },
  { name: 'Inspectie', description: 'Technische keuring met rapport — vóór seizoen of na schade.', url: '/diensten/inspectie' },
  { name: 'Transport', description: 'Heen-en-terug van stalling naar je camping. Wij regelen het.', url: '/diensten/transport' },
  { name: 'Stalling', description: 'Caravan stallen op ons terrein — binnen of buiten op een vaste plek.', url: '/diensten/stalling' },
  { name: 'Airco huren', description: 'Verkoeling op je staanplaats — bezorgd, geïnstalleerd en weer opgehaald.', url: '/diensten/airco' },
];

export default function DienstenLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="diensten"
        payload={[
          breadcrumbLd([
            { name: 'Home', href: '/' },
            { name: 'Diensten', href: '/diensten' },
          ]),
          ...SERVICES.map((s) => serviceLd(s)),
        ]}
      />
      {children}
    </>
  );
}
