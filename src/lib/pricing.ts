export const PRICES = {
  'Grote koelkast': 40,
  'Tafelmodel koelkast': 25,
  'Airco': 50,
} as const;

// Transport-fallbacks: één centrale bron zodat /diensten/transport en
// /tarieven niet uit elkaar lopen wanneer admin een prijs wijzigt en
// de DB-fetch faalt.
export const TRANSPORT_PRICES_FALLBACK = {
  wij_rijden: 100,
  zelf: 50,
} as const;

export const TRANSPORT_SETTING_KEYS = {
  wij_rijden: 'transport_price_wij_rijden',
  zelf: 'transport_price_zelf',
} as const;

export async function getEffectiveTransportPrices(): Promise<{ wij_rijden: number; zelf: number }> {
  try {
    const { getSettings } = await import('./db');
    const map = await getSettings(Object.values(TRANSPORT_SETTING_KEYS));
    const wij = Number(map[TRANSPORT_SETTING_KEYS.wij_rijden]);
    const zelf = Number(map[TRANSPORT_SETTING_KEYS.zelf]);
    return {
      wij_rijden: Number.isFinite(wij) && wij > 0 ? wij : TRANSPORT_PRICES_FALLBACK.wij_rijden,
      zelf: Number.isFinite(zelf) && zelf > 0 ? zelf : TRANSPORT_PRICES_FALLBACK.zelf,
    };
  } catch (err) {
    console.error('[pricing] getEffectiveTransportPrices fallback to hardcoded:', err);
    return { ...TRANSPORT_PRICES_FALLBACK };
  }
}

export const STOCK = {
  'Grote koelkast': 110,
  'Tafelmodel koelkast': 20,
  'Airco': 10,
} as const;

export type DeviceType = keyof typeof PRICES;

export const MIN_DAYS = 7;

// Admin-overrides via app_settings. Hardcoded waarden zijn de fallback
// zodat de site nooit zonder prijs komt te staan.
export const PRICE_SETTING_KEYS = {
  'Grote koelkast': 'fridge_price_grote',
  'Tafelmodel koelkast': 'fridge_price_tafel',
  'Airco': 'fridge_price_airco',
} as const;

export const STOCK_SETTING_KEYS = {
  'Grote koelkast': 'fridge_stock_grote',
  'Tafelmodel koelkast': 'fridge_stock_tafel',
  'Airco': 'fridge_stock_airco',
} as const;

export async function getEffectivePrices(): Promise<Record<DeviceType, number>> {
  try {
    const { getSettings } = await import('./db');
    const keys = Object.values(PRICE_SETTING_KEYS);
    const map = await getSettings(keys);
    return {
      'Grote koelkast': Number(map[PRICE_SETTING_KEYS['Grote koelkast']] ?? PRICES['Grote koelkast']),
      'Tafelmodel koelkast': Number(map[PRICE_SETTING_KEYS['Tafelmodel koelkast']] ?? PRICES['Tafelmodel koelkast']),
      'Airco': Number(map[PRICE_SETTING_KEYS['Airco']] ?? PRICES['Airco']),
    };
  } catch (err) {
    console.error('[pricing] getEffectivePrices fallback to hardcoded:', err);
    return { ...PRICES };
  }
}

export async function getEffectiveStock(): Promise<Record<DeviceType, number>> {
  try {
    const { getSettings } = await import('./db');
    const keys = Object.values(STOCK_SETTING_KEYS);
    const map = await getSettings(keys);
    return {
      'Grote koelkast': Number(map[STOCK_SETTING_KEYS['Grote koelkast']] ?? STOCK['Grote koelkast']),
      'Tafelmodel koelkast': Number(map[STOCK_SETTING_KEYS['Tafelmodel koelkast']] ?? STOCK['Tafelmodel koelkast']),
      'Airco': Number(map[STOCK_SETTING_KEYS['Airco']] ?? STOCK['Airco']),
    };
  } catch (err) {
    console.error('[pricing] getEffectiveStock fallback to hardcoded:', err);
    return { ...STOCK };
  }
}

export async function calculatePriceWithSettings(deviceType: DeviceType, startDate: string, endDate: string) {
  const prices = await getEffectivePrices();
  return calculatePriceFor(prices[deviceType], startDate, endDate);
}

function calculatePriceFor(weekPrice: number, startDate: string, endDate: string) {
  // Dagprijs als exact 1/7 van de weekprijs — zo komt 14 dagen netjes uit
  // op 2 × weekprijs (€80 voor Grote koelkast) en 21 dagen op 3 ×
  // weekprijs. Het displayed dayPrice afronden we wel op centen voor de
  // breakdown-strip (admin/klant), maar de extraTotal en total worden
  // berekend op de exacte fractie zodat hele weken nooit een 'paar cent
  // teveel' krijgen door rounding.
  const exactDayPrice = weekPrice / 7;
  const dayPrice = Math.round(exactDayPrice * 100) / 100;
  const ms = new Date(endDate).getTime() - new Date(startDate).getTime();
  const rawDays = Math.round(ms / (1000 * 60 * 60 * 24));
  // Hard-eisen: minimaal 7 dagen huren. Throwen i.p.v. stilletjes oprichten
  // zodat de UI knop disabled blijft tot de klant een geldig bereik kiest.
  if (!Number.isFinite(rawDays) || rawDays < MIN_DAYS) {
    throw new Error(`Minimaal ${MIN_DAYS} dagen huren`);
  }
  const days = rawDays;
  const extraDays = Math.max(0, days - MIN_DAYS);
  const extraTotal = Math.round(extraDays * exactDayPrice * 100) / 100;
  const total = Math.round((weekPrice + extraTotal) * 100) / 100;
  return { days, weekPrice, dayPrice, extraDays, extraTotal, total };
}

// Client-side variant: gebruikt de meegegeven weekprijs (uit /api/order/prices)
// in plaats van de hardcoded PRICES-tabel. Zo blijft de display in sync met
// wat admin in de instellingen heeft gezet.
export function calculatePriceWith(weekPrice: number, startDate: string, endDate: string) {
  return calculatePriceFor(weekPrice, startDate, endDate);
}

// Helper om future test-modes makkelijk te plumben. Op productie altijd
// het echte bedrag.
export const TEST_MODE = false;

export function effectiveAmountEur(originalEur: number): number {
  return originalEur;
}

/**
 * Calculate the rental price.
 *
 * Minimum rental is one week (7 days, weekprijs). Every day beyond that
 * is charged at weekprijs / 7, rounded up to the nearest cent so we never
 * undercharge by a fractional cent.
 *
 * Returns euros as a number (e.g. 45.72).
 */
export function calculatePrice(deviceType: DeviceType, startDate: string, endDate: string): {
  days: number;
  weekPrice: number;
  dayPrice: number;
  extraDays: number;
  extraTotal: number;
  total: number;
} {
  return calculatePriceFor(PRICES[deviceType], startDate, endDate);
}

export function formatEur(amount: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
}
