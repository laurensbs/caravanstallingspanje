import { NextRequest, NextResponse } from 'next/server';
import { sendIntake } from '@/lib/work-order-hub';
import { validateBody, repairOrderSchema } from '@/lib/validations';
import { logActivity } from '@/lib/db';
import { sendMail, requestReceivedHtml } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(repairOrderSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const d = validated.data;

    const result = await sendIntake({
      type: 'repair',
      customer: { name: d.name, email: d.email, phone: d.phone },
      unit: d.registration ? { registration: d.registration, brand: d.brand || undefined, model: d.model || undefined } : undefined,
      title: 'Reparatie-aanvraag',
      description: d.description,
      locationHint: d.locationHint || undefined,
    });

    await logActivity({
      action: 'Reparatie-aanvraag doorgestuurd',
      entityType: 'public_intake',
      entityId: result.publicCode,
      entityLabel: `${d.name} — ${d.email}`,
    });

    const mail = requestReceivedHtml({
      name: d.name,
      type: 'reparatie',
      description: d.description,
      reference: result.publicCode,
    });
    await sendMail({ to: d.email, subject: mail.subject, html: mail.html, text: mail.text })
      .catch((e) => console.error('repair mail failed:', e));

    return NextResponse.json({ success: true, publicCode: result.publicCode });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Aanvraag mislukt';
    console.error('repair order error:', msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
