import { NextResponse } from 'next/server';
import { getActiveBookings, getActiveBookingsByType } from '@/lib/db';
import { getEffectiveStock } from '@/lib/pricing';

export async function GET() {
  try {
    const [bookings, byType, stock] = await Promise.all([
      getActiveBookings(),
      getActiveBookingsByType(),
      getEffectiveStock(),
    ]);
    const find = (t: string) => byType.find((r) => r.device_type === t)?.count ?? 0;
    return NextResponse.json({
      bookings,
      stats: {
        large: { current: find('Grote koelkast'), capacity: stock['Grote koelkast'] },
        table: { current: find('Tafelmodel koelkast'), capacity: stock['Tafelmodel koelkast'] },
        airco: { current: find('Airco'), capacity: stock['Airco'] },
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[admin/active-bookings GET] error:', msg, err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
