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

// GET ?token=... → valideer token. Returnt alleen een gemaskeerd e-mailadres
// (l***@h***.com) zodat de klant z'n eigen account herkent zonder dat een
// attacker met een gestolen/geraden token de naam + volledige email kan
// extracten (token-enumeration protection).
function maskEmail(email: string | null): string {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return '';
  const maskedLocal = local.length <= 2 ? `${local[0] || ''}*` : `${local[0]}${'*'.repeat(Math.max(2, local.length - 2))}${local[local.length - 1]}`;
  const dotIdx = domain.lastIndexOf('.');
  const tld = dotIdx >= 0 ? domain.slice(dotIdx) : '';
  const domainName = dotIdx >= 0 ? domain.slice(0, dotIdx) : domain;
  const maskedDomain = domainName.length <= 1 ? '*' : `${domainName[0]}${'*'.repeat(Math.max(1, domainName.length - 1))}`;
  return `${maskedLocal}@${maskedDomain}${tld}`;
}

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token') || '';
  const customer = await getCustomerByPasswordSetupToken(token);
  if (!customer) {
    return NextResponse.json({ error: 'Deze link is ongeldig of verlopen.' }, { status: 410 });
  }
  return NextResponse.json({
    emailMasked: maskEmail(customer.email),
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
    // Atomic consume — voorkomt dat twee parallel-requests beide slagen.
    // Returnt false als token tussen GET en POST al gebruikt of vervallen is.
    const ok = await consumePasswordSetupToken(customer.id, parsed.data.token, hash);
    if (!ok) {
      return NextResponse.json({ error: 'Deze link is ongeldig of verlopen.' }, { status: 410 });
    }
    await logActivity({
      action: 'Klant heeft wachtwoord ingesteld via welkomstmail',
      entityType: 'customer',
      entityId: String(customer.id),
      entityLabel: customer.name || customer.email || `customer-${customer.id}`,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
