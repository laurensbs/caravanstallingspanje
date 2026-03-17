import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCustomerSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('customer_token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const session = await getCustomerSession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const invoices = await sql`SELECT * FROM invoices WHERE customer_id = ${session.id} ORDER BY created_at DESC`;
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Customer invoices error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
