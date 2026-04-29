import { NextRequest, NextResponse } from 'next/server';
import { createTransportRequest, logActivity } from '@/lib/db';
import { validateBody, transportOrderSchema } from '@/lib/validations';
import { sendMail, requestReceivedHtml } from '@/lib/email';
import { formatRef } from '@/lib/refs';

// Transport = aanvraag-only. Geen Stripe. Hoort bij de stalling, klant betaalt
// later (bv. samen met de stallingsfactuur). Klant geeft één camping op +
// een heen- en terug-datum; we maken één row in transport_requests.
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
      camping: d.camping,
      outbound_date: d.outboundDate,
      outbound_time: d.outboundTime || null,
      return_date: d.returnDate,
      return_time: d.returnTime || null,
      registration: d.registration || null,
      brand: d.brand || null,
      model: d.model || null,
      notes: d.description || null,
    });

    const heen = `${d.outboundDate}${d.outboundTime ? ` ${d.outboundTime}` : ''}`;
    const terug = `${d.returnDate}${d.returnTime ? ` ${d.returnTime}` : ''}`;

    await logActivity({
      action: 'Transport-aanvraag ontvangen',
      entityType: 'transport_request',
      entityId: String(entry.id),
      entityLabel: `${d.name} — ${d.camping}`,
      details: `Heen ${heen} · Terug ${terug}`,
    });

    const reference = formatRef('transport', entry.id);
    const mail = requestReceivedHtml({
      name: d.name,
      type: 'service',
      description: `Transport heen-en-terug — ${d.camping}\nHeen: ${heen}\nTerug: ${terug}`,
      reference,
    });
    await sendMail({ to: d.email, subject: mail.subject, html: mail.html, text: mail.text })
      .catch((err) => console.error('transport mail failed:', err));

    return NextResponse.json({ success: true, publicCode: reference });
  } catch (error) {
    console.error('transport order error:', error);
    return NextResponse.json({ error: 'Aanvraag mislukt' }, { status: 500 });
  }
}
