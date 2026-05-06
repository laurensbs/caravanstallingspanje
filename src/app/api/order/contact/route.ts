import { NextRequest, NextResponse } from 'next/server';
import { createContactMessage, logActivity } from '@/lib/db';
import { validateBody, contactMessageSchema } from '@/lib/validations';
import { sendMail, contactReceivedHtml, contactNotifyHtml } from '@/lib/email';
import { sendIntake } from '@/lib/work-order-hub';
import { formatRef } from '@/lib/refs';

const INFO_INBOX = 'info@caravanstalling-spanje.com';

// Smart-routing: berichten met topic 'repair' of 'inspection' gaan automatisch
// via sendIntake naar het reparatie-paneel (waar werkplaats ze pakt).
// Andere topics (storage / sales / general) blijven hier in contact_messages
// en worden alleen gemaild — die handelen wij zelf af.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(contactMessageSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const d = validated.data;

    const attachments = d.attachments || [];
    const attachmentLines = attachments.length
      ? '\n\nBijlagen:\n' + attachments.map((a, i) => `  ${i + 1}. ${a.fileName} — ${a.url}`).join('\n')
      : '';

    // Forward naar reparatie-paneel als het over werk gaat.
    if (d.topic === 'repair' || d.topic === 'inspection') {
      const intakeType = d.topic === 'repair' ? 'repair' : 'inspection';
      const metadata: Record<string, string> = {
        source: 'website-contact',
        topic: d.topic,
      };
      if (d.phone) metadata.phone = d.phone;
      attachments.forEach((a, i) => {
        metadata[`photo_${i + 1}`] = a.url;
      });

      try {
        const result = await sendIntake({
          type: intakeType,
          customer: { name: d.name, email: d.email, phone: d.phone || undefined },
          unit: d.registration || d.brand || d.model
            ? {
                registration: d.registration || undefined,
                brand: d.brand || undefined,
                model: d.model || undefined,
              }
            : undefined,
          title: d.subject || (d.topic === 'repair' ? 'Reparatie-aanvraag (contact)' : 'Inspectie-aanvraag (contact)'),
          description: d.message + attachmentLines,
          metadata,
        });
        const ref = formatRef(d.topic === 'repair' ? 'reparatie' : 'inspectie', result.publicCode);

        await logActivity({
          action: `${d.topic === 'repair' ? 'Reparatie' : 'Inspectie'}-vraag (contactform) doorgestuurd`,
          entityType: 'public_intake',
          entityId: result.publicCode,
          entityLabel: `${d.name} — ${d.email}`,
          details: `${attachments.length} bijlage(n)`,
        });

        // Bevestiging naar klant
        const ack = contactReceivedHtml({ name: d.name, message: d.message, reference: ref });
        await sendMail({ to: d.email, subject: ack.subject, html: ack.html, text: ack.text })
          .catch((err) => console.error('contact ack mail failed:', err));

        return NextResponse.json({ success: true, ref });
      } catch (err) {
        // Reparatie-paneel onbereikbaar — fall-through naar gewone contact-flow
        // zodat het bericht in elk geval landt en wij 'm handmatig kunnen doorsturen.
        console.error('[contact] intake forward failed, falling back to local:', err);
      }
    }

    // Lokale flow voor storage / sales / general (en fallback bij intake-fail)
    const entry = await createContactMessage({
      name: d.name,
      email: d.email,
      phone: d.phone || null,
      subject: d.subject || null,
      message: d.message + attachmentLines,
    });
    const ref = formatRef('contact', entry.id);

    await logActivity({
      action: 'Contact-bericht ontvangen',
      entityType: 'contact_message',
      entityId: String(entry.id),
      entityLabel: `${d.name} — ${d.email}`,
      details: [d.topic, d.subject, attachments.length ? `${attachments.length} bijlage(n)` : null]
        .filter(Boolean).join(' · ') || undefined,
    });

    const ack = contactReceivedHtml({ name: d.name, message: d.message, reference: ref });
    await sendMail({ to: d.email, subject: ack.subject, html: ack.html, text: ack.text })
      .catch((err) => console.error('contact ack mail failed:', err));

    const notify = contactNotifyHtml({
      name: d.name,
      email: d.email,
      phone: d.phone || null,
      subject: d.subject ? `[${d.topic ?? 'general'}] ${d.subject}` : `[${d.topic ?? 'general'}]`,
      message: d.message + attachmentLines,
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
