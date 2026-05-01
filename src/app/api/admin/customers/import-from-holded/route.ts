import { NextRequest, NextResponse } from 'next/server';
import { listContactsPaginated, type HoldedContact } from '@/lib/holded';
import {
  bulkUpsertCustomersFromHolded, bulkUpdateCustomerHoldedSnapshots,
  logActivity, getAdminInfo,
} from '@/lib/db';

export const maxDuration = 60;

// Paginated bulk-import. Per page in TWEE batched stappen:
//   1) bulkUpsertCustomersFromHolded — 1 CTE-query per klant ipv 4 round-trips.
//   2) bulkUpdateCustomerHoldedSnapshots — Promise.all parallel snapshot-write.
// Met pageSize=25 is dat doorgaans <5s per page, veilig binnen 60s timeout.
// UI roept herhaaldelijk aan met nextPage tot hasMore=false.
export async function POST(req: NextRequest) {
  const admin = getAdminInfo(req);

  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const page = Math.max(1, Number(body.page ?? url.searchParams.get('page') ?? 1));
    const pageSize = Math.min(100, Math.max(10, Number(body.pageSize ?? url.searchParams.get('pageSize') ?? 25)));

    const contacts: HoldedContact[] = await listContactsPaginated(page, pageSize);
    const valid = contacts.filter(c => c.id && c.name);
    const skipped = contacts.length - valid.length;

    // Bulk upsert
    const upserts = await bulkUpsertCustomersFromHolded(
      valid.map(c => ({
        holded_id: c.id,
        name: c.name as string,
        email: c.email || null,
        phone: c.phone || null,
        mobile: c.mobile || null,
        address: c.address?.address || null,
        city: c.address?.city || null,
        postal_code: c.address?.postalCode || null,
        country: c.address?.country || null,
        vat_number: c.vatnumber || null,
      })),
    );
    const imported = upserts.filter(r => r.was_new).length;
    const updated = upserts.filter(r => !r.was_new).length;

    // Bulk snapshot — Promise.all over alle items van deze page.
    const idByHoldedId = new Map(upserts.map(r => [r.holded_id, r.id]));
    await bulkUpdateCustomerHoldedSnapshots(
      valid
        .map(c => {
          const id = idByHoldedId.get(c.id);
          return id ? { id, raw: c as unknown as Record<string, unknown> } : null;
        })
        .filter((r): r is { id: number; raw: Record<string, unknown> } => r !== null),
    );

    await logActivity({
      actor: admin.name, role: admin.role,
      action: `Holded import page ${page}`,
      entityType: 'customer',
      details: `imported=${imported} updated=${updated} skipped=${skipped} processed=${contacts.length}`,
    });

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
    });
  } catch (err) {
    console.error('holded import error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'import failed' }, { status: 500 });
  }
}
