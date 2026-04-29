import { NextRequest, NextResponse } from 'next/server';
import { createTransportRequest, getSettings, logActivity } from '@/lib/db';
import { validateBody, transportOrderSchema } from '@/lib/validations';
import { createCheckoutSession } from '@/lib/stripe';
import { effectiveAmountEur } from '@/lib/pricing';
import { formatRef } from '@/lib/refs';

// Transport is een betaalde dienst geworden. Twee tarieven:
//  - 'wij_rijden' (default €100) — wij halen op + brengen terug
//  - 'zelf' (default €50) — klant rijdt zelf, wij doen sleuteloverdracht
// Aanvraag staat op 'controleren' tot de Stripe-webhook 'm op 'betaald' zet.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(transportOrderSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const d = validated.data;

    const settings = await getSettings(['transport_price_wij_rijden', 'transport_price_zelf']);
    const priceEur = d.mode === 'wij_rijden'
      ? Number(settings.transport_price_wij_rijden ?? 100)
      : Number(settings.transport_price_zelf ?? 50);

    if (!priceEur || priceEur <= 0) {
      return NextResponse.json(
        { error: 'Tarief nog niet ingesteld — neem contact op.' },
        { status: 503 },
      );
    }

    const entry = await createTransportRequest({
      name: d.name,
      email: d.email,
      phone: d.phone,
      camping: d.camping,
      outbound_date: d.outboundDate,
      outbound_time: d.outboundTime || null,
      return_date: d.returnDate,
      return_time: d.returnTime || null,
      registration: d.registration || null,
      brand: d.brand || null,
      model: d.model || null,
      notes: d.description || null,
      mode: d.mode,
      status: 'controleren',
    });

    const ref = formatRef('transport', entry.id);
    const origin = req.nextUrl.origin;
    const description = d.mode === 'wij_rijden'
      ? `Transport heen-en-terug — ${d.camping}`
      : `Transport zelf-rijden (sleuteloverdracht) — ${d.camping}`;

    const session = await createCheckoutSession({
      description,
      amountEur: effectiveAmountEur(priceEur),
      successUrl: `${origin}/diensten/bedankt?ref=${ref}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/diensten/transport?cancelled=1`,
      customerEmail: d.email,
      metadata: {
        kind: 'transport_request',
        refId: String(entry.id),
        ref,
        mode: d.mode,
        originalAmountCents: String(Math.round(priceEur * 100)),
        description,
      },
    });

    await logActivity({
      action: 'Transport-aanvraag (wacht op betaling)',
      entityType: 'transport_request',
      entityId: String(entry.id),
      entityLabel: `${d.name} — ${d.camping} (${d.mode})`,
    });

    return NextResponse.json({ success: true, ref, checkoutUrl: session.url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Aanvraag mislukt';
    console.error('transport order error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
