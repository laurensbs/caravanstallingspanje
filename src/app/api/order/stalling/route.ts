import { NextRequest, NextResponse } from 'next/server';
import { createStallingRequest, getSettings, logActivity } from '@/lib/db';
import { validateBody, stallingOrderSchema } from '@/lib/validations';
import { createCheckoutSession } from '@/lib/stripe';

// Stalling = lokaal, klant betaalt het hele jaar vooruit. Bedrag komt uit
// app_settings (admin-instelbaar). Aanvraag staat op 'controleren' tot
// de webhook 'm op 'betaald' zet.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(stallingOrderSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const d = validated.data;

    const settings = await getSettings(['stalling_price_binnen', 'stalling_price_buiten']);
    const priceEur = d.type === 'binnen'
      ? Number(settings.stalling_price_binnen ?? 0)
      : Number(settings.stalling_price_buiten ?? 0);

    if (!priceEur || priceEur <= 0) {
      return NextResponse.json(
        { error: 'Prijs nog niet ingesteld — neem contact op.' },
        { status: 503 },
      );
    }

    const entry = await createStallingRequest({
      type: d.type,
      name: d.name,
      email: d.email,
      phone: d.phone || null,
      start_date: d.start_date,
      end_date: d.end_date || null,
      registration: d.registration || null,
      brand: d.brand || null,
      model: d.model || null,
      length: d.length || null,
      notes: d.notes || null,
    });

    const origin = req.nextUrl.origin;
    const description = `Stalling ${d.type} — startdatum ${d.start_date}`;
    const session = await createCheckoutSession({
      description,
      amountEur: priceEur,
      successUrl: `${origin}/diensten/bedankt?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/diensten/stalling?cancelled=1`,
      customerEmail: d.email,
      metadata: {
        kind: 'stalling_request',
        refId: String(entry.id),
        description,
      },
    });

    await logActivity({
      action: 'Stalling-aanvraag (wacht op betaling)',
      entityType: 'stalling_request',
      entityId: String(entry.id),
      entityLabel: `${d.name} — ${d.type}`,
    });

    return NextResponse.json({ success: true, checkoutUrl: session.url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Aanvraag mislukt';
    console.error('stalling order error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
