import { NextRequest, NextResponse } from 'next/server';
import { createAdminToken } from '@/lib/auth';
import { timingSafeEqual } from 'crypto';

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(req: NextRequest) {
  try {
    const { user, password } = await req.json();
    if (!user || !password) return NextResponse.json({ error: 'Vul een wachtwoord in' }, { status: 400 });

    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const STAFF_PASSWORD = process.env.STAFF_PASSWORD;

    if (!ADMIN_PASSWORD || !STAFF_PASSWORD) {
      return NextResponse.json({ error: 'Server configuratie onvolledig' }, { status: 500 });
    }

    let role: string;
    let name: string;

    if (user === 'admin' && safeCompare(password, ADMIN_PASSWORD)) {
      role = 'admin';
      name = 'Admin';
    } else if (user === 'staff' && safeCompare(password, STAFF_PASSWORD)) {
      role = 'staff';
      name = 'Medewerker';
    } else {
      return NextResponse.json({ error: 'Ongeldig wachtwoord' }, { status: 401 });
    }

    const token = await createAdminToken({ id: user === 'admin' ? 1 : 2, name, email: `${user}@caravanstalling-spanje.com`, role });

    const response = NextResponse.json({ success: true, name, role });
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
