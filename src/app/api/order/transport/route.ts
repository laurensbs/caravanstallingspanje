import { NextRequest, NextResponse } from 'next/server';
import { createTransportRequest, getSettings, logActivity } from '@/lib/db';
import { validateBody, transportOrderSchema } from '@/lib/validations';
import { createCheckoutSession } from '@/lib/stripe';
import { effectiveAmountEur, formatEur } from '@/lib/pricing';
import { formatRef } from '@/lib/refs';
import { sendMail } from '@/lib/email';

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

    // Pickup-locatie:
    //  - wij_rijden: wij komen ophalen op de camping → pickup = camping
    //  - zelf:       klant haalt zelf op uit onze stalling → pickup = 'Stalling'
    const pickupLocation = d.mode === 'wij_rijden' ? d.camping : 'Stalling';

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
      pickup_location: pickupLocation,
      status: 'controleren',
    });

    const ref = formatRef('transport', entry.id);
    const origin = req.nextUrl.origin;
    const description = d.mode === 'wij_rijden'
      ? `Transport — wij halen op bij ${d.camping}`
      : `Transport — klant haalt zelf op uit Stalling`;

    const session = await createCheckoutSession({
      description,
      amountEur: effectiveAmountEur(priceEur),
      successUrl: `${origin}/diensten/bedankt?ref=${ref}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/diensten/transport?cancelled=1`,
      customerEmail: d.email,
      idempotencyKey: `transport_${entry.id}_${new Date().toISOString().slice(0, 10)}`,
      metadata: {
        kind: 'transport_request',
        refId: String(entry.id),
        ref,
        mode: d.mode,
        originalAmountCents: String(Math.round(priceEur * 100)),
        description,
        billing_name: d.name,
        billing_phone: d.phone,
        billing_address: d.address,
        billing_postal_code: d.postal_code,
        billing_city: d.city,
        billing_country: d.country,
        billing_vat: d.vat_number || '',
      },
    });

    await logActivity({
      action: 'Transport-aanvraag (wacht op betaling)',
      entityType: 'transport_request',
      entityId: String(entry.id),
      entityLabel: `${d.name} — ${d.camping} (${d.mode})`,
    });

    // Notificatie naar admin-mailbox zodat we direct zien dat 'r een nieuwe
    // transport-aanvraag binnen is — onafhankelijk van of de klant de
    // Stripe-flow afmaakt of niet.
    const modeLabel = d.mode === 'wij_rijden' ? 'Wij rijden voor je' : 'Klant haalt zelf op';
    const adminNotifyHtml = `
      <h2 style="font-family:sans-serif;color:#0A1929">Nieuwe transport-aanvraag</h2>
      <p style="font-family:sans-serif">Een klant heeft zojuist via de website een transport-aanvraag gedaan:</p>
      <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Klant</td><td style="padding:6px 0"><strong>${d.name}</strong></td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">E-mail</td><td style="padding:6px 0">${d.email}</td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Telefoon</td><td style="padding:6px 0">${d.phone}</td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Adres</td><td style="padding:6px 0">${d.address}, ${d.postal_code} ${d.city}, ${d.country}</td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Type</td><td style="padding:6px 0"><strong>${modeLabel}</strong></td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Camping</td><td style="padding:6px 0">${d.camping}</td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Heen</td><td style="padding:6px 0">${d.outboundDate}${d.outboundTime ? ` om ${d.outboundTime}` : ''}</td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Terug</td><td style="padding:6px 0">${d.returnDate}${d.returnTime ? ` om ${d.returnTime}` : ''}</td></tr>
        ${d.registration ? `<tr><td style="padding:6px 14px 6px 0;color:#6B7280">Kenteken</td><td style="padding:6px 0">${d.registration}</td></tr>` : ''}
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Bedrag</td><td style="padding:6px 0"><strong>${formatEur(priceEur)}</strong></td></tr>
      </table>
      <p style="font-family:sans-serif;font-size:13px;color:#6B7280;margin-top:18px">Klant doorgelinkt naar Stripe Checkout. Status volgt automatisch zodra betaling binnen is.</p>
    `;
    sendMail({
      to: 'laurens@caravanstalling-spanje.com',
      subject: `🆕 Nieuwe transport-aanvraag: ${d.name}`,
      html: adminNotifyHtml,
      text: `Nieuwe transport-aanvraag van ${d.name} (${d.email}, ${d.phone}). Type: ${modeLabel}. Heen: ${d.outboundDate}, terug: ${d.returnDate}. Bedrag: ${formatEur(priceEur)}.`,
    }).catch((err) => console.warn('[transport order] admin notify mail failed:', err));

    return NextResponse.json({ success: true, ref, checkoutUrl: session.url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Aanvraag mislukt';
    console.error('transport order error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
