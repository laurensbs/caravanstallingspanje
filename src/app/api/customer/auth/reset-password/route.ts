import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword, createCustomerToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ error: 'Token en wachtwoord zijn verplicht' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'Wachtwoord moet minimaal 8 tekens zijn' }, { status: 400 });

    // Ensure table exists
    await sql`CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )`;

    const resetToken = await sql`
      SELECT * FROM password_reset_tokens 
      WHERE token = ${token} AND used = false AND expires_at > NOW() 
      LIMIT 1
    `;

    if (resetToken.length === 0) {
      return NextResponse.json({ error: 'Ongeldige of verlopen reset-link. Vraag een nieuwe aan.' }, { status: 400 });
    }

    const customerId = resetToken[0].customer_id;
    const passwordHash = await hashPassword(password);

    // Update password
    await sql`UPDATE customers SET password_hash = ${passwordHash}, updated_at = NOW() WHERE id = ${customerId}`;

    // Mark token as used
    await sql`UPDATE password_reset_tokens SET used = true WHERE id = ${resetToken[0].id}`;

    // Auto-login
    const customer = await sql`SELECT id, first_name, last_name, email, phone, customer_number FROM customers WHERE id = ${customerId}`;
    if (customer.length === 0) return NextResponse.json({ error: 'Klant niet gevonden' }, { status: 404 });

    const c = customer[0];
    const name = `${c.first_name} ${c.last_name}`;
    const jwt = await createCustomerToken({ id: c.id, name, email: c.email });

    const response = NextResponse.json({ success: true, name, email: c.email, phone: c.phone, customer_number: c.customer_number });
    response.cookies.set('customer_token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 });
  }
}
