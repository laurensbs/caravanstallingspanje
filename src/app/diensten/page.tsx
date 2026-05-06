import DienstenClient from './DienstenClient';
import { fetchServicesCatalog, groupByCategory, type PublicService } from '@/lib/services-catalog';

// Server-component die de master service-catalogus uit reparatie-paneel
// trekt (zelfde bron als /diensten/service boekform). Geen lokale
// admin-prijzen meer voor cleaning/maintenance — één source-of-truth.
export const dynamic = 'force-dynamic';

export default async function DienstenIndex() {
  const { services } = await fetchServicesCatalog();
  const grouped = groupByCategory(services);

  const cleaning: PublicService[] = [
    ...(grouped['schoonmaak'] || []),
    ...(grouped['cleaning'] || []),
  ];
  const maintenance: PublicService[] = [
    ...(grouped['onderhoud'] || []),
    ...(grouped['maintenance'] || []),
    ...(grouped['service'] || []),
  ];

  return <DienstenClient cleaning={cleaning} maintenance={maintenance} />;
}
