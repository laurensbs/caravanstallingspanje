import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCustomerSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('customer_token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const session = await getCustomerSession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const result = await sql`SELECT first_name, last_name, email, phone, customer_number FROM customers WHERE id = ${session.id}`;
    if (result.length === 0) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    const c = result[0];
    return NextResponse.json({ name: `${c.first_name} ${c.last_name}`, email: c.email, phone: c.phone, customer_number: c.customer_number });
  } catch (error) {
    console.error('Customer me error:', error);
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}
