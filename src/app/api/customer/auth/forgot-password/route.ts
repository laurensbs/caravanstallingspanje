import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'E-mail is verplicht' }, { status: 400 });

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({ success: true, message: 'Als dit e-mailadres bekend is, ontvangt u een reset-link.' });

    const customer = await sql`SELECT id, first_name, email FROM customers WHERE email = ${email} LIMIT 1`;
    if (customer.length === 0) return successResponse;

    // Ensure password_reset_tokens table exists
    await sql`CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )`;

    // Invalidate existing tokens
    await sql`UPDATE password_reset_tokens SET used = true WHERE customer_id = ${customer[0].id} AND used = false`;

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await sql`INSERT INTO password_reset_tokens (customer_id, token, expires_at) VALUES (${customer[0].id}, ${token}, ${expiresAt.toISOString()})`;

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://caravanstalling-spanje.com'}/mijn-account?reset=${token}`;

    await sendEmail({
      to: email,
      subject: 'Wachtwoord resetten — Caravanstalling Spanje',
      html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#FAF9F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
          <div style="background:white;border-radius:16px;padding:32px;border:1px solid rgba(0,0,0,0.04);">
            <h2 style="margin:0 0 8px;font-size:20px;color:#1C2B3A;">Wachtwoord resetten</h2>
            <p style="color:#71717A;margin:0 0 24px;">Beste ${customer[0].first_name}, u heeft een wachtwoord-reset aangevraagd.</p>
            <a href="${resetUrl}" style="display:block;text-align:center;background:#C4653A;color:white;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">Nieuw wachtwoord instellen</a>
            <p style="font-size:12px;color:#71717A;margin-top:24px;">Deze link is 1 uur geldig. Als u dit niet heeft aangevraagd, kunt u deze e-mail negeren.</p>
          </div>
        </div>
      </body></html>`,
    });

    return successResponse;
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 });
  }
}
