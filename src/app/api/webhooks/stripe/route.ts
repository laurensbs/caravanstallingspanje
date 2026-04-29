import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe, webhookSecret } from '@/lib/stripe';
import {
  recordStripeEventOnce,
  unrecordStripeEvent,
  upsertPayment,
  markBookingPaid,
  markStallingRequestPaid,
  getPendingIntakeBySession,
  markPendingIntakeForwarded,
  getFridgeById,
  getStallingRequestById,
  setBookingHoldedInvoice,
  setStallingHoldedInvoice,
  logActivity,
  cleanupOldPendingIntakes,
} from '@/lib/db';
import { sendIntake, type IntakePayload } from '@/lib/work-order-hub';
import { invoiceForCustomer } from '@/lib/holded';
import { sendMail, paymentReceivedHtml } from '@/lib/email';
import { TEST_MODE } from '@/lib/pricing';
import { formatRef, refKindForFridge } from '@/lib/refs';

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
  const metaRef = typeof md.ref === 'string' ? md.ref : null;
  const originalAmountCents = md.originalAmountCents ? Number(md.originalAmountCents) : null;
  const originalAmountEur = originalAmountCents !== null && Number.isFinite(originalAmountCents)
    ? originalAmountCents / 100 : null;
  const intentId = typeof session.payment_intent === 'string' ? session.payment_intent : null;

  // Lazy cleanup: markeer pending_intakes ouder dan 24u als verlaten zodat
  // de tabel netjes blijft. Best-effort.
  await cleanupOldPendingIntakes(24).catch(() => {});

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

  // Holded + e-mail vars die we hieronder vullen per kind.
  let customerName = session.customer_details?.name || '';
  let customerEmail = session.customer_details?.email || session.customer_email || '';
  let customerPhone = session.customer_details?.phone || '';
  let invoiceDescription = (typeof md.description === 'string' ? md.description : '') || kind;
  const paidAmountEur = (session.amount_total ?? 0) / 100;
  // Voor Holded gebruiken we altijd het oorspronkelijke bedrag (echte prijs),
  // niet de €0.50 test-betaling. Voor klant-mail/receipt is dat ook netter.
  const amountEur = originalAmountEur ?? paidAmountEur;

  if (kind === 'fridge_booking' && refId) {
    const id = Number(refId);
    if (Number.isFinite(id) && id > 0) {
      await markBookingPaid(id, session.id);
      const fridge = await getFridgeById(id).catch(() => null);
      if (fridge) {
        customerName = customerName || fridge.name;
        customerEmail = customerEmail || fridge.email || '';
        // Notes-veld bevat "Telefoon: 06…" — eruit halen voor Holded match.
        const phoneMatch = String(fridge.notes || '').match(/Telefoon:\s*([+\d\s().-]{5,})/i);
        if (phoneMatch && !customerPhone) customerPhone = phoneMatch[1].trim();
      }
      // Holded factuur (idempotent: bestaande invoice respecteren).
      const booking = fridge?.bookings?.find((b: { id: number }) => b.id === id);
      if (TEST_MODE) {
        await logActivity({ action: 'Holded overgeslagen (testmodus)', entityType: kind, entityId: refId });
      } else if (customerEmail && !booking?.holded_invoice_id) {
        try {
          const inv = await invoiceForCustomer({
            customer: { name: customerName || customerEmail, email: customerEmail, phone: customerPhone || null },
            description: invoiceDescription,
            amountEur,
          });
          await setBookingHoldedInvoice(id, inv.id, inv.invoiceNum);
        } catch (err) {
          await logActivity({ action: 'Holded factuur mislukt (koelkast)', entityType: kind, entityId: refId, details: err instanceof Error ? err.message : 'unknown' });
        }
      }
    }
  } else if (kind === 'stalling_request' && refId) {
    const id = Number(refId);
    if (Number.isFinite(id) && id > 0) {
      await markStallingRequestPaid(id);
      const r = await getStallingRequestById(id).catch(() => null) as { name: string; email: string; phone?: string | null; type: string; holded_invoice_id?: string | null } | null;
      if (r) {
        customerName = customerName || r.name;
        customerEmail = customerEmail || r.email;
        customerPhone = customerPhone || r.phone || '';
        invoiceDescription = invoiceDescription || `Stalling ${r.type} — jaarprijs`;
        if (TEST_MODE) {
          await logActivity({ action: 'Holded overgeslagen (testmodus)', entityType: kind, entityId: refId });
        } else if (customerEmail && !r.holded_invoice_id) {
          try {
            const inv = await invoiceForCustomer({
              customer: { name: customerName, email: customerEmail, phone: customerPhone || null },
              description: invoiceDescription,
              amountEur,
            });
            await setStallingHoldedInvoice(id, inv.id, inv.invoiceNum);
          } catch (err) {
            await logActivity({ action: 'Holded factuur mislukt (stalling)', entityType: kind, entityId: refId, details: err instanceof Error ? err.message : 'unknown' });
          }
        }
      }
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
        // Customer info uit de pending payload (zelfde formaat als IntakePayload).
        customerName = customerName || payload.customer?.name || '';
        customerEmail = customerEmail || payload.customer?.email || '';
        customerPhone = customerPhone || payload.customer?.phone || '';
        invoiceDescription = invoiceDescription || payload.title || 'Service';
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'forward failed';
        console.error('[stripe-webhook] forward to reparatiepanel failed:', msg);
        throw new Error(`Forward to reparatiepanel failed: ${msg}`);
      }
    }
    // Holded-factuur voor service.
    if (TEST_MODE) {
      await logActivity({ action: 'Holded overgeslagen (testmodus)', entityType: kind, entityId: session.id });
    } else if (customerEmail) {
      try {
        await invoiceForCustomer({
          customer: { name: customerName || customerEmail, email: customerEmail, phone: customerPhone || null },
          description: invoiceDescription,
          amountEur,
        });
      } catch (err) {
        await logActivity({ action: 'Holded factuur mislukt (service)', entityType: kind, entityId: session.id, details: err instanceof Error ? err.message : 'unknown' });
      }
    }
  }

  await logActivity({
    action: 'Stripe betaling ontvangen',
    entityType: kind,
    entityId: refId || session.id,
    entityLabel: session.customer_details?.email || session.customer_email || undefined,
    details: `${amountEur.toFixed(2)} ${session.currency?.toUpperCase() || 'EUR'}`,
  });

  // Bevestigingsmail naar klant. Reference: metadata.ref van de order route
  // is leidend (KK-12, ST-3, SR-7); fallback voor oude sessions zonder ref.
  if (customerEmail) {
    let reference = metaRef;
    if (!reference && refId) {
      if (kind === 'fridge_booking') {
        reference = formatRef(refKindForFridge(invoiceDescription.startsWith('Airco') ? 'Airco' : ''), refId);
      } else if (kind === 'stalling_request') {
        reference = formatRef('stalling', refId);
      } else if (kind === 'service_intake') {
        reference = formatRef('service', refId);
      }
    }
    if (!reference) reference = session.id.slice(0, 16);

    const mail = paymentReceivedHtml({
      name: customerName || customerEmail,
      service: invoiceDescription,
      amountEur,
      reference,
    });
    await sendMail({ to: customerEmail, subject: mail.subject, html: mail.html, text: mail.text }).catch((err) => {
      console.error('[stripe-webhook] mail send failed:', err);
    });
  }
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
