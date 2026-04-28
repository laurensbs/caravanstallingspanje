import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getInvoice } from '@/lib/holded';

// Returns the Holded payment status for every booking that has a holded_invoice_id.
// Looked up live; we keep the response small (just id → status) so it's cheap to
// fetch alongside the fridges list.
export async function GET(_req: NextRequest) {
  try {
    const rows = await sql`
      SELECT id, holded_invoice_id
      FROM fridge_bookings
      WHERE holded_invoice_id IS NOT NULL`;
    const list = rows as { id: number; holded_invoice_id: string }[];

    const results = await Promise.all(
      list.map(async r => {
        const inv = await getInvoice(r.holded_invoice_id);
        return inv ? {
          bookingId: r.id,
          status: inv.status,
          publicUrl: inv.publicUrl,
        } : null;
      }),
    );

    const map: Record<number, { status: string; publicUrl?: string }> = {};
    for (const r of results) {
      if (r) map[r.bookingId] = { status: r.status, publicUrl: r.publicUrl };
    }
    return NextResponse.json({ statuses: map });
  } catch (error) {
    console.error('Holded status fetch error:', error);
    return NextResponse.json({ statuses: {} });
  }
}
