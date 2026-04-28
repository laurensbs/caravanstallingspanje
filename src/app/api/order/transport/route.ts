import { NextRequest, NextResponse } from 'next/server';
import { sendIntake } from '@/lib/work-order-hub';
import { validateBody, transportOrderSchema } from '@/lib/validations';
import { logActivity } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(transportOrderSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const d = validated.data;

    const result = await sendIntake({
      type: 'transport',
      customer: { name: d.name, email: d.email, phone: d.phone },
      unit: d.registration ? { registration: d.registration, brand: d.brand || undefined, model: d.model || undefined } : undefined,
      title: `Transport: ${d.fromLocation} → ${d.toLocation}`,
      description: d.description || 'Transport-aanvraag',
      transport: {
        from: d.fromLocation,
        to: d.toLocation,
        preferredDate: d.preferredDate || undefined,
      },
    });

    await logActivity({
      action: 'Transport-aanvraag doorgestuurd',
      entityType: 'public_intake',
      entityId: result.publicCode,
      entityLabel: `${d.name} — ${d.fromLocation} → ${d.toLocation}`,
    });

    return NextResponse.json({ success: true, publicCode: result.publicCode });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Aanvraag mislukt';
    console.error('transport order error:', msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
