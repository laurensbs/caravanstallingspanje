import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerToken } from '@/lib/auth';
import { listInvoicesForEmail } from '@/lib/stripe';

// Geeft alle Stripe-invoices voor de ingelogde klant terug. Lookup gaat
// op email — dat dekt zowel checkouts met customer_creation: 'always'
// als oudere sessies waarbij het customer-record toevallig dezelfde
// email had.
export async function GET(req: NextRequest) {
  const token = req.cookies.get('customer_token')?.value;
  const session = token ? await verifyCustomerToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
  }
  try {
    const invoices = await listInvoicesForEmail(session.email);
    return NextResponse.json({ invoices });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'failed';
    console.error('[account/invoices] error:', msg);
    return NextResponse.json({ invoices: [], error: msg }, { status: 500 });
  }
}
