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
  getFridgeById,
  getStallingRequestById,
  getTransportRequestById,
  setBookingHoldedInvoice,
  setStallingHoldedInvoice,
  setTransportHoldedInvoice,
  setBookingPaidAt,
  setStallingPaidAt,
  setTransportPaidAt,
  logActivity,
  cleanupOldPendingIntakes,
  getCustomerByEmail,
  createCustomer,
  linkFridgeToCustomer,
  linkStallingToCustomer,
  linkTransportToCustomer,
} from '@/lib/db';
import { sendIntake, type IntakePayload } from '@/lib/work-order-hub';
import { invoiceForCustomer, findContactByEmail } from '@/lib/holded';
import { sendMail, paymentReceivedHtml } from '@/lib/email';
import { formatRef, refKindForFridge } from '@/lib/refs';
import { log } from '@/lib/log';

// Stripe signature verification needs the raw request body, not the
// JSON-parsed version, so we run on the Node.js runtime and pass req.text().
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Webhook doet Holded-call + email + reparatiepanel-forward — kan tegen
// trage upstream wrijven. Default Vercel timeout (10s) is te krap.
export const maxDuration = 60;

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
    log.error('stripe_webhook_signature_invalid', err);
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
    log.error('stripe_webhook_handler_failed', err, { event_type: event.type, event_id: event.id });
    // Roll back the event-id marker so Stripe's retry will be processed
    // instead of skipped as duplicate. The DB writes inside the handler
    // are all idempotent (UPSERT) so re-running is safe.
    await unrecordStripeEvent(event.id).catch(() => { /* ignore */ });
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ─── Handlers ────────────────────────────────────────────

// Stripe-account wordt door meerdere sites gebruikt. We herkennen alleen
// onze eigen sessions aan metadata.kind — andere apps (bv. caravanverhuur-
// spanje.com) sturen hun eigen metadata-shape (bookingRef / holdedInvoiceId).
// We negeren die met 200 OK zodat Stripe 'm niet gaat retryen.
const OUR_KINDS = new Set([
  'fridge_booking',
  'fridge_booking_manual',
  'stalling_request',
  'transport_request',
  'service_intake',
]);

async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const md = session.metadata || {};
  const kind = md.kind || 'unknown';
  const refId = md.refId || null;

  // Niet onze sessie? Niets doen, geen 500. Webhook-endpoint krijgt events
  // van het hele Stripe-account; events zonder onze metadata.kind komen
  // van een andere app.
  if (!OUR_KINDS.has(kind)) {
    log.info('stripe_webhook_event_ignored_foreign', { kind, session_id: session.id });
    return;
  }
  const metaRef = typeof md.ref === 'string' ? md.ref : null;
  const originalAmountCents = md.originalAmountCents ? Number(md.originalAmountCents) : null;
  const originalAmountEur = originalAmountCents !== null && Number.isFinite(originalAmountCents)
    ? originalAmountCents / 100 : null;
  const intentId = typeof session.payment_intent === 'string' ? session.payment_intent : null;
  // Stripe-event timestamp = vrijwel exact het moment van de capture,
  // bruikbaar als 'paid_at' zonder een extra API-call naar paymentIntents.
  const paidAt = new Date(event.created * 1000);

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
  // Adresvelden meegegeven door de order-route in metadata. Reizen mee
  // naar invoiceForCustomer zodat de Holded-pro forma compleet is voor
  // onze boekhouding (anders missen straat/postcode/btw).
  const billing = {
    address: typeof md.billing_address === 'string' ? md.billing_address : null,
    city: typeof md.billing_city === 'string' ? md.billing_city : null,
    postal_code: typeof md.billing_postal_code === 'string' ? md.billing_postal_code : null,
    country: typeof md.billing_country === 'string' ? md.billing_country : null,
    vat_number: typeof md.billing_vat === 'string' && md.billing_vat ? md.billing_vat : null,
  };
  let invoiceDescription = (typeof md.description === 'string' ? md.description : '') || kind;
  const paidAmountEur = (session.amount_total ?? 0) / 100;
  // Voor Holded gebruiken we altijd het oorspronkelijke bedrag (echte prijs),
  // niet de €0.50 test-betaling. Voor klant-mail/receipt is dat ook netter.
  const amountEur = originalAmountEur ?? paidAmountEur;

  // Handmatig vanuit /admin/koelkasten verstuurde betaallink. Pro forma is al
  // bij verzenden van de mail aangemaakt; we hoeven nu alleen de booking als
  // betaald te markeren en de standaard bevestigingsmail uit te sturen
  // (dezelfde flow als reguliere fridge_booking, alleen geen pro-forma-creatie).
  if (kind === 'fridge_booking_manual' && refId) {
    const id = Number(refId);
    if (Number.isFinite(id) && id > 0) {
      await markBookingPaid(id, session.id);
      await setBookingPaidAt(id, paidAt, intentId).catch(() => {});
      const fridge = await getFridgeById(id).catch(() => null);
      if (fridge) {
        customerName = customerName || fridge.name;
        customerEmail = customerEmail || fridge.email || '';
      }
      await logActivity({
        action: 'Betaling ontvangen via verstuurde betaallink',
        entityType: 'fridge_booking',
        entityId: refId,
        entityLabel: customerEmail || undefined,
        details: `${amountEur.toFixed(2)} EUR`,
      });
    }
  } else if (kind === 'fridge_booking' && refId) {
    const id = Number(refId);
    if (Number.isFinite(id) && id > 0) {
      await markBookingPaid(id, session.id);
      await setBookingPaidAt(id, paidAt, intentId).catch(() => {});
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
      if (customerEmail && !booking?.holded_invoice_id) {
        try {
          const inv = await invoiceForCustomer({
            customer: { name: customerName || customerEmail, email: customerEmail, phone: customerPhone || null, ...billing },
            description: invoiceDescription,
            amountEur,
          });
          await setBookingHoldedInvoice(id, inv.id, inv.invoiceNum);
          // Customer-record aanmaken/koppelen: invoiceForCustomer heeft net
          // ensureContact gedaan, dus de Holded-id zit nu in de invoice.
          const linkedCustomer = await ensureLocalCustomer(customerName, customerEmail, customerPhone, inv.contactId);
          if (linkedCustomer) await linkFridgeToCustomer(id, linkedCustomer.id);
        } catch (err) {
          await logActivity({ action: 'Holded pro forma mislukt (koelkast)', entityType: kind, entityId: refId, details: err instanceof Error ? err.message : 'unknown' });
        }
      }
    }
  } else if (kind === 'stalling_request' && refId) {
    const id = Number(refId);
    if (Number.isFinite(id) && id > 0) {
      await markStallingRequestPaid(id);
      await setStallingPaidAt(id, paidAt, intentId).catch(() => {});
      const r = await getStallingRequestById(id).catch(() => null) as { name: string; email: string; phone?: string | null; type: string; holded_invoice_id?: string | null } | null;
      if (r) {
        customerName = customerName || r.name;
        customerEmail = customerEmail || r.email;
        customerPhone = customerPhone || r.phone || '';
        invoiceDescription = invoiceDescription || `Stalling ${r.type} — jaarprijs`;
        if (customerEmail && !r.holded_invoice_id) {
          try {
            const inv = await invoiceForCustomer({
              customer: { name: customerName, email: customerEmail, phone: customerPhone || null, ...billing },
              description: invoiceDescription,
              amountEur,
            });
            await setStallingHoldedInvoice(id, inv.id, inv.invoiceNum);
            const linkedCustomer = await ensureLocalCustomer(customerName, customerEmail, customerPhone, inv.contactId);
            if (linkedCustomer) await linkStallingToCustomer(id, linkedCustomer.id);
          } catch (err) {
            await logActivity({ action: 'Holded pro forma mislukt (stalling)', entityType: kind, entityId: refId, details: err instanceof Error ? err.message : 'unknown' });
          }
        }
      }
    }
  } else if (kind === 'transport_request' && refId) {
    const id = Number(refId);
    if (Number.isFinite(id) && id > 0) {
      await markTransportRequestPaid(id);
      await setTransportPaidAt(id, paidAt, intentId).catch(() => {});
      const r = await getTransportRequestById(id).catch(() => null) as null | {
        name: string; email: string; phone?: string | null;
        camping?: string | null; transport_mode?: string | null;
        holded_invoice_id?: string | null;
      };
      if (r) {
        customerName = customerName || r.name;
        customerEmail = customerEmail || r.email;
        customerPhone = customerPhone || r.phone || '';
        const modeLabel = r.transport_mode === 'zelf' ? 'zelf-rijden' : 'heen-en-terug';
        invoiceDescription = invoiceDescription || `Transport ${modeLabel} — ${r.camping || ''}`.trim();
        if (customerEmail && !r.holded_invoice_id) {
          try {
            const inv = await invoiceForCustomer({
              customer: { name: customerName, email: customerEmail, phone: customerPhone || null, ...billing },
              description: invoiceDescription,
              amountEur,
            });
            await setTransportHoldedInvoice(id, inv.id, inv.invoiceNum);
            const linkedCustomer = await ensureLocalCustomer(customerName, customerEmail, customerPhone, inv.contactId);
            if (linkedCustomer) await linkTransportToCustomer(id, linkedCustomer.id);
          } catch (err) {
            await logActivity({ action: 'Holded pro forma mislukt (transport)', entityType: kind, entityId: refId, details: err instanceof Error ? err.message : 'unknown' });
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

        // Notificatie naar werkplaats-mailbox (info@) — handig zodat
        // er meteen iemand het oppakt zonder dat ze het reparatiepaneel
        // hoeven te checken.
        const notifyHtml = `
          <h2 style="font-family:sans-serif;color:#0A1929">Nieuwe service-aanvraag</h2>
          <p style="font-family:sans-serif">Er is een nieuwe service-bestelling binnengekomen na betaling:</p>
          <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
            <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Klant</td><td style="padding:6px 0"><strong>${customerName || '—'}</strong></td></tr>
            <tr><td style="padding:6px 14px 6px 0;color:#6B7280">E-mail</td><td style="padding:6px 0">${customerEmail || '—'}</td></tr>
            <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Telefoon</td><td style="padding:6px 0">${customerPhone || '—'}</td></tr>
            <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Service</td><td style="padding:6px 0"><strong>${payload.title || '—'}</strong></td></tr>
            <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Bedrag</td><td style="padding:6px 0">€${(amountEur || 0).toFixed(2)}</td></tr>
            <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Werkbon-code</td><td style="padding:6px 0;font-family:monospace">${result.publicCode}</td></tr>
          </table>
          <p style="font-family:sans-serif;font-size:13px;color:#6B7280;margin-top:18px">De aanvraag staat klaar in het reparatiepaneel onder code <strong>${result.publicCode}</strong>.</p>
        `;
        await sendMail({
          to: 'laurens@caravanstalling-spanje.com',
          subject: `🔧 Nieuwe service-bestelling: ${payload.title || 'service'} (${result.publicCode})`,
          html: notifyHtml,
          text: `Nieuwe service-bestelling van ${customerName} — ${payload.title}. Werkbon-code: ${result.publicCode}.`,
        }).catch((err) => log.error('stripe_webhook_workshop_mail_failed', err, { intake_id: pending.id }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'forward failed';
        log.error('stripe_webhook_forward_failed', err, { intake_id: pending.id });
        // Niet throwen — anders retry-t Stripe en krijgen we dubbele Holded
        // pro forma's en mails. Klant heeft betaald, intake-payload staat
        // veilig in de DB. Admin krijgt een alert-mail zodat 't niet
        // onzichtbaar blijft.
        await logActivity({
          action: 'Forward naar reparatiepaneel mislukt',
          entityType: 'pending_intake',
          entityId: String(pending.id),
          details: msg,
        }).catch(() => {});
        const payload = pending.payload as IntakePayload;
        const alertHtml = `
          <h2 style="font-family:sans-serif;color:#dc2626">⚠ Service-forward mislukt</h2>
          <p style="font-family:sans-serif">Klant heeft betaald maar de werkbon kon niet worden doorgezet naar het reparatiepaneel.</p>
          <p style="font-family:sans-serif"><strong>Reden:</strong> ${msg}</p>
          <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
            <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Klant</td><td style="padding:6px 0"><strong>${payload.customer?.name || '—'}</strong></td></tr>
            <tr><td style="padding:6px 14px 6px 0;color:#6B7280">E-mail</td><td style="padding:6px 0">${payload.customer?.email || '—'}</td></tr>
            <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Telefoon</td><td style="padding:6px 0">${payload.customer?.phone || '—'}</td></tr>
            <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Service</td><td style="padding:6px 0"><strong>${payload.title || '—'}</strong></td></tr>
            <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Pending intake id</td><td style="padding:6px 0;font-family:monospace">${pending.id}</td></tr>
          </table>
          <p style="font-family:sans-serif;font-size:13px;color:#6B7280;margin-top:18px">
            Stuur de werkbon handmatig in via het reparatiepaneel of bel de klant.
          </p>
        `;
        await sendMail({
          to: 'laurens@caravanstalling-spanje.com',
          subject: `⚠ Service-forward mislukt: ${payload.title || 'service'}`,
          html: alertHtml,
          text: `Forward mislukt voor ${payload.customer?.name || 'klant'} (${payload.customer?.email || '—'}). Reden: ${msg}. Pending intake id: ${pending.id}.`,
        }).catch((mailErr) => log.error('stripe_webhook_alert_mail_failed', mailErr, { intake_id: pending.id }));
      }
    }
    // Holded-factuur voor service.
    if (customerEmail) {
      try {
        await invoiceForCustomer({
          customer: { name: customerName || customerEmail, email: customerEmail, phone: customerPhone || null },
          description: invoiceDescription,
          amountEur,
        });
      } catch (err) {
        await logActivity({ action: 'Holded pro forma mislukt (service)', entityType: kind, entityId: session.id, details: err instanceof Error ? err.message : 'unknown' });
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
      } else if (kind === 'transport_request') {
        reference = formatRef('transport', refId);
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
      log.error('stripe_webhook_payment_mail_failed', err, { reference });
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

// Zoekt een lokale customer-rij op email; maakt anders aan, gekoppeld aan
// het Holded-contact uit de net-aangemaakte factuur. Failsafe: gooit nooit.
async function ensureLocalCustomer(
  name: string,
  email: string,
  phone: string,
  holdedContactId: string,
) {
  if (!email) return null;
  try {
    const existing = await getCustomerByEmail(email);
    if (existing) {
      // Bestaande rij — zorg dat Holded-id en eventuele ontbrekende velden
      // worden bijgevuld zodat het admin-paneel klantgegevens compleet ziet.
      if (!existing.holded_contact_id && holdedContactId) {
        await updateCustomerHoldedId(existing.id, holdedContactId);
      }
      return existing;
    }
    // Geen lokale klant — haal volledig contact uit Holded op zodat we
    // adres / btw-nummer / mobiel ook lokaal kennen voor klant-360°.
    const holdedHit = await findContactByEmail(email).catch(() => null);
    const finalHoldedId = holdedContactId || holdedHit?.id || null;
    const addr = holdedHit?.address;
    return await createCustomer({
      name: name || holdedHit?.name || email,
      email,
      phone: phone || holdedHit?.phone || null,
      mobile: holdedHit?.mobile || null,
      address: addr?.address || null,
      city: addr?.city || null,
      postal_code: addr?.postalCode || null,
      country: addr?.country || 'ES',
      vat_number: holdedHit?.vatnumber || null,
      holded_contact_id: finalHoldedId,
      source: holdedHit ? 'holded_import' : 'stripe',
    });
  } catch (err) {
    log.error('stripe_webhook_ensure_customer_failed', err);
    return null;
  }
}

// Inline zodat de helper hierboven hem kan gebruiken zonder DB-helper toe
// te voegen die elders geen waarde levert.
async function updateCustomerHoldedId(id: number, holdedId: string) {
  const { sql } = await import('@/lib/db');
  await sql`UPDATE customers SET holded_contact_id = ${holdedId}, updated_at = NOW() WHERE id = ${id}`;
}
