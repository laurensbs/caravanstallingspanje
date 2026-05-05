import { NextRequest, NextResponse } from 'next/server';
import { getCustomerByEmail, setCustomerPassword } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/passwords';
import { verifyCustomerToken } from '@/lib/auth';

// Klant wijzigt z'n wachtwoord. Vereist huidige wachtwoord ter
// verificatie zodat een gestolen sessie het wachtwoord niet kan veranderen.
// Resetten flag must_change_password naar false zodat de portaal-pagina's
// open gaan staan na deze stap.
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('customer_token')?.value;
    const session = token ? await verifyCustomerToken(token) : null;
    if (!session) {
      return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const currentPassword = String(body.currentPassword || '');
    const newPassword = String(body.newPassword || '');
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Vul beide velden in.' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Nieuw wachtwoord moet minimaal 8 tekens zijn.' }, { status: 400 });
    }
    if (newPassword === currentPassword) {
      return NextResponse.json({ error: 'Nieuw wachtwoord moet anders zijn dan het huidige.' }, { status: 400 });
    }
    const customer = await getCustomerByEmail(session.email) as
      | (Awaited<ReturnType<typeof getCustomerByEmail>> & { password_hash?: string | null })
      | null;
    if (!customer || !customer.password_hash) {
      return NextResponse.json({ error: 'Account niet gevonden.' }, { status: 404 });
    }
    const ok = await verifyPassword(currentPassword, customer.password_hash);
    if (!ok) {
      return NextResponse.json({ error: 'Huidig wachtwoord klopt niet.' }, { status: 401 });
    }
    const newHash = await hashPassword(newPassword);
    await setCustomerPassword(customer.id, newHash, false);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'change-password failed';
    console.error('[account/change-password] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
