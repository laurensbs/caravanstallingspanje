import TarievenClient from './TarievenClient';
import { getEffectivePrices } from '@/lib/pricing';
import { getSettings } from '@/lib/db';

// Server-component zodat de prijzen live uit DB komen (admin-instelbaar in
// /admin/instellingen). Verhuur uit fridge_price_*, transport uit
// transport_price_*, service uit service_price_*. Stalling blijft "Op
// aanvraag" want te variabel naar caravan-maat.
//
// Service-prijzen die op 0 staan vallen terug op "Op aanvraag" — dat is
// het signaal voor de admin om het bedrag bewust te verbergen.
export const dynamic = 'force-dynamic';

export default async function TarievenPage() {
  let rentPrices = { 'Grote koelkast': 40, 'Tafelmodel koelkast': 25, 'Airco': 50 };
  let transportPrices = { wij: 100, zelf: 50 };
  let servicePrices = { cleaningFull: 0, maintenanceFull: 0, inspection: 0, repairHourly: 0 };

  try {
    rentPrices = await getEffectivePrices();
  } catch (err) {
    console.warn('[tarieven] price fetch failed, using fallback:', err);
  }

  try {
    const s = await getSettings([
      'transport_price_wij_rijden',
      'transport_price_zelf',
      'service_price_cleaning_full',
      'service_price_maintenance_full',
      'service_price_inspection',
      'service_price_repair_hourly',
    ]);
    const wij = Number(s.transport_price_wij_rijden);
    const zelf = Number(s.transport_price_zelf);
    if (Number.isFinite(wij) && wij > 0) transportPrices.wij = wij;
    if (Number.isFinite(zelf) && zelf > 0) transportPrices.zelf = zelf;

    servicePrices = {
      cleaningFull: Number(s.service_price_cleaning_full) || 0,
      maintenanceFull: Number(s.service_price_maintenance_full) || 0,
      inspection: Number(s.service_price_inspection) || 0,
      repairHourly: Number(s.service_price_repair_hourly) || 0,
    };
  } catch (err) {
    console.warn('[tarieven] settings fetch failed, using fallback:', err);
  }

  return (
    <TarievenClient
      fridgeLarge={rentPrices['Grote koelkast']}
      fridgeTable={rentPrices['Tafelmodel koelkast']}
      airco={rentPrices.Airco}
      transportWij={transportPrices.wij}
      transportZelf={transportPrices.zelf}
      cleaningFull={servicePrices.cleaningFull}
      maintenanceFull={servicePrices.maintenanceFull}
      inspection={servicePrices.inspection}
      repairHourly={servicePrices.repairHourly}
    />
  );
}
