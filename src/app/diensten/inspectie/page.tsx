import InspectieClient from './InspectieClient';
import { fetchServicesCatalog, groupByCategory } from '@/lib/services-catalog';

// Chip-3 (prijs in hero) komt nu uit reparatie-paneel: laagste tarief
// in de inspectie-categorie. Geen aparte admin-prijs meer — één bron.
export const dynamic = 'force-dynamic';

export default async function InspectiePage() {
  let inspectionPrice = 0;
  try {
    const { services } = await fetchServicesCatalog();
    const grouped = groupByCategory(services);
    const list = [
      ...(grouped['inspectie'] || []),
      ...(grouped['inspection'] || []),
    ];
    if (list.length > 0) {
      inspectionPrice = Math.min(...list.map((s) => s.priceEur));
    }
  } catch (err) {
    console.warn('[inspectie] catalog fetch failed:', err);
  }
  return <InspectieClient inspectionPrice={inspectionPrice} />;
}
