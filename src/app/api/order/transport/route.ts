import { NextRequest, NextResponse } from 'next/server';
import { createTransportRequest, logActivity } from '@/lib/db';
import { validateBody, transportOrderSchema } from '@/lib/validations';

// Transport blijft LOKAAL in het stallings-portaal — het is onze eigen
// operatie (caravan ophalen/brengen), geen reparatieklus.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(transportOrderSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const d = validated.data;

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

    await logActivity({
      action: 'Transport-aanvraag ontvangen',
      entityType: 'transport_request',
      entityId: String(entry.id),
      entityLabel: `${d.name} — ${d.fromLocation} → ${d.toLocation}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('transport order error:', error);
    return NextResponse.json({ error: 'Aanvraag mislukt' }, { status: 500 });
  }
}
