import { NextRequest, NextResponse } from 'next/server';
import { createContactMessage, logActivity } from '@/lib/db';
import { validateBody, contactMessageSchema } from '@/lib/validations';
import { sendMail, contactReceivedHtml, contactNotifyHtml } from '@/lib/email';
import { formatRef } from '@/lib/refs';

const INFO_INBOX = 'info@caravanstalling-spanje.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(contactMessageSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const d = validated.data;

    const entry = await createContactMessage({
      name: d.name,
      email: d.email,
      phone: d.phone || null,
      subject: d.subject || null,
      message: d.message,
    });
    const ref = formatRef('contact', entry.id);

    await logActivity({
      action: 'Contact-bericht ontvangen',
      entityType: 'contact_message',
      entityId: String(entry.id),
      entityLabel: `${d.name} — ${d.email}`,
      details: d.subject || undefined,
    });

    // Bevestiging naar de klant
    const ack = contactReceivedHtml({ name: d.name, message: d.message, reference: ref });
    await sendMail({ to: d.email, subject: ack.subject, html: ack.html, text: ack.text })
      .catch((err) => console.error('contact ack mail failed:', err));

    // Notificatie naar info@-mailbox
    const notify = contactNotifyHtml({
      name: d.name,
      email: d.email,
      phone: d.phone || null,
      subject: d.subject || null,
      message: d.message,
      reference: ref,
    });
    await sendMail({ to: INFO_INBOX, subject: notify.subject, html: notify.html, text: notify.text })
      .catch((err) => console.error('contact notify mail failed:', err));

    return NextResponse.json({ success: true, ref });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Aanvraag mislukt';
    console.error('contact order error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
