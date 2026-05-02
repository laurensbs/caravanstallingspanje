import { NextRequest, NextResponse } from 'next/server';
import { createAdminToken } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/passwords';
import { getAdminById, setAdminPassword, isAccountLocked, recordLoginFailure, logActivity } from '@/lib/db';
import { validateBody, setPasswordSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(setPasswordSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { adminId, currentPassword, newPassword } = validated.data;

    const admin = await getAdminById(adminId);
    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (await isAccountLocked(admin.id)) {
      return NextResponse.json(
        { error: 'Account temporarily locked. Please try again in 15 minutes.' },
        { status: 423 }
      );
    }

    const valid = await verifyPassword(currentPassword, admin.password_hash);
    if (!valid) {
      await recordLoginFailure(admin.id);
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    if (currentPassword === newPassword) {
      return NextResponse.json({ error: 'Choose a different password from the current one' }, { status: 400 });
    }

    const hash = await hashPassword(newPassword);
    await setAdminPassword(admin.id, hash);
    await logActivity({
      actor: admin.name,
      role: admin.role,
      action: 'Password set',
      entityType: 'auth',
      entityLabel: admin.email,
    });

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
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[admin/auth/set-password POST] error:', msg, err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
