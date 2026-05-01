import { NextRequest, NextResponse } from 'next/server';
import { getCustomerById, setCustomerHoldedSnapshot, logActivity, getAdminInfo } from '@/lib/db';
import { findContactByEmail, listContactsPaginated, getContactById, type HoldedContact } from '@/lib/holded';

// Live-fetch de Holded-contact voor 1 customer en bewaar de complete payload
// in customers.holded_raw + losse kolommen. Werkt zowel via holded_contact_id
// als via email-fallback. Idempotent — kun je rustig opnieuw triggeren.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid customer id' }, { status: 400 });
    }
    const customer = await getCustomerById(id);
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    let contact: HoldedContact | null = null;

    if (customer.holded_contact_id) {
      // Direct ophalen via id geeft de meeste detail (custom fields incl).
      contact = await getContactById(customer.holded_contact_id);
    }
    if (!contact && customer.email) {
      contact = await findContactByEmail(customer.email);
    }
    // Laatste fallback — scan eerste pagina op naam-match.
    if (!contact && customer.name) {
      try {
        const batch = await listContactsPaginated(1, 200);
        const norm = (s: string) => s.toLowerCase().trim();
        contact = batch.find(c => c.name && norm(c.name) === norm(customer.name)) || null;
      } catch { /* ignore */ }
    }

    if (!contact) {
      return NextResponse.json({ error: 'No matching Holded contact found' }, { status: 404 });
    }

    await setCustomerHoldedSnapshot(id, contact as unknown as Record<string, unknown>);

    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Refreshed Holded snapshot',
      entityType: 'customer',
      entityId: String(id),
      entityLabel: customer.name,
    });

    return NextResponse.json({ ok: true, holded: contact });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[holded-snapshot] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
