import { NextRequest, NextResponse } from 'next/server';
import { sendIntake } from '@/lib/work-order-hub';
import { validateBody, repairOrderSchema } from '@/lib/validations';
import { logActivity } from '@/lib/db';
import { sendMail, requestReceivedHtml } from '@/lib/email';
import { formatRef } from '@/lib/refs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(repairOrderSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const d = validated.data;

    const attachments = d.attachments || [];
    const metadata: Record<string, string> = { source: 'website-repair-form' };
    attachments.forEach((a, i) => { metadata[`photo_${i + 1}`] = a.url; });
    const attachmentLines = attachments.length
      ? '\n\nBijlagen:\n' + attachments.map((a, i) => `  ${i + 1}. ${a.fileName} — ${a.url}`).join('\n')
      : '';

    const result = await sendIntake({
      type: 'repair',
      customer: {
        name: d.name, email: d.email, phone: d.phone,
        address: d.address, postalCode: d.postal_code, city: d.city, country: d.country,
      },
      unit: d.registration ? { registration: d.registration, brand: d.brand || undefined, model: d.model || undefined } : undefined,
      title: 'Reparatie-aanvraag',
      description: d.description + attachmentLines,
      locationHint: d.locationHint || undefined,
      metadata,
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

    const ref = formatRef('reparatie', result.publicCode);
    return NextResponse.json({ success: true, ref, publicCode: result.publicCode });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Aanvraag mislukt';
    console.error('repair order error:', msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
