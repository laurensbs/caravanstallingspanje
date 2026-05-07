import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createInspectionCertificate,
  getInspectionCertificateByNumber,
  getCustomerByEmail,
  getCaravansByCustomer,
  createServiceHistoryEntry,
  logActivity,
  sql,
} from '@/lib/db';
import { sendMail } from '@/lib/email';

// Inbound endpoint voor reparatie-paneel: garage-monteur klikt
// "Verstuur certificaat" en stuurt de volledige checklist + banden +
// snapshots naar deze route. Wij persistent het, koppelen aan klant +
// caravan, schrijven een service-historie-regel en mailen de klant.
//
// Auth: Bearer ${INBOUND_SECRET}. Geen rate-limit — interne service.
//
// Idempotency: certificate_number is UNIQUE in DB. Tweede aanroep met
// hetzelfde nummer geeft 200 OK + bestaande row terug zonder dubbel
// te mailen. Voorkomt dubbele mails bij retry door het reparatie-paneel.

const tyreSchema = z.object({
  bar: z.string().nullable().optional(),
  profile: z.string().nullable().optional(),
  dot: z.string().nullable().optional(),
  status: z.enum(['ok', 'attention', 'fail']).default('ok'),
  note: z.string().nullable().optional(),
});

const itemResultSchema = z.object({
  key: z.string().min(1).max(120),
  status: z.enum(['ok', 'attention', 'fail']),
  note: z.string().nullable().optional(),
});

const sectionResultSchema = z.object({
  key: z.string().min(1).max(60),
  items: z.array(itemResultSchema),
});

const payloadSchema = z.object({
  certificateNumber: z.string().regex(/^CSS-\d{8}-\d{4}$/),
  inspectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  technicianName: z.string().min(1).max(200),
  overallResult: z.enum(['goedgekeurd', 'afgekeurd']),
  technicianNotes: z.string().nullable().optional(),
  sections: z.array(sectionResultSchema),
  tyres: z.object({
    left: tyreSchema,
    left_tandem: tyreSchema.optional(),
    right: tyreSchema,
    right_tandem: tyreSchema.optional(),
    reserve: tyreSchema,
  }),
  customer: z.object({
    name: z.string().min(1).max(300),
    email: z.string().email().nullable().optional(),
    address: z.string().nullable().optional(),
    postalCity: z.string().nullable().optional(),
    customerNumber: z.string().nullable().optional(),
  }),
  caravan: z.object({
    brand: z.string().nullable().optional(),
    model: z.string().nullable().optional(),
    registration: z.string().nullable().optional(),
    chassis: z.string().nullable().optional(),
  }),
  repairJobId: z.string().nullable().optional(),
});

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.INBOUND_SECRET;
  if (!secret) {
    console.warn('[inbound/inspection-result] INBOUND_SECRET niet geconfigureerd');
    return false;
  }
  const auth = req.headers.get('authorization') || '';
  return auth === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = payloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', '),
      }, { status: 400 });
    }
    const data = parsed.data;

    // Idempotency-check: zelfde nummer al gezien?
    const existing = await getInspectionCertificateByNumber(data.certificateNumber);
    if (existing) {
      return NextResponse.json({
        ok: true,
        certificate: existing,
        deduped: true,
      });
    }

    // Customer + caravan opzoeken. Email is leidend voor klant-koppeling;
    // kenteken voor caravan-koppeling. Beide optioneel — als 't niet
    // matcht, slaan we het cert nog steeds op (snapshots in body) maar
    // dan zonder customer_id en caravan_id (admin kan handmatig linken).
    let customerId: number | null = null;
    let caravanId: number | null = null;
    if (data.customer.email) {
      const customer = await getCustomerByEmail(data.customer.email);
      if (customer) {
        customerId = customer.id;
        if (data.caravan.registration) {
          const caravans = await getCaravansByCustomer(customer.id);
          const reg = data.caravan.registration.replace(/\s|-/g, '').toLowerCase();
          const match = caravans.find((c) => (c.registration || '').replace(/\s|-/g, '').toLowerCase() === reg);
          if (match) caravanId = match.id;
          else if (caravans.length > 0) caravanId = caravans[0].id; // fallback: 1e caravan
        } else if ((await getCaravansByCustomer(customer.id)).length > 0) {
          caravanId = (await getCaravansByCustomer(customer.id))[0].id;
        }
      }
    }

    const cert = await createInspectionCertificate({
      certificate_number: data.certificateNumber,
      caravan_id: caravanId,
      customer_id: customerId,
      customer_name_snapshot: data.customer.name,
      customer_address_snapshot: data.customer.address || null,
      customer_postal_city_snapshot: data.customer.postalCity || null,
      customer_number_snapshot: data.customer.customerNumber || null,
      caravan_brand_snapshot: data.caravan.brand || null,
      caravan_model_snapshot: data.caravan.model || null,
      caravan_registration_snapshot: data.caravan.registration || null,
      caravan_chassis_snapshot: data.caravan.chassis || null,
      inspection_date: data.inspectionDate,
      technician_name: data.technicianName,
      overall_result: data.overallResult,
      technician_notes: data.technicianNotes || null,
      sections_data: data.sections,
      tyres_data: data.tyres,
      repair_job_id: data.repairJobId || null,
    });

    // Service-historie: één regel per voltooide keuring zodat klant + admin
    // het in /account/caravan en /admin/klanten zien zonder ergens anders
    // heen te navigeren.
    if (caravanId) {
      try {
        // Tel sectie-issues voor description-summary.
        const allItems = data.sections.flatMap((s) => s.items);
        const failCount = allItems.filter((it) => it.status === 'fail').length;
        const attnCount = allItems.filter((it) => it.status === 'attention').length;
        const desc = data.overallResult === 'goedgekeurd'
          ? `Goedgekeurd${attnCount ? ` · ${attnCount} aandachtspunt${attnCount === 1 ? '' : 'en'}` : ''}`
          : `Afgekeurd · ${failCount} reparatie${failCount === 1 ? '' : 's'} nodig${attnCount ? `, ${attnCount} aandachtspunt${attnCount === 1 ? '' : 'en'}` : ''}`;
        await createServiceHistoryEntry({
          caravan_id: caravanId,
          kind: 'inspection',
          title: `Keuring ${data.certificateNumber}`,
          description: desc,
          happened_on: data.inspectionDate,
        });
      } catch (err) {
        console.warn('[inbound/inspection-result] service-history insert failed:', err);
      }
    }

    // Klant mailen — alleen als we een email hebben.
    if (data.customer.email) {
      try {
        const base = process.env.PUBLIC_BASE_URL || new URL(req.url).origin;
        const portalUrl = `${base}/account/caravan?tab=certificates`;
        const passText = data.overallResult === 'goedgekeurd'
          ? 'Goed nieuws — je caravan is goedgekeurd. Het certificaat staat klaar in je portaal.'
          : 'Je keuringsrapport staat klaar in je portaal. Er zijn een of meer punten gevonden die aandacht vragen — bekijk het rapport voor details.';
        const html = `
          <p>Beste ${escapeHtml(data.customer.name)},</p>
          <p>${passText}</p>
          <p style="margin:18px 0">
            <a href="${portalUrl}" style="display:inline-block;background:#F4B942;color:#1F2A36;font-family:sans-serif;font-weight:600;padding:12px 22px;border-radius:8px;text-decoration:none">Bekijk certificaat</a>
          </p>
          <p style="font-size:13px;color:#6B7280">Certificaatnummer: <strong>${data.certificateNumber}</strong><br/>Inspectiedatum: ${data.inspectionDate}</p>
          <p style="font-size:12px;color:#9CA3AF">Heb je geen account-toegang? Antwoord op deze mail dan sturen we je een nieuwe inlog-link.</p>
        `;
        await sendMail({
          to: data.customer.email,
          subject: `Keuringsrapport ${data.certificateNumber} — ${data.overallResult === 'goedgekeurd' ? 'goedgekeurd' : 'rapport beschikbaar'}`,
          html,
          text: `${passText}\n\nCertificaat: ${data.certificateNumber}\nDatum: ${data.inspectionDate}\nPortaal: ${portalUrl}`,
        });
      } catch (err) {
        console.warn('[inbound/inspection-result] customer mail failed:', err);
      }
    }

    // Admin-notify voor afgekeurde keuringen — Laurens wil het direct weten
    // zodat hij contact kan opnemen voor reparatie-offerte.
    if (data.overallResult === 'afgekeurd') {
      try {
        const adminTo = process.env.ADMIN_NOTIFY_EMAIL || 'laurens@caravanstalling-spanje.com';
        await sendMail({
          to: adminTo,
          subject: `⚠ Caravan AFGEKEURD: ${data.customer.name} (${data.certificateNumber})`,
          html: `
            <p>Caravan van <strong>${escapeHtml(data.customer.name)}</strong> is afgekeurd bij keuring.</p>
            <p>Kenteken: ${escapeHtml(data.caravan.registration || '—')}<br/>
               Certificaat: <strong>${data.certificateNumber}</strong><br/>
               Datum: ${data.inspectionDate}<br/>
               Monteur: ${escapeHtml(data.technicianName)}</p>
            ${data.technicianNotes ? `<p><strong>Opmerkingen:</strong> ${escapeHtml(data.technicianNotes)}</p>` : ''}
          `,
          text: `Caravan ${data.customer.name} afgekeurd — cert ${data.certificateNumber}.`,
        });
      } catch (err) {
        console.warn('[inbound/inspection-result] admin mail failed:', err);
      }
    }

    await logActivity({
      action: `Keuringscertificaat ontvangen (${data.overallResult})`,
      entityType: 'inspection_certificate',
      entityId: String(cert.id),
      entityLabel: `${data.certificateNumber} · ${data.customer.name}`,
      details: data.caravan.registration || undefined,
    }).catch(() => {});

    return NextResponse.json({ ok: true, certificate: cert });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[inbound/inspection-result] failed:', msg, err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Suppress unused warning — sql is geïmporteerd voor toekomstige direct-queries
// (search etc) zodat we niet later de import-regel hoeven te wijzigen.
void sql;
