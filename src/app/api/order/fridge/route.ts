import { NextRequest, NextResponse } from 'next/server';
import {
  findFridgeByEmail,
  createFridge,
  createFridgeBooking,
  logActivity,
  countOverlappingBookings,
  setFridgeHoldedContact,
} from '@/lib/db';
import { validateBody, fridgeOrderSchema } from '@/lib/validations';
import { calculatePriceWithSettings, formatEur, getEffectiveStock, effectiveAmountEur, type DeviceType } from '@/lib/pricing';
import { createCheckoutSession } from '@/lib/stripe';
import { formatRef, refKindForFridge } from '@/lib/refs';
import { ensureContact } from '@/lib/holded';
import { sendMail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(fridgeOrderSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    // Stock check: how many of this device type are reserved during this period?
    const inUse = await countOverlappingBookings(data.device_type, data.start_date, data.end_date);
    const stock = await getEffectiveStock();
    if (inUse >= stock[data.device_type as DeviceType]) {
      return NextResponse.json(
        { error: 'Geen voorraad', soldOut: true },
        { status: 409 },
      );
    }

    const price = await calculatePriceWithSettings(data.device_type as DeviceType, data.start_date, data.end_date);

    // Find existing customer by email or create one
    let fridge = await findFridgeByEmail(data.email);
    if (!fridge) {
      fridge = await createFridge({
        name: data.name,
        email: data.email,
        device_type: data.device_type,
        notes: `Telefoon: ${data.phone}`,
      });
    }

    const bookingNotes = [
      `Online aanvraag — ${formatEur(price.total)}`,
      `${price.days} dagen (${price.extraDays > 0 ? `1 week + ${price.extraDays} extra dagen à ${formatEur(price.dayPrice)}` : 'minimum week'})`,
      `Telefoon: ${data.phone}`,
      data.notes ? `Opmerking: ${data.notes}` : null,
    ].filter(Boolean).join('\n');

    const booking = await createFridgeBooking(fridge.id, {
      camping: data.camping,
      start_date: data.start_date,
      end_date: data.end_date,
      spot_number: data.spot_number || null,
      status: 'controleren',
      notes: bookingNotes,
    });

    await logActivity({
      action: 'Online koelkast-aanvraag',
      entityType: 'fridge_booking',
      entityId: String(booking.id),
      entityLabel: `${data.name} — ${data.camping}`,
      details: `${data.device_type} · ${formatEur(price.total)}`,
    });

    // ── Direct Holded-contact koppelen + admin notificatie ──
    // Best-effort: faalt het, dan blijft de Stripe-flow gewoon werken; de
    // webhook na betaling vult 'm alsnog. Maar normaal hebben we 'm meteen
    // gekoppeld zodat 'r in admin/koelkasten al een Holded-icoon naast staat.
    (async () => {
      try {
        const contact = await ensureContact({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postal_code: data.postal_code,
          country: data.country,
          vat_number: data.vat_number || null,
        });
        if (fridge && !fridge.holded_contact_id && contact.id) {
          await setFridgeHoldedContact(fridge.id, contact.id);
        }
      } catch (err) {
        console.warn('[fridge order] Holded contact link failed (non-fatal):', err instanceof Error ? err.message : err);
      }
    })();

    // Notificatie naar admin-mailbox zodat we direct zien dat 'r een nieuwe
    // online aanvraag binnen is — onafhankelijk van of de klant de Stripe-
    // flow afmaakt of niet. .catch zodat een mail-storing de bestelling
    // niet kapotmaakt.
    const adminNotifyHtml = `
      <h2 style="font-family:sans-serif;color:#0A1929">Nieuwe online ${data.device_type}-aanvraag</h2>
      <p style="font-family:sans-serif">Een klant heeft zojuist via de website een aanvraag gedaan:</p>
      <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Klant</td><td style="padding:6px 0"><strong>${data.name}</strong></td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">E-mail</td><td style="padding:6px 0">${data.email}</td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Telefoon</td><td style="padding:6px 0">${data.phone}</td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Adres</td><td style="padding:6px 0">${data.address}, ${data.postal_code} ${data.city}, ${data.country}</td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Apparaat</td><td style="padding:6px 0"><strong>${data.device_type}</strong></td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Camping</td><td style="padding:6px 0">${data.camping}${data.spot_number ? ` (${data.spot_number})` : ''}</td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Periode</td><td style="padding:6px 0">${data.start_date} → ${data.end_date}</td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Bedrag</td><td style="padding:6px 0"><strong>${formatEur(price.total)}</strong></td></tr>
      </table>
      <p style="font-family:sans-serif;font-size:13px;color:#6B7280;margin-top:18px">Klant doorgelinkt naar Stripe Checkout. Status volgt automatisch zodra betaling binnen is.</p>
    `;
    sendMail({
      to: 'laurens@caravanstalling-spanje.com',
      subject: `🆕 Nieuwe ${data.device_type}-aanvraag: ${data.name}`,
      html: adminNotifyHtml,
      text: `Nieuwe online aanvraag van ${data.name} (${data.email}, ${data.phone}). Apparaat: ${data.device_type}. Camping: ${data.camping}. Periode: ${data.start_date} → ${data.end_date}. Bedrag: ${formatEur(price.total)}.`,
    }).catch((err) => console.warn('[fridge order] admin notify mail failed:', err));

    // Stripe Checkout — booking is reserved on 'controleren' until the
    // webhook flips it to 'compleet' on payment.
    const origin = req.nextUrl.origin;
    const description = `${data.device_type} — ${data.camping} — ${data.start_date} t/m ${data.end_date}`;
    const ref = formatRef(refKindForFridge(data.device_type), booking.id);
    let checkoutUrl: string | null = null;
    try {
      const session = await createCheckoutSession({
        description,
        amountEur: effectiveAmountEur(price.total),
        successUrl: `${origin}/koelkast/bedankt?ref=${ref}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/koelkast?cancelled=1`,
        customerEmail: data.email,
        metadata: {
          kind: 'fridge_booking',
          refId: String(booking.id),
          ref,
          originalAmountCents: String(Math.round(price.total * 100)),
          description,
          // Adresgegevens reizen mee naar de webhook → Holded pro forma.
          billing_name: data.name,
          billing_phone: data.phone,
          billing_address: data.address,
          billing_postal_code: data.postal_code,
          billing_city: data.city,
          billing_country: data.country,
          billing_vat: data.vat_number || '',
        },
      });
      checkoutUrl = session.url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Checkout-fout';
      console.error('Stripe checkout error:', msg);
    }

    return NextResponse.json({
      success: true,
      total: price.total,
      days: price.days,
      ref,
      checkoutUrl,
    });
  } catch (error) {
    console.error('Fridge order error:', error);
    return NextResponse.json({ error: 'Kon aanvraag niet verwerken' }, { status: 500 });
  }
}
