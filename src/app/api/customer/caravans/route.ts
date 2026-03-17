import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCustomerSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('customer_token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const session = await getCustomerSession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const caravans = await sql`SELECT c.*, l.name as location_name, s.label as spot_label FROM caravans c LEFT JOIN locations l ON c.location_id = l.id LEFT JOIN spots s ON c.spot_id = s.id WHERE c.customer_id = ${session.id} ORDER BY c.brand`;
    return NextResponse.json({ caravans });
  } catch (error) {
    console.error('Customer caravans error:', error);
    return NextResponse.json({ error: 'Failed to fetch caravans' }, { status: 500 });
  }
}
