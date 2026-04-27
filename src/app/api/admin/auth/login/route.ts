import { NextRequest, NextResponse } from 'next/server';
import { createAdminToken } from '@/lib/auth';
import { verifyPassword } from '@/lib/passwords';
import { getAdminById, recordLoginSuccess, recordLoginFailure, isAccountLocked, logActivity } from '@/lib/db';
import { validateBody, loginSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(loginSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: 'Ongeldige inloggegevens' }, { status: 400 });
    }
    const { adminId, password } = validated.data;

    const admin = await getAdminById(adminId);
    if (!admin) {
      return NextResponse.json({ error: 'Ongeldige inloggegevens' }, { status: 401 });
    }

    if (await isAccountLocked(admin.id)) {
      return NextResponse.json(
        { error: 'Account tijdelijk vergrendeld. Probeer het over 15 minuten opnieuw.' },
        { status: 423 }
      );
    }

    const valid = await verifyPassword(password, admin.password_hash);
    if (!valid) {
      await recordLoginFailure(admin.id);
      return NextResponse.json({ error: 'Ongeldige inloggegevens' }, { status: 401 });
    }

    await recordLoginSuccess(admin.id);
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
