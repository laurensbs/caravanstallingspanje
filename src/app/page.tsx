import HomePageClient from './HomePageClient';
import { fetchAffiliateCampings } from '@/lib/campings-fetch';

export const revalidate = 300;

export default async function HomePage() {
  const { campings } = await fetchAffiliateCampings();
  return <HomePageClient campings={campings} />;
}
