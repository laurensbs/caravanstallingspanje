import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyPassword, createStaffToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'E-mail en wachtwoord zijn verplicht' }, { status: 400 });

    const result = await sql`SELECT s.*, l.name as location_name FROM staff s LEFT JOIN locations l ON s.location_id = l.id WHERE s.email = ${email} AND s.is_active = true LIMIT 1`;
    if (result.length === 0) return NextResponse.json({ error: 'Ongeldige inloggegevens' }, { status: 401 });

    const staff = result[0];
    const valid = await verifyPassword(password, staff.password_hash);
    if (!valid) return NextResponse.json({ error: 'Ongeldige inloggegevens' }, { status: 401 });

    const name = `${staff.first_name} ${staff.last_name}`;
    const token = await createStaffToken({ id: staff.id, name, email: staff.email, role: staff.role, locationId: staff.location_id });

    const response = NextResponse.json({ success: true, name, role: staff.role, location: staff.location_name });
    response.cookies.set('staff_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 12 });
    return response;
  } catch (error) {
    console.error('Staff login error:', error);
    return NextResponse.json({ error: 'Inloggen mislukt' }, { status: 500 });
  }
}
