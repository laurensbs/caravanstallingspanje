import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Tellt fridge / stalling / transport orders die in de laatste 24u zijn
// aangemaakt. Klein endpoint dat het dashboard polled voor de "nieuwe
// orders"-banner.
export async function GET() {
  try {
    const fridgeRows = await sql`
      SELECT b.id, b.created_at, b.status, b.camping, b.start_date, f.name AS customer_name, f.device_type
      FROM fridge_bookings b
      JOIN fridges f ON f.id = b.fridge_id
      WHERE b.created_at > NOW() - INTERVAL '24 hours'
      ORDER BY b.created_at DESC
      LIMIT 20`;
    const stallingRows = await sql`
      SELECT id, created_at, status, name AS customer_name, type
      FROM stalling_requests
      WHERE created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 20`;
    const transportRows = await sql`
      SELECT id, created_at, status, name AS customer_name, camping
      FROM transport_requests
      WHERE created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 20`;
    return NextResponse.json({
      fridge: fridgeRows,
      stalling: stallingRows,
      transport: transportRows,
      total: (fridgeRows as unknown[]).length + (stallingRows as unknown[]).length + (transportRows as unknown[]).length,
    });
  } catch (err) {
    console.error('[recent-orders] error:', err);
    return NextResponse.json({ fridge: [], stalling: [], transport: [], total: 0 });
  }
}
