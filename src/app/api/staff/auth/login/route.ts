import { NextRequest, NextResponse } from 'next/server';
import { createStaffToken } from '@/lib/auth';
import { verifyPassword } from '@/lib/passwords';
import { getStaffByEmail, recordLoginSuccess, recordLoginFailure, isAccountLocked } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Vul email en wachtwoord in' }, { status: 400 });

    const staff = await getStaffByEmail(email);
    if (!staff) {
      return NextResponse.json({ error: 'Ongeldige inloggegevens' }, { status: 401 });
    }

    if (await isAccountLocked('staff', staff.id)) {
      return NextResponse.json({ error: 'Account tijdelijk vergrendeld. Probeer het over 15 minuten opnieuw.' }, { status: 423 });
    }

    const valid = await verifyPassword(password, staff.password_hash);
    if (!valid) {
      await recordLoginFailure('staff', staff.id);
      return NextResponse.json({ error: 'Ongeldige inloggegevens' }, { status: 401 });
    }

    await recordLoginSuccess('staff', staff.id);

    const token = await createStaffToken({
      id: staff.id,
      name: `${staff.first_name} ${staff.last_name}`,
      email: staff.email,
      role: staff.role,
      locationId: staff.location_id,
    });

    const response = NextResponse.json({ success: true, name: `${staff.first_name} ${staff.last_name}`, role: staff.role });
    response.cookies.set('staff_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    });
    return response;
  } catch (error) {
    console.error('Staff login error:', error);
    return NextResponse.json({ error: 'Inloggen mislukt' }, { status: 500 });
  }
}
