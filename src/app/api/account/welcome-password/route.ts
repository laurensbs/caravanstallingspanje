import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCustomerByPasswordSetupToken, consumePasswordSetupToken, logActivity } from '@/lib/db';
import { hashPassword } from '@/lib/passwords';

// Klant zet zijn eigen wachtwoord via welkomstmail-token. Token wordt na
// gebruik gewist (1× bruikbaar). Klant moet daarna alsnog inloggen.
const schema = z.object({
  token: z.string().min(8),
  password: z.string().min(8).max(200),
});

// GET ?token=... → valideer token, return klant-naam zodat de set-page
// een persoonlijke welkomst kan tonen ("Hi {name}, kies een wachtwoord").
export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token') || '';
  const customer = await getCustomerByPasswordSetupToken(token);
  if (!customer) {
    return NextResponse.json({ error: 'Deze link is ongeldig of verlopen.' }, { status: 410 });
  }
  return NextResponse.json({
    name: customer.name,
    email: customer.email,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(', ') }, { status: 400 });
    }
    const customer = await getCustomerByPasswordSetupToken(parsed.data.token);
    if (!customer) {
      return NextResponse.json({ error: 'Deze link is ongeldig of verlopen.' }, { status: 410 });
    }
    const hash = await hashPassword(parsed.data.password);
    await consumePasswordSetupToken(customer.id, hash);
    await logActivity({
      action: 'Klant heeft wachtwoord ingesteld via welkomstmail',
      entityType: 'customer',
      entityId: String(customer.id),
      entityLabel: customer.name || customer.email || `customer-${customer.id}`,
    });
    return NextResponse.json({ success: true, email: customer.email });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
