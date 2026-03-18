import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { createCustomerToken } from '@/lib/auth';
import { verifyPassword } from '@/lib/passwords';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'E-mail en wachtwoord zijn verplicht' }, { status: 400 });

    const result = await sql`SELECT * FROM customers WHERE email = ${email} AND password_hash IS NOT NULL LIMIT 1`;
    if (result.length === 0) return NextResponse.json({ error: 'Ongeldige inloggegevens' }, { status: 401 });

    const customer = result[0];
    const valid = await verifyPassword(password, customer.password_hash);
    if (!valid) return NextResponse.json({ error: 'Ongeldige inloggegevens' }, { status: 401 });

    const name = `${customer.first_name} ${customer.last_name}`;
    const token = await createCustomerToken({ id: customer.id, name, email: customer.email });

    const response = NextResponse.json({ name, email: customer.email, phone: customer.phone, customer_number: customer.customer_number });
    response.cookies.set('customer_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
    return response;
  } catch (error) {
    console.error('Customer login error:', error);
    return NextResponse.json({ error: 'Inloggen mislukt' }, { status: 500 });
  }
}
