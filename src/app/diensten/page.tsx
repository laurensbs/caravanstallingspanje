import DienstenClient from './DienstenClient';
import { getSettings } from '@/lib/db';

// Server-component zodat de service-prijzen live uit DB komen — admin
// regelt ze in /admin/instellingen onder "Service rates". Een waarde van
// 0 valt terug op "Op aanvraag" in de UI.
export const dynamic = 'force-dynamic';

export default async function DienstenIndex() {
  let prices = { cleaningFull: 0, maintenanceFull: 0, inspection: 0 };
  try {
    const s = await getSettings([
      'service_price_cleaning_full',
      'service_price_maintenance_full',
      'service_price_inspection',
    ]);
    prices = {
      cleaningFull: Number(s.service_price_cleaning_full) || 0,
      maintenanceFull: Number(s.service_price_maintenance_full) || 0,
      inspection: Number(s.service_price_inspection) || 0,
    };
  } catch (err) {
    console.warn('[diensten] settings fetch failed, falling back to "Op aanvraag":', err);
  }
  return <DienstenClient {...prices} />;
}
