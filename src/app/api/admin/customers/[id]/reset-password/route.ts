import { NextRequest, NextResponse } from 'next/server';
import { getCustomerById, setCustomerPassword, logActivity, getAdminInfo } from '@/lib/db';
import { hashPassword } from '@/lib/passwords';
import { generateTempPassword } from '@/lib/auth';
import { sendMail, welcomePortalHtml } from '@/lib/email';

// Admin reset wachtwoord voor een klant. Genereert nieuw eenmalig
// wachtwoord, hasht 'm met bcrypt, zet must_change_password=true, mailt
// 'm naar de klant (als RESEND geconfigureerd is) en geeft 'm óók
// terug in de response zodat admin 'm direct kan kopiëren naar de
// klant in een ander kanaal (telefoon/WhatsApp).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid customer id' }, { status: 400 });
    }
    const customer = await getCustomerById(id);
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    if (!customer.email) {
      return NextResponse.json({ error: 'Customer has no email — cannot reset' }, { status: 400 });
    }

    const tempPassword = generateTempPassword();
    const hash = await hashPassword(tempPassword);
    await setCustomerPassword(id, hash, true);

    // Mail-poging — niet-fataal als RESEND niet geconfigureerd is.
    // Admin krijgt het wachtwoord toch terug in de response.
    let mailSent = false;
    let mailError: string | null = null;
    try {
      const base = process.env.PUBLIC_BASE_URL || 'https://caravanstallingspanje.vercel.app';
      const loginUrl = `${base}/account/login`;
      const mail = welcomePortalHtml({
        name: customer.name,
        email: customer.email,
        tempPassword,
        loginUrl,
      });
      const res = await sendMail({ to: customer.email, subject: mail.subject, html: mail.html, text: mail.text });
      mailSent = res.ok;
      mailError = res.error || null;
    } catch (err) {
      mailError = err instanceof Error ? err.message : 'mail failed';
    }

    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Klant-wachtwoord gereset',
      entityType: 'customer',
      entityId: String(id),
      entityLabel: customer.name,
      details: mailSent ? `Mail verstuurd naar ${customer.email}` : `Mail mislukt: ${mailError}`,
    });

    return NextResponse.json({
      success: true,
      tempPassword,
      mailSent,
      mailError,
      email: customer.email,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'reset failed';
    console.error('[admin/customers/reset-password] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
