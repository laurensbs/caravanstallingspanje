import ReparatieClient from './ReparatieClient';
import { getSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ReparatiePage() {
  let hourlyRate = 0;
  try {
    const s = await getSettings(['service_price_repair_hourly']);
    hourlyRate = Number(s.service_price_repair_hourly) || 0;
  } catch (err) {
    console.warn('[reparatie] settings fetch failed:', err);
  }
  return <ReparatieClient hourlyRate={hourlyRate} />;
}
