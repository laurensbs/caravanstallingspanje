import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const event = constructWebhookEvent(body, signature);

    // Idempotency: ensure we never process the same event twice
    await sql`CREATE TABLE IF NOT EXISTS processed_webhook_events (
      id SERIAL PRIMARY KEY,
      event_id TEXT UNIQUE NOT NULL,
      event_type TEXT NOT NULL,
      processed_at TIMESTAMPTZ DEFAULT NOW()
    )`;
    const existing = await sql`SELECT id FROM processed_webhook_events WHERE event_id = ${event.id}`;
    if (existing.length > 0) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    await sql`INSERT INTO processed_webhook_events (event_id, event_type) VALUES (${event.id}, ${event.type})`;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const contractNumber = session.metadata?.contractNumber;
        if (contractNumber) {
          // Mark the first invoice as paid
          await sql`
            UPDATE invoices SET status = 'betaald', paid_date = NOW(), payment_method = 'stripe', stripe_payment_id = ${session.payment_intent || session.subscription || ''}
            WHERE contract_id = (SELECT id FROM contracts WHERE contract_number = ${contractNumber})
            AND status = 'open'
            ORDER BY created_at ASC
            LIMIT 1
          `;

          await sql`
            INSERT INTO activity_log (actor, role, action, entity_type, entity_id, entity_label, details)
            VALUES ('Stripe', 'systeem', 'betaling_ontvangen', 'contract', ${contractNumber}, ${contractNumber}, 'Checkout sessie voltooid')
          `;
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const contractNumber = invoice.subscription_details?.metadata?.contractNumber;
        if (contractNumber) {
          // Create a new invoice record for recurring payments
          const year = new Date().getFullYear();
          const countRes = await sql`SELECT COUNT(*) as cnt FROM invoices WHERE invoice_number LIKE ${'FAC-' + year + '%'}`;
          const seq = Number(countRes[0].cnt) + 1;
          const invoiceNum = 'FAC-' + year + '-' + String(seq).padStart(4, '0');

          const contract = await sql`SELECT * FROM contracts WHERE contract_number = ${contractNumber} LIMIT 1`;
          if (contract.length > 0) {
            const subtotal = Number(invoice.amount_paid) / 100;
            const taxAmount = subtotal * 0.21;
            const total = subtotal + taxAmount;

            await sql`
              INSERT INTO invoices (invoice_number, customer_id, contract_id, description, subtotal, tax_rate, tax_amount, total, status, due_date, paid_date, payment_method, stripe_payment_id)
              VALUES (${invoiceNum}, ${contract[0].customer_id}, ${contract[0].id}, 'Maandelijkse stalling', ${subtotal}, 21, ${taxAmount}, ${total}, 'betaald', ${new Date().toISOString().split('T')[0]}, NOW(), 'stripe', ${invoice.payment_intent || ''})
            `;
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const contractNumber = subscription.metadata?.contractNumber;
        if (contractNumber) {
          await sql`UPDATE contracts SET status = 'opgezegd', updated_at = NOW() WHERE contract_number = ${contractNumber}`;
          await sql`
            INSERT INTO activity_log (actor, role, action, entity_type, entity_id, entity_label, details)
            VALUES ('Stripe', 'systeem', 'abonnement_opgezegd', 'contract', ${contractNumber}, ${contractNumber}, 'Stripe abonnement beëindigd')
          `;
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook verwerking mislukt' }, { status: 400 });
  }
}
