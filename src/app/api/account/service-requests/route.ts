import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyCustomerToken } from '@/lib/auth';
import {
  getCustomerByEmail, getCaravansByCustomer,
  listServiceRequestsByCustomer, createServiceRequest, logActivity,
} from '@/lib/db';
import { sendMail, serviceRequestNotifyHtml } from '@/lib/email';

const ADMIN_NOTIFY_TO = process.env.ADMIN_NOTIFY_EMAIL || 'laurens@caravanstalling-spanje.com';

const KINDS = ['cleaning', 'service', 'inspection', 'repair', 'transport', 'other'] as const;

const schema = z.object({
  kind: z.enum(KINDS),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// Klant-portaal: lijst eigen service-aanvragen + aanmaken nieuwe.
export async function GET(req: NextRequest) {
  const token = req.cookies.get('customer_token')?.value;
  const session = token ? await verifyCustomerToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const customer = await getCustomerByEmail(session.email);
  if (!customer) return NextResponse.json({ error: 'Account niet gevonden.' }, { status: 404 });

  const items = await listServiceRequestsByCustomer(customer.id);
  return NextResponse.json({
    items: items.map((r) => ({
      id: r.id,
      kind: r.kind,
      title: r.title,
      description: r.description,
      preferredDate: r.preferred_date,
      status: r.status,
      adminNote: r.admin_note,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
  });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('customer_token')?.value;
  const session = token ? await verifyCustomerToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const customer = await getCustomerByEmail(session.email);
  if (!customer) return NextResponse.json({ error: 'Account niet gevonden.' }, { status: 404 });

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(', ') }, { status: 400 });
    }
    const caravans = await getCaravansByCustomer(customer.id);
    const caravanId = caravans[0]?.id ?? null;

    const entry = await createServiceRequest({
      customer_id: customer.id,
      caravan_id: caravanId,
      kind: parsed.data.kind,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      preferred_date: parsed.data.preferredDate ?? null,
    });
    await logActivity({
      action: `Klant-service-aanvraag: ${parsed.data.title}`,
      entityType: 'customer_service_request',
      entityId: String(entry.id),
      entityLabel: customer.name || customer.email || `customer-${customer.id}`,
    });

    // Admin-notify mail: best-effort, fail-soft. Klant ziet z'n aanvraag al
    // in z'n portaal staan, dus mail is alleen voor jou (Laurens).
    try {
      const base = process.env.PUBLIC_BASE_URL || new URL(req.url).origin;
      const mail = serviceRequestNotifyHtml({
        customerName: customer.name || 'klant',
        customerEmail: customer.email,
        customerPhone: customer.phone,
        kind: parsed.data.kind,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        preferredDate: parsed.data.preferredDate ?? null,
        adminUrl: `${base}/admin/service-requests`,
      });
      await sendMail({ to: ADMIN_NOTIFY_TO, subject: mail.subject, html: mail.html, text: mail.text });
    } catch (err) {
      console.warn('[service-request] admin notify mail failed:', err);
    }

    return NextResponse.json({
      item: {
        id: entry.id,
        kind: entry.kind,
        title: entry.title,
        description: entry.description,
        preferredDate: entry.preferred_date,
        status: entry.status,
        adminNote: entry.admin_note,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
