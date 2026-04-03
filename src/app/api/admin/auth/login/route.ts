import { NextRequest, NextResponse } from 'next/server';
import { createAdminToken } from '@/lib/auth';
import { verifyPassword } from '@/lib/passwords';
import { getAdminByEmail, recordLoginSuccess, recordLoginFailure, isAccountLocked, logActivity } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Vul email en wachtwoord in' }, { status: 400 });

    const admin = await getAdminByEmail(email);
    if (!admin) {
      return NextResponse.json({ error: 'Ongeldige inloggegevens' }, { status: 401 });
    }

    // Check account lockout
    if (await isAccountLocked('admin_users', admin.id)) {
      return NextResponse.json({ error: 'Account tijdelijk vergrendeld. Probeer het over 15 minuten opnieuw.' }, { status: 423 });
    }

    const valid = await verifyPassword(password, admin.password_hash);
    if (!valid) {
      await recordLoginFailure('admin_users', admin.id);
      return NextResponse.json({ error: 'Ongeldige inloggegevens' }, { status: 401 });
    }

    await recordLoginSuccess('admin_users', admin.id);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Ingelogd', entityType: 'auth', entityLabel: admin.email });

    const token = await createAdminToken({ id: admin.id, name: admin.name, email: admin.email, role: admin.role });

    const response = NextResponse.json({ success: true, name: admin.name, role: admin.role });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Inloggen mislukt' }, { status: 500 });
  }
}
