import { NextRequest, NextResponse } from 'next/server';
import { sendIntake } from '@/lib/work-order-hub';
import { validateBody, serviceOrderSchema } from '@/lib/validations';
import { logActivity } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(serviceOrderSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const d = validated.data;

    const result = await sendIntake({
      type: 'service',
      customer: { name: d.name, email: d.email, phone: d.phone },
      unit: d.registration ? { registration: d.registration, brand: d.brand || undefined, model: d.model || undefined } : undefined,
      title: `Service: ${d.serviceCategory}`,
      description: d.description || `Service-aanvraag: ${d.serviceCategory}`,
      locationHint: d.locationHint || undefined,
      serviceCategory: d.serviceCategory,
    });

    await logActivity({
      action: 'Service-aanvraag doorgestuurd',
      entityType: 'public_intake',
      entityId: result.publicCode,
      entityLabel: `${d.name} — ${d.serviceCategory}`,
    });

    return NextResponse.json({ success: true, publicCode: result.publicCode });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Aanvraag mislukt';
    console.error('service order error:', msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
