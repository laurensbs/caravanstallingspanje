import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyCustomerToken } from '@/lib/auth';
import {
  getCustomerByEmail, getCaravansByCustomer, createCaravanPhoto, logActivity,
} from '@/lib/db';

const schema = z.object({
  url: z.string().url(),
  webUrl: z.string().url().optional(),
  fileName: z.string().max(200).optional(),
  sizeKb: z.number().int().nonnegative().optional(),
  caption: z.string().max(300).optional(),
});

// Klant uploadt foto's vanuit /account/caravan "Foto's"-tab.
// Foto wordt eerst geüpload via /api/uploads (OneDrive), dan stuurt
// de client de URLs hierheen om aan caravan-record te koppelen.
export async function POST(req: NextRequest) {
  const token = req.cookies.get('customer_token')?.value;
  const session = token ? await verifyCustomerToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const customer = await getCustomerByEmail(session.email);
  if (!customer) return NextResponse.json({ error: 'Account niet gevonden.' }, { status: 404 });

  const caravans = await getCaravansByCustomer(customer.id);
  if (caravans.length === 0) {
    return NextResponse.json({ error: 'Nog geen caravan gekoppeld aan dit account.' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(', ') }, { status: 400 });
    }
    const photo = await createCaravanPhoto({
      caravan_id: caravans[0].id,
      url: parsed.data.url,
      web_url: parsed.data.webUrl || null,
      file_name: parsed.data.fileName || null,
      size_kb: parsed.data.sizeKb ?? null,
      caption: parsed.data.caption || null,
      uploaded_by: 'customer',
    });
    await logActivity({
      action: 'Klant-foto toegevoegd aan caravan',
      entityType: 'caravan_photo',
      entityId: String(photo.id),
      entityLabel: customer.name || customer.email || `customer-${customer.id}`,
    });
    return NextResponse.json({
      photo: {
        id: photo.id,
        url: photo.url,
        webUrl: photo.web_url,
        fileName: photo.file_name,
        sizeKb: photo.size_kb,
        caption: photo.caption,
        uploadedBy: photo.uploaded_by,
        createdAt: photo.created_at,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
