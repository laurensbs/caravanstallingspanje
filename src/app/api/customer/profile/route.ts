import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCustomerSession, hashPassword, verifyPassword } from '@/lib/auth';

// PUT /api/customer/profile — update customer profile
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('customer_token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const session = await getCustomerSession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const body = await req.json();
    const { phone, address, city, postal_code, country } = body;

    await sql`
      UPDATE customers SET
        phone = COALESCE(${phone || null}, phone),
        address = COALESCE(${address || null}, address),
        city = COALESCE(${city || null}, city),
        postal_code = COALESCE(${postal_code || null}, postal_code),
        country = COALESCE(${country || null}, country),
        updated_at = NOW()
      WHERE id = ${session.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Profiel bijwerken mislukt' }, { status: 500 });
  }
}

// POST /api/customer/profile — change password
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('customer_token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const session = await getCustomerSession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) return NextResponse.json({ error: 'Vul beide wachtwoorden in' }, { status: 400 });
    if (newPassword.length < 8) return NextResponse.json({ error: 'Nieuw wachtwoord moet minimaal 8 tekens zijn' }, { status: 400 });

    const customer = await sql`SELECT password_hash FROM customers WHERE id = ${session.id}`;
    if (customer.length === 0) return NextResponse.json({ error: 'Klant niet gevonden' }, { status: 404 });

    const valid = await verifyPassword(currentPassword, customer[0].password_hash);
    if (!valid) return NextResponse.json({ error: 'Huidig wachtwoord is onjuist' }, { status: 401 });

    const hash = await hashPassword(newPassword);
    await sql`UPDATE customers SET password_hash = ${hash}, updated_at = NOW() WHERE id = ${session.id}`;

    return NextResponse.json({ success: true, message: 'Wachtwoord gewijzigd' });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: 'Wachtwoord wijzigen mislukt' }, { status: 500 });
  }
}
