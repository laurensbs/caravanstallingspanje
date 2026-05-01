import { NextRequest, NextResponse } from 'next/server';
import { sql, getCustomerByEmail, getCustomerByHoldedId, linkFridgeToCustomer, linkStallingToCustomer, linkTransportToCustomer, setFridgeHoldedContact, logActivity, getAdminInfo } from '@/lib/db';

export const maxDuration = 60;

// Loop alle ongekoppelde fridges / stalling_requests / transport_requests
// langs en zoek een match in de customers-tabel op:
//   1. holded_contact_id (snelste, exact)
//   2. lower(email)
// Idempotent: rijen die al een customer_id hebben worden overgeslagen.
// Vult ook fridges.holded_contact_id bij als de gevonden customer er een heeft.
export async function POST(req: NextRequest) {
  const admin = getAdminInfo(req);
  type Result = { fridges: number; stalling: number; transport: number; skipped: number };
  const out: Result = { fridges: 0, stalling: 0, transport: 0, skipped: 0 };

  try {
    // ── Fridges ──
    const fridges = await sql`
      SELECT id, name, email, holded_contact_id
      FROM fridges
      WHERE customer_id IS NULL`;
    for (const f of fridges as Array<{ id: number; name: string; email: string | null; holded_contact_id: string | null }>) {
      let cust = f.holded_contact_id ? await getCustomerByHoldedId(f.holded_contact_id) : null;
      if (!cust && f.email) cust = await getCustomerByEmail(f.email);
      if (!cust) { out.skipped++; continue; }
      await linkFridgeToCustomer(f.id, cust.id);
      // Vul ook holded_contact_id op de fridge als die er nog niet was —
      // dan werkt /admin/koelkasten z'n "Gekoppeld aan Holded"-icoon óók.
      if (!f.holded_contact_id && cust.holded_contact_id) {
        await setFridgeHoldedContact(f.id, cust.holded_contact_id).catch(() => {});
      }
      out.fridges++;
    }

    // ── Stalling-aanvragen ──
    const stallings = await sql`
      SELECT id, email, name
      FROM stalling_requests
      WHERE customer_id IS NULL`;
    for (const s of stallings as Array<{ id: number; email: string | null; name: string }>) {
      if (!s.email) { out.skipped++; continue; }
      const cust = await getCustomerByEmail(s.email);
      if (!cust) { out.skipped++; continue; }
      await linkStallingToCustomer(s.id, cust.id);
      out.stalling++;
    }

    // ── Transport-aanvragen ──
    const transports = await sql`
      SELECT id, email, name
      FROM transport_requests
      WHERE customer_id IS NULL`;
    for (const t of transports as Array<{ id: number; email: string | null; name: string }>) {
      if (!t.email) { out.skipped++; continue; }
      const cust = await getCustomerByEmail(t.email);
      if (!cust) { out.skipped++; continue; }
      await linkTransportToCustomer(t.id, cust.id);
      out.transport++;
    }

    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Auto-link customers',
      entityType: 'customer',
      details: `fridges=${out.fridges} stalling=${out.stalling} transport=${out.transport} skipped=${out.skipped}`,
    });

    return NextResponse.json({ ok: true, ...out });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[auto-link] error:', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
