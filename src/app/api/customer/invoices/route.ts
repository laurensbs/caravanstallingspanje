import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCustomerSession } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('customer_token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const session = await getCustomerSession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    // Handle payment redirect
    const payId = req.nextUrl.searchParams.get('pay');
    if (payId) {
      if (!stripe) return NextResponse.json({ error: 'Betalingen zijn momenteel niet beschikbaar' }, { status: 503 });

      const invoiceId = parseInt(payId, 10);
      if (isNaN(invoiceId)) return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 });

      const invoices = await sql`SELECT * FROM invoices WHERE id = ${invoiceId} AND customer_id = ${session.id} AND status != 'betaald'`;
      if (invoices.length === 0) return NextResponse.json({ error: 'Factuur niet gevonden' }, { status: 404 });

      const invoice = invoices[0];
      const amount = Math.round(Number(invoice.amount) * 100);

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card', 'sepa_debit'],
        customer_email: session.email,
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: { name: `Factuur ${invoice.invoice_number}` },
            unit_amount: amount,
          },
          quantity: 1,
        }],
        metadata: { invoice_id: String(invoice.id), customer_id: String(session.id) },
        success_url: `${req.nextUrl.origin}/mijn-account?betaald=1`,
        cancel_url: `${req.nextUrl.origin}/mijn-account`,
        locale: 'nl',
      });

      if (checkoutSession.url) {
        return NextResponse.redirect(checkoutSession.url);
      }
      return NextResponse.json({ error: 'Kon betaalsessie niet aanmaken' }, { status: 500 });
    }

    const invoices = await sql`SELECT * FROM invoices WHERE customer_id = ${session.id} ORDER BY created_at DESC`;
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Customer invoices error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
