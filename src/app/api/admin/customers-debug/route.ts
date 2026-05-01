import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Diagnose: laat zien welke kolommen 'customers' echt heeft (productie-DB).
export async function GET() {
  try {
    const cols = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'customers'
      ORDER BY ordinal_position`;
    return NextResponse.json({
      ok: true,
      columns: cols,
      hint: 'Don\'t see "name" here? Then Vercel is on a different DB than run-migrations used.',
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : 'unknown',
    }, { status: 500 });
  }
}

// POST: probeer een dummy-customer aan te maken zoals de Nieuwe-klant-flow.
export async function POST() {
  try {
    const r = await sql`INSERT INTO customers
      (name, email, phone, mobile, address, city, postal_code, country, vat_number, notes,
       holded_contact_id, holded_sync_failed, source)
      VALUES ('TEST', 'test@example.test', NULL, NULL, NULL, NULL, NULL, 'ES', NULL, NULL,
        NULL, false, 'manual')
      RETURNING *`;
    return NextResponse.json({ ok: true, customer: r[0] });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : 'unknown',
    }, { status: 500 });
  }
}
