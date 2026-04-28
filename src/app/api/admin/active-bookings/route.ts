import { NextResponse } from 'next/server';
import { getActiveBookings, getActiveBookingsByType } from '@/lib/db';
import { STOCK } from '@/lib/pricing';

export async function GET() {
  try {
    const [bookings, byType] = await Promise.all([
      getActiveBookings(),
      getActiveBookingsByType(),
    ]);
    const find = (t: string) => byType.find((r) => r.device_type === t)?.count ?? 0;
    return NextResponse.json({
      bookings,
      stats: {
        large: { current: find('Grote koelkast'), capacity: STOCK['Grote koelkast'] },
        table: { current: find('Tafelmodel koelkast'), capacity: STOCK['Tafelmodel koelkast'] },
        airco: { current: find('Airco'), capacity: STOCK['Airco'] },
      },
    });
  } catch (error) {
    console.error('Active bookings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch active bookings' }, { status: 500 });
  }
}
