import { NextRequest, NextResponse } from 'next/server';
import { createStaffToken } from '@/lib/auth';
import { timingSafeEqual } from 'crypto';

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password) return NextResponse.json({ error: 'Vul een wachtwoord in' }, { status: 400 });

    const STAFF_PASSWORD = process.env.STAFF_PASSWORD;
    if (!STAFF_PASSWORD) {
      return NextResponse.json({ error: 'Server configuratie onvolledig' }, { status: 500 });
    }

    if (!safeCompare(password, STAFF_PASSWORD)) {
      return NextResponse.json({ error: 'Ongeldig wachtwoord' }, { status: 401 });
    }

    const token = await createStaffToken({ id: 1, name: 'Medewerker', email: 'staff@caravanstalling-spanje.com', role: 'medewerker' });

    const response = NextResponse.json({ success: true, name: 'Medewerker', role: 'medewerker' });
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
