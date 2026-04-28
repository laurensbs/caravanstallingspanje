import { NextRequest, NextResponse } from 'next/server';
import { sendIntake } from '@/lib/work-order-hub';
import { validateBody, inspectionOrderSchema } from '@/lib/validations';
import { logActivity } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(inspectionOrderSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const d = validated.data;

    const description = [
      d.description || 'Inspectie-aanvraag',
      d.preferredDate ? `Voorkeursdatum: ${d.preferredDate}` : null,
    ].filter(Boolean).join('\n');

    const result = await sendIntake({
      type: 'inspection',
      customer: { name: d.name, email: d.email, phone: d.phone },
      unit: d.registration ? { registration: d.registration, brand: d.brand || undefined, model: d.model || undefined } : undefined,
      title: 'Inspectie-aanvraag',
      description,
      locationHint: d.locationHint || undefined,
    });

    await logActivity({
      action: 'Inspectie-aanvraag doorgestuurd',
      entityType: 'public_intake',
      entityId: result.publicCode,
      entityLabel: `${d.name} — ${d.email}`,
    });

    return NextResponse.json({ success: true, publicCode: result.publicCode });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Aanvraag mislukt';
    console.error('inspection order error:', msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
