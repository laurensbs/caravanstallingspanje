import TarievenClient from './TarievenClient';
import { getEffectivePrices } from '@/lib/pricing';
import { getSettings } from '@/lib/db';

// Server-component zodat de prijzen live uit DB komen (admin-instelbaar in
// /admin/instellingen). Verhuur uit fridge_price_*; transport uit
// transport_price_*; stalling op aanvraag (te variabel naar caravan-maat).
export const dynamic = 'force-dynamic';

export default async function TarievenPage() {
  let rentPrices = { 'Grote koelkast': 40, 'Tafelmodel koelkast': 25, 'Airco': 50 };
  let transportPrices = { wij: 100, zelf: 50 };

  try {
    rentPrices = await getEffectivePrices();
  } catch (err) {
    console.warn('[tarieven] price fetch failed, using fallback:', err);
  }

  try {
    const s = await getSettings(['transport_price_wij_rijden', 'transport_price_zelf']);
    const wij = Number(s.transport_price_wij_rijden);
    const zelf = Number(s.transport_price_zelf);
    if (Number.isFinite(wij) && wij > 0) transportPrices.wij = wij;
    if (Number.isFinite(zelf) && zelf > 0) transportPrices.zelf = zelf;
  } catch (err) {
    console.warn('[tarieven] transport-price fetch failed, using fallback:', err);
  }

  return (
    <TarievenClient
      fridgeLarge={rentPrices['Grote koelkast']}
      fridgeTable={rentPrices['Tafelmodel koelkast']}
      airco={rentPrices.Airco}
      transportWij={transportPrices.wij}
      transportZelf={transportPrices.zelf}
    />
  );
}
