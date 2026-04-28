export const PRICES = {
  'Grote koelkast': 40,
  'Tafelmodel koelkast': 25,
} as const;

export type DeviceType = keyof typeof PRICES;

export const MIN_DAYS = 7;

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
  const weekPrice = PRICES[deviceType];
  const dayPrice = Math.ceil((weekPrice / 7) * 100) / 100;
  const ms = new Date(endDate).getTime() - new Date(startDate).getTime();
  const days = Math.max(MIN_DAYS, Math.round(ms / (1000 * 60 * 60 * 24)));
  const extraDays = Math.max(0, days - MIN_DAYS);
  const extraTotal = Math.round(extraDays * dayPrice * 100) / 100;
  const total = Math.round((weekPrice + extraTotal) * 100) / 100;
  return { days, weekPrice, dayPrice, extraDays, extraTotal, total };
}

export function formatEur(amount: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
}
