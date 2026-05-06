import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPurchaseIntake, logActivity } from '@/lib/db';
import { sendMail } from '@/lib/email';
import { formatRef } from '@/lib/refs';

const schema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email(),
  phone: z.string().min(5).max(40).optional().or(z.literal('')),
  kind: z.enum(['caravan', 'camper']).default('caravan'),
  brand: z.string().max(150).optional().or(z.literal('')),
  model: z.string().max(200).optional().or(z.literal('')),
  year: z.number().int().min(1950).max(2100).optional().nullable(),
  registration: z.string().max(40).optional().or(z.literal('')),
  km: z.number().int().min(0).max(2_000_000).optional().nullable(),
  condition_note: z.string().max(3000).optional().or(z.literal('')),
  asking_price_eur: z.number().min(0).max(1_000_000).optional().nullable(),
  photos: z.array(z.object({
    url: z.string().url(),
    webUrl: z.string().url().optional(),
    fileName: z.string().max(200),
    sizeKb: z.number().int().nonnegative().optional(),
  })).max(8).optional(),
});

const ADMIN_INBOX = 'laurens@caravanstalling-spanje.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(', ') }, { status: 400 });
    }
    const d = parsed.data;

    const entry = await createPurchaseIntake({
      name: d.name,
      email: d.email,
      phone: d.phone || null,
      kind: d.kind,
      brand: d.brand || null,
      model: d.model || null,
      year: d.year ?? null,
      registration: d.registration || null,
      km: d.km ?? null,
      condition_note: d.condition_note || null,
      asking_price_eur: d.asking_price_eur ?? null,
      photos: d.photos || [],
    });
    const ref = formatRef('inkoop', entry.id);

    await logActivity({
      action: 'Inkoop-aanvraag ontvangen',
      entityType: 'purchase_intake',
      entityId: String(entry.id),
      entityLabel: `${d.name} — ${d.brand || ''} ${d.model || ''}`.trim(),
      details: `${(d.photos || []).length} foto('s)`,
    });

    // Notify admin
    const photoLines = (d.photos || []).map((p, i) => `<li><a href="${p.url}">${p.fileName}</a></li>`).join('');
    const html = `
      <h2 style="font-family:sans-serif;color:#0A1929">Nieuwe inkoop-aanvraag</h2>
      <table style="font-family:sans-serif;font-size:14px">
        <tr><td>Naam</td><td><strong>${d.name}</strong></td></tr>
        <tr><td>E-mail</td><td>${d.email}</td></tr>
        ${d.phone ? `<tr><td>Telefoon</td><td>${d.phone}</td></tr>` : ''}
        <tr><td>Type</td><td>${d.kind}</td></tr>
        ${d.brand || d.model ? `<tr><td>Caravan/camper</td><td>${[d.brand, d.model].filter(Boolean).join(' ')}</td></tr>` : ''}
        ${d.year ? `<tr><td>Bouwjaar</td><td>${d.year}</td></tr>` : ''}
        ${d.km !== null && d.km !== undefined ? `<tr><td>KM</td><td>${d.km}</td></tr>` : ''}
        ${d.registration ? `<tr><td>Kenteken</td><td>${d.registration}</td></tr>` : ''}
        ${d.asking_price_eur ? `<tr><td>Vraagprijs</td><td>€${d.asking_price_eur}</td></tr>` : ''}
      </table>
      ${d.condition_note ? `<p style="font-family:sans-serif">${d.condition_note.replace(/\n/g, '<br>')}</p>` : ''}
      ${photoLines ? `<p style="font-family:sans-serif"><strong>Foto's:</strong></p><ul style="font-family:sans-serif">${photoLines}</ul>` : ''}
      <p style="font-family:sans-serif;font-size:12px;color:#888">Ref: ${ref}</p>
    `;
    sendMail({ to: ADMIN_INBOX, subject: `🔄 Inkoop-aanvraag: ${d.name}`, html, text: `Inkoop ${d.name} (${d.email})` })
      .catch((err) => console.error('purchase admin notify failed:', err));

    // Confirm to klant
    sendMail({
      to: d.email,
      subject: 'Inkoop-aanvraag ontvangen',
      html: `<p>Hoi ${d.name},</p><p>We hebben je aanvraag ontvangen en bekijken de foto's. Binnen 48 uur sturen we een indicatief bod.</p><p>Referentie: <strong>${ref}</strong></p>`,
      text: `Inkoop-aanvraag ontvangen, ref ${ref}`,
    }).catch((err) => console.error('purchase ack mail failed:', err));

    return NextResponse.json({ success: true, ref });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Aanvraag mislukt';
    console.error('purchase order error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
