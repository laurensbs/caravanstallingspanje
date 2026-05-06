import CampingsClient from './CampingsClient';
import { fetchAffiliateCampings } from '@/lib/campings-fetch';

export const metadata = {
  title: 'Aangesloten campings — Costa Brava',
  description: 'Wij leveren koelkasten, airco-units en transport op meer dan 40 aangesloten campings aan de Costa Brava. Bekijk per regio of camping welke faciliteiten we daar bieden.',
};

// Server-component die live data uit het caravanverhuur-admin pakt
// (via /api/campings publiek endpoint). 5-min ISR via fetch revalidate.
export const revalidate = 300;

export default async function AangslotenCampingsPage() {
  const { campings } = await fetchAffiliateCampings();
  return <CampingsClient campings={campings} />;
}
