import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Backfill voor de nieuwe fridge_bookings.device_type kolom. Bestaande rijen
// hebben NULL — die zetten we op de parent fridge.device_type zodat de AC-units
// filter ook hun oudere bookings vindt. Idempotent: alleen NULL-rijen worden
// aangeraakt.
export async function GET() {
  try {
    const before = await sql`
      SELECT COUNT(*) AS c FROM fridge_bookings WHERE device_type IS NULL
    ` as unknown as Array<{ c: string | number }>;
    const nullCount = Number(before[0]?.c ?? 0);

    await sql`
      UPDATE fridge_bookings b
      SET device_type = f.device_type, updated_at = NOW()
      FROM fridges f
      WHERE b.fridge_id = f.id
        AND b.device_type IS NULL
        AND f.device_type IS NOT NULL
    `;

    const after = await sql`
      SELECT COUNT(*) AS c FROM fridge_bookings WHERE device_type IS NULL
    ` as unknown as Array<{ c: string | number }>;
    const remaining = Number(after[0]?.c ?? 0);

    // Per device-type breakdown — handig om te zien dat AC-units er zit.
    const breakdown = await sql`
      SELECT device_type, COUNT(*) AS c
      FROM fridge_bookings
      WHERE device_type IS NOT NULL
      GROUP BY device_type
      ORDER BY c DESC
    `;

    return NextResponse.json({
      ok: true,
      filled: nullCount - remaining,
      stillNull: remaining,
      breakdown,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'unknown' }, { status: 500 });
  }
}
