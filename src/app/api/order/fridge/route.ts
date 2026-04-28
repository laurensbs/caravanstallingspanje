import { NextRequest, NextResponse } from 'next/server';
import {
  findFridgeByEmail,
  createFridge,
  createFridgeBooking,
  logActivity,
  countOverlappingBookings,
} from '@/lib/db';
import { validateBody, fridgeOrderSchema } from '@/lib/validations';
import { calculatePrice, formatEur, STOCK, type DeviceType } from '@/lib/pricing';
import { createCheckoutSession } from '@/lib/stripe';

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
    if (inUse >= STOCK[data.device_type as DeviceType]) {
      return NextResponse.json(
        { error: 'Geen voorraad', soldOut: true },
        { status: 409 },
      );
    }

    const price = calculatePrice(data.device_type as DeviceType, data.start_date, data.end_date);

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

    // Stripe Checkout — booking is reserved on 'controleren' until the
    // webhook flips it to 'compleet' on payment.
    const origin = req.nextUrl.origin;
    const description = `${data.device_type} — ${data.camping} — ${data.start_date} t/m ${data.end_date}`;
    let checkoutUrl: string | null = null;
    try {
      const session = await createCheckoutSession({
        description,
        amountEur: price.total,
        successUrl: `${origin}/koelkast/bedankt?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/koelkast?cancelled=1`,
        customerEmail: data.email,
        metadata: {
          kind: 'fridge_booking',
          refId: String(booking.id),
          description,
        },
      });
      checkoutUrl = session.url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Checkout-fout';
      console.error('Stripe checkout error:', msg);
      // Booking blijft staan op 'controleren'; we geven success terug zonder
      // checkout-URL zodat de klant via de "bedankt"-pagina te zien krijgt
      // dat we hen handmatig benaderen.
    }

    return NextResponse.json({
      success: true,
      total: price.total,
      days: price.days,
      checkoutUrl,
    });
  } catch (error) {
    console.error('Fridge order error:', error);
    return NextResponse.json({ error: 'Kon aanvraag niet verwerken' }, { status: 500 });
  }
}
