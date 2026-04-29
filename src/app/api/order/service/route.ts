import { NextRequest, NextResponse } from 'next/server';
import {
  logActivity,
  createPendingIntakeReturningId,
  attachStripeSessionToPendingIntake,
  abandonPendingIntake,
} from '@/lib/db';
import { validateBody, serviceOrderSchema } from '@/lib/validations';
import { createCheckoutSession } from '@/lib/stripe';
import { effectiveAmountEur } from '@/lib/pricing';
import { formatRef } from '@/lib/refs';
import type { IntakePayload } from '@/lib/work-order-hub';

// Service flow: read catalog from reparatiepaneel → verify slug + price
// server-side → Stripe Checkout → webhook forwards to reparatiepaneel.
type CatalogItem = {
  slug: string;
  upstreamId: string;
  name: string;
  description: string | null;
  category: string | null;
  price_eur: number;
};

async function fetchCatalog(origin: string): Promise<CatalogItem[]> {
  const res = await fetch(`${origin}/api/order/services-catalog`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.services as CatalogItem[]) || [];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(serviceOrderSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const d = validated.data;

    // Verify slug against the live catalog (which proxies the reparatiepaneel
    // endpoint). Never trust the client-supplied price.
    const catalog = await fetchCatalog(req.nextUrl.origin);
    const service = catalog.find((s) => s.slug === d.serviceCategory);
    if (!service) {
      return NextResponse.json({ error: 'Onbekende service' }, { status: 400 });
    }
    const priceEur = service.price_eur;

    const intakePayload: IntakePayload = {
      type: 'service',
      customer: { name: d.name, email: d.email, phone: d.phone },
      unit: d.registration
        ? { registration: d.registration, brand: d.brand || undefined, model: d.model || undefined }
        : undefined,
      title: `Service: ${service.name}`,
      description: d.description || `Service-aanvraag: ${service.name}`,
      locationHint: d.locationHint || undefined,
      // The intake endpoint matches services on name (case-insensitive),
      // which lines up with how the reparatiepaneel admin enters them.
      serviceCategory: service.name,
    };

    // Intake eerst opslaan zodat we een ID hebben voor de ref-code en zodat
    // de payload niet verloren gaat als Stripe na ons faalt.
    const intakeId = await createPendingIntakeReturningId(intakePayload);
    const ref = formatRef('service', intakeId);

    const origin = req.nextUrl.origin;
    let session;
    try {
      session = await createCheckoutSession({
        description: service.name,
        amountEur: effectiveAmountEur(priceEur),
        successUrl: `${origin}/diensten/bedankt?ref=${ref}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/diensten/service?cancelled=1`,
        customerEmail: d.email,
        metadata: {
          kind: 'service_intake',
          refId: String(intakeId),
          ref,
          originalAmountCents: String(Math.round(priceEur * 100)),
          serviceSlug: service.slug,
        },
      });
    } catch (err) {
      await abandonPendingIntake(intakeId, err instanceof Error ? err.message : 'stripe failed');
      throw err;
    }
    if (!session.url) {
      await abandonPendingIntake(intakeId, 'no checkout url');
      return NextResponse.json({ error: 'Checkout-URL ontbreekt' }, { status: 502 });
    }

    await attachStripeSessionToPendingIntake(intakeId, session.id);

    await logActivity({
      action: 'Service-aanvraag (wacht op betaling)',
      entityType: 'pending_intake',
      entityId: String(intakeId),
      entityLabel: `${d.name} — ${service.name}`,
    });

    return NextResponse.json({ success: true, ref, checkoutUrl: session.url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Aanvraag mislukt';
    console.error('service order error:', msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
