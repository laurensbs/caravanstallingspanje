import TarievenClient from './TarievenClient';
import { getEffectivePrices } from '@/lib/pricing';
import { getSettings } from '@/lib/db';
import { fetchServicesCatalog, groupByCategory, type PublicService } from '@/lib/services-catalog';

// Server-component die de prijzen uit twee bronnen leest:
//
// 1. Lokale app_settings (admin /admin/instellingen) → verhuur (koelkast/
//    airco) per week, transport-tarieven, reparatie-uurtarief.
// 2. Reparatie-paneel master via /api/services-public → de echte
//    schoonmaak/onderhoud/inspectie services-catalogus. Dit is dezelfde
//    bron als /diensten/service boekform — geen dubbel beheer meer.
//
// Stalling blijft "Op aanvraag" want te variabel naar caravan-maat.
export const dynamic = 'force-dynamic';

export default async function TarievenPage() {
  let rentPrices = { 'Grote koelkast': 40, 'Tafelmodel koelkast': 25, 'Airco': 50 };
  let transportPrices = { wij: 100, zelf: 50 };
  let repairHourly = 0;

  try {
    rentPrices = await getEffectivePrices();
  } catch (err) {
    console.warn('[tarieven] rent price fetch failed:', err);
  }

  try {
    const s = await getSettings([
      'transport_price_wij_rijden',
      'transport_price_zelf',
      'service_price_repair_hourly',
    ]);
    const wij = Number(s.transport_price_wij_rijden);
    const zelf = Number(s.transport_price_zelf);
    if (Number.isFinite(wij) && wij > 0) transportPrices.wij = wij;
    if (Number.isFinite(zelf) && zelf > 0) transportPrices.zelf = zelf;
    repairHourly = Number(s.service_price_repair_hourly) || 0;
  } catch (err) {
    console.warn('[tarieven] settings fetch failed:', err);
  }

  // Master service-catalogus uit reparatie-paneel
  const { services } = await fetchServicesCatalog();
  const grouped = groupByCategory(services);

  // Categorie-buckets — naam-mapping van category-keys uit reparatie-paneel
  // naar onze publieke groepen. Onbekende categories vallen onder 'overig'.
  const cleaning: PublicService[] = [
    ...(grouped['schoonmaak'] || []),
    ...(grouped['cleaning'] || []),
  ];
  const maintenance: PublicService[] = [
    ...(grouped['onderhoud'] || []),
    ...(grouped['maintenance'] || []),
    ...(grouped['service'] || []),
  ];
  const inspection: PublicService[] = [
    ...(grouped['inspectie'] || []),
    ...(grouped['inspection'] || []),
  ];
  const repair: PublicService[] = [
    ...(grouped['reparatie'] || []),
    ...(grouped['repair'] || []),
  ];
  const other: PublicService[] = [
    ...(grouped['overig'] || []),
    ...(grouped['anders'] || []),
    ...(grouped['other'] || []),
  ];

  return (
    <TarievenClient
      fridgeLarge={rentPrices['Grote koelkast']}
      fridgeTable={rentPrices['Tafelmodel koelkast']}
      airco={rentPrices.Airco}
      transportWij={transportPrices.wij}
      transportZelf={transportPrices.zelf}
      repairHourly={repairHourly}
      cleaning={cleaning}
      maintenance={maintenance}
      inspection={inspection}
      repair={repair}
      other={other}
    />
  );
}
