import { NextRequest, NextResponse } from 'next/server';
import { logActivity, getServiceBySlug, createPendingIntake } from '@/lib/db';
import { validateBody, serviceOrderSchema } from '@/lib/validations';
import { createCheckoutSession } from '@/lib/stripe';
import type { IntakePayload } from '@/lib/work-order-hub';

// Service flow: pick from catalog → pay → webhook forwards to reparatiepanel.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(serviceOrderSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const d = validated.data;

    // Look up the service by slug (passed via serviceCategory) — refuses if not in catalog.
    const service = await getServiceBySlug(d.serviceCategory);
    if (!service) {
      return NextResponse.json({ error: 'Onbekende service' }, { status: 400 });
    }
    const priceEur = Number(service.price_eur);

    const intakePayload: IntakePayload = {
      type: 'service',
      customer: { name: d.name, email: d.email, phone: d.phone },
      unit: d.registration
        ? { registration: d.registration, brand: d.brand || undefined, model: d.model || undefined }
        : undefined,
      title: `Service: ${service.name}`,
      description: d.description || `Service-aanvraag: ${service.name}`,
      locationHint: d.locationHint || undefined,
      serviceCategory: service.name,
    };

    const origin = req.nextUrl.origin;
    const session = await createCheckoutSession({
      description: `${service.name}`,
      amountEur: priceEur,
      successUrl: `${origin}/diensten/bedankt?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/diensten/service?cancelled=1`,
      customerEmail: d.email,
      metadata: {
        kind: 'service_intake',
        serviceSlug: service.slug,
      },
    });
    if (!session.url) {
      return NextResponse.json({ error: 'Checkout-URL ontbreekt' }, { status: 502 });
    }

    await createPendingIntake(session.id, intakePayload);

    await logActivity({
      action: 'Service-aanvraag (wacht op betaling)',
      entityType: 'pending_intake',
      entityId: session.id,
      entityLabel: `${d.name} — ${service.name}`,
    });

    return NextResponse.json({ success: true, checkoutUrl: session.url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Aanvraag mislukt';
    console.error('service order error:', msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
