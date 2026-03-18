import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCustomerSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('customer_token')?.value;
  if (!token) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  const session = await getCustomerSession(token);
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  try {
    const inspections = await sql`
      SELECT i.id, i.inspection_date, i.type, i.status, i.notes,
        c.brand || ' ' || COALESCE(c.model, '') AS caravan_name
      FROM inspections i
      JOIN caravans c ON i.caravan_id = c.id
      WHERE c.customer_id = ${session.id}
      ORDER BY i.inspection_date DESC
    `;

    return NextResponse.json({ inspections });
  } catch {
    return NextResponse.json({ inspections: [] });
  }
}
