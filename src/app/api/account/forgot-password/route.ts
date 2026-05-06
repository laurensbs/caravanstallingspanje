import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import {
  getCustomerByEmail, setCustomerPasswordSetupToken, logActivity,
} from '@/lib/db';
import { sendMail, passwordResetHtml } from '@/lib/email';

// Klant vraagt wachtwoord-reset aan. Hergebruikt password_setup_token-flow
// (zelfde tabel-kolommen, zelfde /account/welkom landing-page) zodat we
// niet twee parallelle token-systemen hebben.
//
// Privacy: response is altijd hetzelfde "als email bekend, sturen we link".
// Onthult niet of email in onze DB staat.
const TOKEN_TTL_DAYS = 7;

const schema = z.object({
  email: z.string().email().max(200),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres.' }, { status: 400 });
    }

    const customer = await getCustomerByEmail(parsed.data.email);

    // Geen klant gevonden? Stille respons. Niet onthullen of email bestaat.
    if (!customer || !customer.email) {
      return NextResponse.json({ ok: true });
    }

    const token = randomBytes(32).toString('base64url');
    const expires = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await setCustomerPasswordSetupToken(customer.id, token, expires);

    const base = process.env.PUBLIC_BASE_URL || new URL(req.url).origin;
    const setupUrl = `${base}/account/welkom?token=${encodeURIComponent(token)}`;

    try {
      const mail = passwordResetHtml({
        name: customer.name || 'klant',
        email: customer.email,
        setupUrl,
        expiresInDays: TOKEN_TTL_DAYS,
      });
      await sendMail({ to: customer.email, subject: mail.subject, html: mail.html, text: mail.text });
    } catch (err) {
      console.warn('[forgot-password] mail failed:', err);
      // Token is wel gezet, klant kan opnieuw proberen of admin contact opnemen.
    }

    await logActivity({
      action: 'Wachtwoord-reset aangevraagd',
      entityType: 'customer',
      entityId: String(customer.id),
      entityLabel: customer.name || customer.email,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
