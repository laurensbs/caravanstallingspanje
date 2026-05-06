import { NextRequest, NextResponse } from 'next/server';
import { sendIntake } from '@/lib/work-order-hub';
import { validateBody, inspectionOrderSchema } from '@/lib/validations';
import { logActivity } from '@/lib/db';
import { sendMail, requestReceivedHtml } from '@/lib/email';
import { formatRef } from '@/lib/refs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(inspectionOrderSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const d = validated.data;

    const attachments = d.attachments || [];
    const metadata: Record<string, string> = { source: 'website-inspection-form' };
    attachments.forEach((a, i) => { metadata[`photo_${i + 1}`] = a.url; });
    const attachmentLines = attachments.length
      ? '\n\nBijlagen:\n' + attachments.map((a, i) => `  ${i + 1}. ${a.fileName} — ${a.url}`).join('\n')
      : '';

    const description = [
      d.description || 'Inspectie-aanvraag',
      d.preferredDate ? `Voorkeursdatum: ${d.preferredDate}` : null,
    ].filter(Boolean).join('\n') + attachmentLines;

    const result = await sendIntake({
      type: 'inspection',
      customer: {
        name: d.name, email: d.email, phone: d.phone,
        address: d.address, postalCode: d.postal_code, city: d.city, country: d.country,
      },
      unit: d.registration ? { registration: d.registration, brand: d.brand || undefined, model: d.model || undefined } : undefined,
      title: 'Inspectie-aanvraag',
      description,
      locationHint: d.locationHint || undefined,
      metadata,
    });

    await logActivity({
      action: 'Inspectie-aanvraag doorgestuurd',
      entityType: 'public_intake',
      entityId: result.publicCode,
      entityLabel: `${d.name} — ${d.email}`,
    });

    const mail = requestReceivedHtml({
      name: d.name,
      type: 'inspectie',
      description: d.description || undefined,
      preferredDate: d.preferredDate || null,
      reference: result.publicCode,
    });
    await sendMail({ to: d.email, subject: mail.subject, html: mail.html, text: mail.text })
      .catch((e) => console.error('inspection mail failed:', e));

    const ref = formatRef('inspectie', result.publicCode);
    return NextResponse.json({ success: true, ref, publicCode: result.publicCode });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Aanvraag mislukt';
    console.error('inspection order error:', msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
