import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import {
  getCustomerById, setCustomerPasswordSetupToken,
  logActivity, getAdminInfo,
} from '@/lib/db';
import { sendMail, welcomeSetupHtml } from '@/lib/email';

// Bulk-welkomstmail: één request, N klant-ids. Per id wordt dezelfde flow
// uitgevoerd als /api/admin/customers/[id]/send-welcome — token genereren,
// in DB opslaan, mailen via Resend. Resultaat per klant in de response zodat
// admin ziet welke gefaald zijn en gericht kan opvolgen.
//
// Mail-throttle: 1 mail per 200ms zodat we Resend niet overspoelen bij
// een batch van honderd. 100 klanten = ~20 seconden — acceptabel binnen
// Vercel-functie maxDuration.

const TOKEN_TTL_DAYS = 14;

const schema = z.object({
  customerIds: z.array(z.number().int().positive()).min(1).max(500),
});

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        error: parsed.error.issues.map((i) => i.message).join(', '),
      }, { status: 400 });
    }

    const base = process.env.PUBLIC_BASE_URL || 'https://caravanstallingspanje.vercel.app';
    const admin = getAdminInfo(req);
    const results: Array<{
      id: number;
      email: string | null;
      ok: boolean;
      mailSent: boolean;
      error?: string;
    }> = [];

    let sent = 0;
    let failed = 0;

    for (const id of parsed.data.customerIds) {
      try {
        const customer = await getCustomerById(id);
        if (!customer) {
          results.push({ id, email: null, ok: false, mailSent: false, error: 'not found' });
          failed++;
          continue;
        }
        if (!customer.email) {
          results.push({ id, email: null, ok: false, mailSent: false, error: 'no email' });
          failed++;
          continue;
        }

        const token = randomBytes(32).toString('base64url');
        const expires = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
        await setCustomerPasswordSetupToken(id, token, expires);

        const setupUrl = `${base}/account/welkom?token=${encodeURIComponent(token)}`;
        const mail = welcomeSetupHtml({
          name: customer.name || 'klant',
          email: customer.email,
          setupUrl,
          expiresInDays: TOKEN_TTL_DAYS,
        });
        const mailResult = await sendMail({
          to: customer.email,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
        });

        results.push({
          id,
          email: customer.email,
          ok: true,
          mailSent: mailResult.ok,
          error: mailResult.error || undefined,
        });
        if (mailResult.ok) sent++;
        else failed++;

        // Log per klant zodat audit-trail klopt.
        await logActivity({
          actor: admin.name, role: admin.role,
          action: 'Welkomstmail verstuurd (bulk)',
          entityType: 'customer',
          entityId: String(id),
          entityLabel: customer.name,
          details: mailResult.ok ? `Naar ${customer.email}` : `Mail mislukt: ${mailResult.error || 'unknown'}`,
        }).catch(() => {});

        // Throttle 200ms tussen mails.
        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown';
        results.push({ id, email: null, ok: false, mailSent: false, error: msg });
        failed++;
      }
    }

    return NextResponse.json({
      processed: parsed.data.customerIds.length,
      sent,
      failed,
      results,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'bulk send failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
