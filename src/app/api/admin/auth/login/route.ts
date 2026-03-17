import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyPassword, createAdminToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'E-mail en wachtwoord zijn verplicht' }, { status: 400 });

    const result = await sql`SELECT * FROM admin_users WHERE email = ${email} AND is_active = true LIMIT 1`;
    if (result.length === 0) return NextResponse.json({ error: 'Ongeldige inloggegevens' }, { status: 401 });

    const admin = result[0];
    const valid = await verifyPassword(password, admin.password_hash);
    if (!valid) return NextResponse.json({ error: 'Ongeldige inloggegevens' }, { status: 401 });

    const token = await createAdminToken({ id: admin.id, name: admin.name, email: admin.email, role: admin.role });

    await sql`UPDATE admin_users SET last_login = NOW() WHERE id = ${admin.id}`;

    const response = NextResponse.json({ success: true, name: admin.name, role: admin.role });
    response.cookies.set('admin_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Inloggen mislukt' }, { status: 500 });
  }
}
