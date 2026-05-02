import { NextRequest, NextResponse } from 'next/server';
import { createStallingRequest, getSettings, logActivity } from '@/lib/db';
import { validateBody, stallingOrderSchema } from '@/lib/validations';
import { createCheckoutSession } from '@/lib/stripe';
import { effectiveAmountEur, formatEur } from '@/lib/pricing';
import { formatRef } from '@/lib/refs';
import { sendMail } from '@/lib/email';

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
    const ref = formatRef('stalling', entry.id);
    const session = await createCheckoutSession({
      description,
      amountEur: effectiveAmountEur(priceEur),
      successUrl: `${origin}/diensten/bedankt?ref=${ref}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/diensten/stalling?cancelled=1`,
      customerEmail: d.email,
      idempotencyKey: `stalling_${entry.id}_${new Date().toISOString().slice(0, 10)}`,
      metadata: {
        kind: 'stalling_request',
        refId: String(entry.id),
        ref,
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
      action: 'Stalling-aanvraag (wacht op betaling)',
      entityType: 'stalling_request',
      entityId: String(entry.id),
      entityLabel: `${d.name} — ${d.type}`,
    });

    // Notificatie naar admin-mailbox zodat we direct zien dat 'r een nieuwe
    // stalling-aanvraag binnen is — onafhankelijk van of de klant de
    // Stripe-flow afmaakt of niet.
    const adminNotifyHtml = `
      <h2 style="font-family:sans-serif;color:#0A1929">Nieuwe stalling-aanvraag (${d.type})</h2>
      <p style="font-family:sans-serif">Een klant heeft zojuist via de website een stalling-aanvraag gedaan:</p>
      <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Klant</td><td style="padding:6px 0"><strong>${d.name}</strong></td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">E-mail</td><td style="padding:6px 0">${d.email}</td></tr>
        ${d.phone ? `<tr><td style="padding:6px 14px 6px 0;color:#6B7280">Telefoon</td><td style="padding:6px 0">${d.phone}</td></tr>` : ''}
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Adres</td><td style="padding:6px 0">${d.address}, ${d.postal_code} ${d.city}, ${d.country}</td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Type</td><td style="padding:6px 0"><strong>${d.type === 'binnen' ? 'Binnenstalling' : 'Buitenstalling'}</strong></td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Startdatum</td><td style="padding:6px 0">${d.start_date}</td></tr>
        ${d.registration ? `<tr><td style="padding:6px 14px 6px 0;color:#6B7280">Kenteken</td><td style="padding:6px 0">${d.registration}</td></tr>` : ''}
        ${d.brand || d.model ? `<tr><td style="padding:6px 14px 6px 0;color:#6B7280">Caravan</td><td style="padding:6px 0">${[d.brand, d.model].filter(Boolean).join(' ')}</td></tr>` : ''}
        ${d.length ? `<tr><td style="padding:6px 14px 6px 0;color:#6B7280">Lengte</td><td style="padding:6px 0">${d.length} m</td></tr>` : ''}
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Bedrag</td><td style="padding:6px 0"><strong>${formatEur(priceEur)}</strong></td></tr>
      </table>
      <p style="font-family:sans-serif;font-size:13px;color:#6B7280;margin-top:18px">Klant doorgelinkt naar Stripe Checkout. Status volgt automatisch zodra betaling binnen is.</p>
    `;
    sendMail({
      to: 'laurens@caravanstalling-spanje.com',
      subject: `🆕 Nieuwe stalling-aanvraag (${d.type}): ${d.name}`,
      html: adminNotifyHtml,
      text: `Nieuwe stalling-aanvraag van ${d.name} (${d.email}). Type: ${d.type}. Start: ${d.start_date}. Bedrag: ${formatEur(priceEur)}.`,
    }).catch((err) => console.warn('[stalling order] admin notify mail failed:', err));

    return NextResponse.json({ success: true, ref, checkoutUrl: session.url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Aanvraag mislukt';
    console.error('stalling order error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
