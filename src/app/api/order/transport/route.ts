import { NextRequest, NextResponse } from 'next/server';
import { createTransportRequest, getSettings, logActivity } from '@/lib/db';
import { validateBody, transportOrderSchema } from '@/lib/validations';
import { createCheckoutSession } from '@/lib/stripe';

// Transport = lokale eigen operatie. Vast bedrag uit app_settings
// (admin-instelbaar). Aanvraag staat op 'controleren' tot de webhook
// 'm op 'betaald' zet.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(transportOrderSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const d = validated.data;

    const settings = await getSettings(['transport_price']);
    const priceEur = Number(settings.transport_price ?? 0);
    if (!priceEur || priceEur <= 0) {
      return NextResponse.json(
        { error: 'Prijs nog niet ingesteld — neem contact op.' },
        { status: 503 },
      );
    }

    const entry = await createTransportRequest({
      name: d.name,
      email: d.email,
      phone: d.phone,
      from_location: d.fromLocation,
      to_location: d.toLocation,
      preferred_date: d.preferredDate || null,
      registration: d.registration || null,
      brand: d.brand || null,
      model: d.model || null,
      notes: d.description || null,
    });

    const origin = req.nextUrl.origin;
    const description = `Transport — ${d.fromLocation} → ${d.toLocation}`;
    const session = await createCheckoutSession({
      description,
      amountEur: priceEur,
      successUrl: `${origin}/diensten/bedankt?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/diensten/transport?cancelled=1`,
      customerEmail: d.email,
      metadata: {
        kind: 'transport_request',
        refId: String(entry.id),
        description,
      },
    });

    await logActivity({
      action: 'Transport-aanvraag (wacht op betaling)',
      entityType: 'transport_request',
      entityId: String(entry.id),
      entityLabel: `${d.name} — ${d.fromLocation} → ${d.toLocation}`,
    });

    return NextResponse.json({ success: true, checkoutUrl: session.url });
  } catch (error) {
    console.error('transport order error:', error);
    return NextResponse.json({ error: 'Aanvraag mislukt' }, { status: 500 });
  }
}
