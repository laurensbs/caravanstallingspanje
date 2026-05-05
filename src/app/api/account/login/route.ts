import { NextRequest, NextResponse } from 'next/server';
import { getCustomerByEmail, recordCustomerLogin } from '@/lib/db';
import { verifyPassword } from '@/lib/passwords';
import { createCustomerToken } from '@/lib/auth';

// Customer-portal login. Verschil met admin-auth:
//  - aparte JWT-secret (CUSTOMER_JWT_SECRET) zodat een lekkende sessie
//    nooit admin-toegang kan geven;
//  - retourneert mustChangePassword zodat de UI de klant kan dwingen
//    naar /account/wachtwoord-wijzigen voor toegang tot de rest.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!email || !password) {
      return NextResponse.json({ error: 'Vul e-mail en wachtwoord in.' }, { status: 400 });
    }
    const customer = await getCustomerByEmail(email) as
      | (Awaited<ReturnType<typeof getCustomerByEmail>> & { password_hash?: string | null; must_change_password?: boolean | null })
      | null;
    if (!customer || !customer.password_hash) {
      // Bewust geen "user not found" lekken — zelfde foutmelding als
      // verkeerd wachtwoord, om e-mail-enumeration te voorkomen.
      return NextResponse.json({ error: 'E-mail of wachtwoord klopt niet.' }, { status: 401 });
    }
    const ok = await verifyPassword(password, customer.password_hash);
    if (!ok) {
      return NextResponse.json({ error: 'E-mail of wachtwoord klopt niet.' }, { status: 401 });
    }
    await recordCustomerLogin(customer.id);
    const token = await createCustomerToken({
      id: customer.id,
      email: customer.email || email,
      name: customer.name,
    });
    const res = NextResponse.json({
      success: true,
      mustChangePassword: !!customer.must_change_password,
    });
    res.cookies.set('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7d
    });
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'login failed';
    console.error('[account/login] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
