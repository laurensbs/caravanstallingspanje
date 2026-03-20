import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { createCustomerToken } from '@/lib/auth';
import { hashPassword } from '@/lib/passwords';
import { validateBody, registerSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(registerSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const { firstName: first_name, lastName: last_name, email, phone, password } = validated.data;

    const existing = await sql`SELECT id FROM customers WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) return NextResponse.json({ error: 'Dit e-mailadres is al in gebruik' }, { status: 400 });

    const password_hash = await hashPassword(password);
    const countResult = await sql`SELECT COUNT(*) as count FROM customers`;
    const customerNumber = `KL-${String(Number(countResult[0].count) + 1).padStart(6, '0')}`;

    const result = await sql`INSERT INTO customers (first_name, last_name, email, phone, password_hash, customer_number) VALUES (${first_name}, ${last_name}, ${email}, ${phone || null}, ${password_hash}, ${customerNumber}) RETURNING *`;
    const customer = result[0];
    const name = `${customer.first_name} ${customer.last_name}`;
    const token = await createCustomerToken({ id: customer.id, name, email: customer.email });

    const response = NextResponse.json({ name, email: customer.email, phone: customer.phone, customer_number: customer.customer_number });
    response.cookies.set('customer_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch (error) {
    console.error('Customer register error:', error);
    return NextResponse.json({ error: 'Registratie mislukt' }, { status: 500 });
  }
}
