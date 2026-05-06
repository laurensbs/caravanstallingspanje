import InspectieClient from './InspectieClient';
import { getSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function InspectiePage() {
  let inspectionPrice = 0;
  try {
    const s = await getSettings(['service_price_inspection']);
    inspectionPrice = Number(s.service_price_inspection) || 0;
  } catch (err) {
    console.warn('[inspectie] settings fetch failed:', err);
  }
  return <InspectieClient inspectionPrice={inspectionPrice} />;
}
