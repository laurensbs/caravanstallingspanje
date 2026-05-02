import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Tellt orders + berichten + ideas + waitlist-aanmeldingen die in de
// laatste 24u zijn aangemaakt. Klein endpoint dat het dashboard polled
// voor de "nieuwe orders"-banner. Try/catch per query zodat één missende
// tabel (bv. ideas vóór migrate) niet de hele banner kapotmaakt.
export async function GET() {
  const safe = async <T>(p: Promise<T>): Promise<T | []> => p.catch(() => [] as T | []);

  const [fridgeRows, stallingRows, transportRows, contactRows, ideaRows, waitlistRows] = await Promise.all([
    safe(sql`
      SELECT b.id, b.created_at, b.status, b.camping, b.start_date, f.name AS customer_name, f.device_type
      FROM fridge_bookings b
      JOIN fridges f ON f.id = b.fridge_id
      WHERE b.created_at > NOW() - INTERVAL '24 hours'
      ORDER BY b.created_at DESC
      LIMIT 20`),
    safe(sql`
      SELECT id, created_at, status, name AS customer_name, type
      FROM stalling_requests
      WHERE created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 20`),
    safe(sql`
      SELECT id, created_at, status, name AS customer_name, camping
      FROM transport_requests
      WHERE created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 20`),
    safe(sql`
      SELECT id, created_at, status, name AS customer_name, subject
      FROM contact_messages
      WHERE created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 20`),
    safe(sql`
      SELECT id, created_at, status, COALESCE(name, 'anoniem') AS customer_name, title, category
      FROM ideas
      WHERE created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 20`),
    safe(sql`
      SELECT id, created_at, status, name AS customer_name, device_type, camping
      FROM fridge_waitlist
      WHERE created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 20`),
  ]);

  const len = (rows: unknown): number => Array.isArray(rows) ? rows.length : 0;
  return NextResponse.json({
    fridge: fridgeRows,
    stalling: stallingRows,
    transport: transportRows,
    contact: contactRows,
    ideas: ideaRows,
    waitlist: waitlistRows,
    total: len(fridgeRows) + len(stallingRows) + len(transportRows) + len(contactRows) + len(ideaRows) + len(waitlistRows),
  });
}
