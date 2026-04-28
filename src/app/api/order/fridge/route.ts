import { NextRequest, NextResponse } from 'next/server';
import { findFridgeByEmail, createFridge, createFridgeBooking, logActivity } from '@/lib/db';
import { validateBody, fridgeOrderSchema } from '@/lib/validations';
import { calculatePrice, formatEur, type DeviceType } from '@/lib/pricing';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(fridgeOrderSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

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

    return NextResponse.json({
      success: true,
      total: price.total,
      days: price.days,
    });
  } catch (error) {
    console.error('Fridge order error:', error);
    return NextResponse.json({ error: 'Kon aanvraag niet verwerken' }, { status: 500 });
  }
}
