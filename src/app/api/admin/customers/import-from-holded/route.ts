import { NextRequest, NextResponse } from 'next/server';
import { listContactsPaginated, type HoldedContact } from '@/lib/holded';
import {
  getCustomerByEmail, getCustomerByHoldedId, createCustomer, updateCustomer,
  setCustomerHoldedSnapshot, logActivity, getAdminInfo,
} from '@/lib/db';

export const maxDuration = 60;

// Paginated import. Per klant: lookup → update of insert → snapshot.
// Snapshots draaien parallel binnen één page om de DB-latency te verbergen.
// pageSize=25 default zodat we ruim binnen 60s blijven; UI pagineert tot
// hasMore=false.
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
    const pageSize = Math.min(100, Math.max(10, Number(body.pageSize ?? url.searchParams.get('pageSize') ?? 25)));

    const contacts: HoldedContact[] = await listContactsPaginated(page, pageSize);

    // Stap 1 — sequentiële update/insert (Neon mag geen 25 inserts parallel
    // op dezelfde unique-index doen zonder race-conflicten).
    const idByHolded = new Map<string, number>();
    for (const c of contacts) {
      if (!c.id || !c.name) { skipped++; continue; }
      try {
        let existing = await getCustomerByHoldedId(c.id);
        if (!existing && c.email) existing = await getCustomerByEmail(c.email);

        const addr = c.address;
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
          idByHolded.set(c.id, existing.id);
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
          if (created?.id) idByHolded.set(c.id, created.id);
          imported++;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown';
        errors.push({ email: c.email, reason: msg });
        skipped++;
      }
    }

    // Stap 2 — snapshots parallel; race is hier oké want elke UPDATE
    // raakt een andere customer-id.
    await Promise.all(
      contacts.map((c) => {
        const id = c.id ? idByHolded.get(c.id) : undefined;
        if (!id) return Promise.resolve();
        return setCustomerHoldedSnapshot(id, c as unknown as Record<string, unknown>).catch(() => {});
      }),
    );

    await logActivity({
      actor: admin.name, role: admin.role,
      action: `Holded import page ${page}`,
      entityType: 'customer',
      details: `imported=${imported} updated=${updated} skipped=${skipped} processed=${contacts.length}`,
    });

    const hasMore = contacts.length === pageSize;
    return NextResponse.json({
      page, pageSize,
      processed: contacts.length,
      imported, updated, skipped,
      hasMore,
      nextPage: hasMore ? page + 1 : null,
      errors: errors.slice(0, 20),
    });
  } catch (err) {
    console.error('holded import error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'import failed' }, { status: 500 });
  }
}
