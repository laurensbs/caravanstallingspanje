import { NextRequest, NextResponse } from 'next/server';
import { getBookingsInRange } from '@/lib/db';
import { getEffectiveStock } from '@/lib/pricing';

// GET /api/admin/planning?from=YYYY-MM-DD&to=YYYY-MM-DD
//   Returnt alle fridge_bookings die overlappen met [from..to] + capaciteit
//   per device-type voor de capacity-bar.
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    if (!from || !to) {
      return NextResponse.json({ error: 'from and to query params required (YYYY-MM-DD)' }, { status: 400 });
    }
    const [bookings, stock] = await Promise.all([
      getBookingsInRange(from, to),
      getEffectiveStock().catch(() => ({ 'Grote koelkast': 110, 'Tafelmodel koelkast': 20, 'Airco': 10 })),
    ]);
    return NextResponse.json({ bookings, stock });
  } catch (err) {
    console.error('[planning] error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'load failed' }, { status: 500 });
  }
}
