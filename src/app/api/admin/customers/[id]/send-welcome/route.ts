import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import {
  getCustomerById, setCustomerPasswordSetupToken,
  logActivity, getAdminInfo,
} from '@/lib/db';
import { sendMail, welcomeSetupHtml } from '@/lib/email';

// Admin (Laurens) verzendt welkomstmail met set-password-link. Geen temp
// password meer — klant kiest zelf zijn wachtwoord via de token-link.
// Token: 32 random bytes (base64url), 14 dagen geldig, 1× bruikbaar.
const TOKEN_TTL_DAYS = 14;

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
      return NextResponse.json({ error: 'Customer has no email' }, { status: 400 });
    }

    const token = randomBytes(32).toString('base64url');
    const expires = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await setCustomerPasswordSetupToken(id, token, expires);

    const base = process.env.PUBLIC_BASE_URL || 'https://caravanstallingspanje.vercel.app';
    const setupUrl = `${base}/account/welkom?token=${encodeURIComponent(token)}`;

    let mailSent = false;
    let mailError: string | null = null;
    try {
      const mail = welcomeSetupHtml({
        name: customer.name || 'klant',
        email: customer.email,
        setupUrl,
        expiresInDays: TOKEN_TTL_DAYS,
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
      action: 'Welkomstmail verstuurd',
      entityType: 'customer',
      entityId: String(id),
      entityLabel: customer.name,
      details: mailSent ? `Naar ${customer.email}` : `Mail mislukt: ${mailError}`,
    });

    return NextResponse.json({
      success: true,
      mailSent,
      mailError,
      email: customer.email,
      setupUrl, // admin ziet 'm zodat hij 'm via een ander kanaal kan delen
      expiresAt: expires.toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'send failed';
    console.error('[admin/customers/send-welcome] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
