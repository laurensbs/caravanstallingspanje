import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe, webhookSecret } from '@/lib/stripe';
import {
  recordStripeEventOnce,
  unrecordStripeEvent,
  upsertPayment,
  markBookingPaid,
  markStallingRequestPaid,
  markTransportRequestPaid,
  getPendingIntakeBySession,
  markPendingIntakeForwarded,
  logActivity,
} from '@/lib/db';
import { sendIntake, type IntakePayload } from '@/lib/work-order-hub';

// Stripe signature verification needs the raw request body, not the
// JSON-parsed version, so we run on the Node.js runtime and pass req.text().
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(rawBody, sig, webhookSecret());
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'invalid signature';
    console.error('[stripe-webhook] signature verification failed:', msg);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  // Idempotency: same event id may arrive multiple times (Stripe retries).
  const fresh = await recordStripeEventOnce(event.id, event.type);
  if (!fresh) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event);
        break;
      case 'checkout.session.expired':
        await handleCheckoutExpired(event);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event);
        break;
      case 'charge.refunded':
        await handleRefunded(event);
        break;
      case 'charge.dispute.created':
        await handleDisputeCreated(event);
        break;
      default:
        // Acknowledge but ignore — keeps the dashboard clean of "unhandled"
        await logActivity({
          action: `Stripe event genegeerd: ${event.type}`,
          entityType: 'stripe_event',
          entityId: event.id,
        });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'handler error';
    console.error(`[stripe-webhook] handler ${event.type} failed:`, msg);
    // Roll back the event-id marker so Stripe's retry will be processed
    // instead of skipped as duplicate. The DB writes inside the handler
    // are all idempotent (UPSERT) so re-running is safe.
    await unrecordStripeEvent(event.id).catch(() => { /* ignore */ });
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ─── Handlers ────────────────────────────────────────────

async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const md = session.metadata || {};
  const kind = md.kind || 'unknown';
  const refId = md.refId || null;
  const intentId = typeof session.payment_intent === 'string' ? session.payment_intent : null;

  await upsertPayment({
    stripe_session_id: session.id,
    stripe_payment_intent_id: intentId,
    stripe_event_id: event.id,
    kind,
    ref_id: refId,
    amount_cents: session.amount_total ?? 0,
    currency: session.currency || 'eur',
    customer_email: session.customer_details?.email || session.customer_email || null,
    description: typeof md.description === 'string' ? md.description : null,
    status: 'paid',
    raw: session,
  });

  if (kind === 'fridge_booking' && refId) {
    const id = Number(refId);
    if (Number.isFinite(id) && id > 0) {
      await markBookingPaid(id, session.id);
    }
  } else if (kind === 'stalling_request' && refId) {
    const id = Number(refId);
    if (Number.isFinite(id) && id > 0) {
      await markStallingRequestPaid(id);
    }
  } else if (kind === 'transport_request' && refId) {
    const id = Number(refId);
    if (Number.isFinite(id) && id > 0) {
      await markTransportRequestPaid(id);
    }
  } else if (kind === 'service_intake') {
    // Service-aanvraag pas na betaling doorzetten naar reparatiepanel.
    const pending = await getPendingIntakeBySession(session.id);
    if (pending && !pending.forwarded_at) {
      try {
        const payload = pending.payload as IntakePayload;
        const result = await sendIntake(payload);
        await markPendingIntakeForwarded(pending.id, result.repairJobId);
        await logActivity({
          action: 'Service doorgestuurd na betaling',
          entityType: 'pending_intake',
          entityId: String(pending.id),
          entityLabel: result.publicCode,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'forward failed';
        console.error('[stripe-webhook] forward to reparatiepanel failed:', msg);
        // Throw so Stripe retries and we get another shot.
        throw new Error(`Forward to reparatiepanel failed: ${msg}`);
      }
    }
  }

  await logActivity({
    action: 'Stripe betaling ontvangen',
    entityType: kind,
    entityId: refId || session.id,
    entityLabel: session.customer_details?.email || session.customer_email || undefined,
    details: `${((session.amount_total ?? 0) / 100).toFixed(2)} ${session.currency?.toUpperCase() || 'EUR'}`,
  });
}

async function handleCheckoutExpired(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const md = session.metadata || {};
  await upsertPayment({
    stripe_session_id: session.id,
    stripe_event_id: event.id,
    kind: md.kind || 'unknown',
    ref_id: md.refId || null,
    amount_cents: session.amount_total ?? 0,
    currency: session.currency || 'eur',
    customer_email: session.customer_email || null,
    status: 'expired',
    raw: session,
  });
  await logActivity({
    action: 'Stripe checkout verlopen',
    entityType: md.kind || 'stripe',
    entityId: md.refId || session.id,
  });
}

async function handlePaymentFailed(event: Stripe.Event) {
  const intent = event.data.object as Stripe.PaymentIntent;
  const md = intent.metadata || {};
  await upsertPayment({
    stripe_payment_intent_id: intent.id,
    stripe_event_id: event.id,
    kind: md.kind || 'unknown',
    ref_id: md.refId || null,
    amount_cents: intent.amount || 0,
    currency: intent.currency || 'eur',
    customer_email: intent.receipt_email || null,
    description: intent.last_payment_error?.message || null,
    status: 'failed',
    raw: intent,
  });
  await logActivity({
    action: 'Stripe betaling mislukt',
    entityType: md.kind || 'stripe',
    entityId: md.refId || intent.id,
    details: intent.last_payment_error?.message || undefined,
  });
}

async function handleRefunded(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge;
  await upsertPayment({
    stripe_payment_intent_id: typeof charge.payment_intent === 'string' ? charge.payment_intent : null,
    stripe_event_id: event.id,
    kind: 'refund',
    ref_id: charge.id,
    amount_cents: charge.amount_refunded || 0,
    currency: charge.currency || 'eur',
    customer_email: charge.billing_details?.email || null,
    status: 'refunded',
    raw: charge,
  });
  await logActivity({
    action: 'Stripe terugbetaling',
    entityType: 'stripe',
    entityId: charge.id,
    details: `${((charge.amount_refunded || 0) / 100).toFixed(2)} ${charge.currency?.toUpperCase() || 'EUR'}`,
  });
}

async function handleDisputeCreated(event: Stripe.Event) {
  const dispute = event.data.object as Stripe.Dispute;
  await upsertPayment({
    stripe_payment_intent_id: typeof dispute.payment_intent === 'string' ? dispute.payment_intent : null,
    stripe_event_id: event.id,
    kind: 'dispute',
    ref_id: dispute.id,
    amount_cents: dispute.amount || 0,
    currency: dispute.currency || 'eur',
    description: dispute.reason || null,
    status: 'disputed',
    raw: dispute,
  });
  await logActivity({
    action: 'Stripe geschil aangemaakt',
    entityType: 'stripe',
    entityId: dispute.id,
    details: dispute.reason || undefined,
  });
}
