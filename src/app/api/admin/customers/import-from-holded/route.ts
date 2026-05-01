import { NextRequest, NextResponse } from 'next/server';
import { listContactsPaginated, type HoldedContact } from '@/lib/holded';
import {
  getCustomerByEmail, getCustomerByHoldedId, createCustomer, updateCustomer,
  logActivity, getAdminInfo, setCustomerHoldedSnapshot,
} from '@/lib/db';

export const maxDuration = 60;

// Paginated import — veilig om te hervatten als 504 erbij komt.
//
// POST body / query: { page?: number, pageSize?: number }
//   page    = 1-based (default 1)
//   pageSize= max 200 (Holded API), default 100. Lager = veiliger qua timeout.
//
// Returnt { page, pageSize, processed, imported, updated, skipped, hasMore, errors }.
// Zodra hasMore=true moet de UI de volgende page opvragen.
export async function POST(req: NextRequest) {
  const admin = getAdminInfo(req);
  let imported = 0;
  let updated = 0;
  let skipped = 0;
  const errors: { email: string | undefined; reason: string }[] = [];

  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const page = Math.max(1, Number(body.page ?? url.searchParams.get('page') ?? 1));
    const pageSize = Math.min(200, Math.max(20, Number(body.pageSize ?? url.searchParams.get('pageSize') ?? 100)));

    const contacts: HoldedContact[] = await listContactsPaginated(page, pageSize);

    for (const c of contacts) {
      if (!c.id || !c.name) { skipped++; continue; }

      const addr = c.address;
      try {
        let customerId: number | null = null;
        // 1. Match op holded_contact_id (snelste pad).
        let existing = await getCustomerByHoldedId(c.id);
        // 2. Anders match op email.
        if (!existing && c.email) {
          existing = await getCustomerByEmail(c.email);
        }

        if (existing) {
          await updateCustomer(existing.id, {
            name: c.name,
            email: c.email || null,
            phone: c.phone || null,
            mobile: c.mobile || null,
            address: addr?.address || null,
            city: addr?.city || null,
            postal_code: addr?.postalCode || null,
            country: addr?.country || null,
            vat_number: c.vatnumber || null,
            holded_contact_id: c.id,
          });
          customerId = existing.id;
          updated++;
        } else {
          const created = await createCustomer({
            name: c.name,
            email: c.email || null,
            phone: c.phone || null,
            mobile: c.mobile || null,
            address: addr?.address || null,
            city: addr?.city || null,
            postal_code: addr?.postalCode || null,
            country: addr?.country || 'ES',
            vat_number: c.vatnumber || null,
            holded_contact_id: c.id,
            source: 'holded_import',
          });
          customerId = (created as { id?: number })?.id ?? null;
          imported++;
        }

        // Bewaar de complete Holded-snapshot incl. is_company afleiding.
        if (customerId) {
          await setCustomerHoldedSnapshot(customerId, c as unknown as Record<string, unknown>).catch(() => {});
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown';
        errors.push({ email: c.email, reason: msg });
        skipped++;
      }
    }

    await logActivity({
      actor: admin.name, role: admin.role,
      action: `Holded import page ${page}`,
      entityType: 'customer',
      details: `imported=${imported} updated=${updated} skipped=${skipped} processed=${contacts.length}`,
    });

    // hasMore: als de Holded-page vol terugkwam (= pageSize), is er waarschijnlijk
    // een volgende page. Iets minder dan pageSize ⇒ klaar.
    const hasMore = contacts.length === pageSize;

    return NextResponse.json({
      page,
      pageSize,
      processed: contacts.length,
      imported,
      updated,
      skipped,
      hasMore,
      nextPage: hasMore ? page + 1 : null,
      errors: errors.slice(0, 20),
    });
  } catch (err) {
    console.error('holded import error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'import failed' }, { status: 500 });
  }
}
