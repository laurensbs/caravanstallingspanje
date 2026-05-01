import { NextRequest, NextResponse } from 'next/server';
import { createIdea, logActivity } from '@/lib/db';
import { validateBody, ideaSchema } from '@/lib/validations';
import { sendMail } from '@/lib/email';

const NOTIFY_INBOX = 'laurens@caravanstalling-spanje.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(ideaSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const d = validated.data;
    const entry = await createIdea({
      name: d.name || null,
      email: d.email || null,
      category: d.category || null,
      title: d.title,
      message: d.message,
    });

    await logActivity({
      action: 'Idee ingediend',
      entityType: 'idea',
      entityId: String(entry.id),
      entityLabel: d.title,
      details: d.email || d.name || 'anoniem',
    });

    // Notificatie naar Laurens
    const html = `
      <h2 style="font-family:sans-serif;color:#0A1929">💡 Nieuw idee in de ideeënbus</h2>
      <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Categorie</td><td style="padding:6px 0"><strong>${escape(d.category || '—')}</strong></td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Titel</td><td style="padding:6px 0"><strong>${escape(d.title)}</strong></td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">Naam</td><td style="padding:6px 0">${escape(d.name || 'anoniem')}</td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6B7280">E-mail</td><td style="padding:6px 0">${escape(d.email || '—')}</td></tr>
      </table>
      <h3 style="font-family:sans-serif;color:#0A1929;margin-top:18px;font-size:14px">Bericht</h3>
      <p style="font-family:sans-serif;font-size:14px;line-height:1.55;white-space:pre-wrap;background:#F4F6FA;padding:14px;border-radius:10px;margin:0">${escape(d.message)}</p>
    `;
    await sendMail({
      to: NOTIFY_INBOX,
      subject: `💡 Nieuw idee: ${d.title}`,
      html,
      text: `Nieuw idee — ${d.title}\n\nVan: ${d.name || 'anoniem'} (${d.email || 'geen e-mail'})\nCategorie: ${d.category || '—'}\n\n${d.message}`,
    }).catch((err) => console.error('idea mail failed:', err));

    return NextResponse.json({ success: true, id: entry.id });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'submit mislukt';
    console.error('idea submit:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
