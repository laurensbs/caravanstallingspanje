import { NextRequest, NextResponse } from 'next/server';
import { createWaitlistEntry, logActivity } from '@/lib/db';
import { validateBody, waitlistSchema } from '@/lib/validations';
import { sendMail, requestReceivedHtml } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(waitlistSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const d = validated.data;

    const entry = await createWaitlistEntry({
      device_type: d.device_type,
      name: d.name,
      email: d.email,
      phone: d.phone || null,
      camping: d.camping || null,
      spot_number: d.spot_number || null,
      start_date: d.start_date,
      end_date: d.end_date,
      notes: d.notes || null,
    });

    await logActivity({
      action: 'Wachtlijst-aanmelding',
      entityType: 'waitlist',
      entityId: String(entry.id),
      entityLabel: `${d.name} — ${d.device_type}`,
      details: `${d.start_date} t/m ${d.end_date}`,
    });

    const mail = requestReceivedHtml({
      name: d.name,
      type: 'wachtlijst',
      reference: `WL-${entry.id}`,
    });
    await sendMail({ to: d.email, subject: mail.subject, html: mail.html, text: mail.text })
      .catch((e) => console.error('waitlist mail failed:', e));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json({ error: 'Kon aanmelding niet opslaan' }, { status: 500 });
  }
}
