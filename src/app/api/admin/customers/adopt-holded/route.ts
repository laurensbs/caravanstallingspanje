import { NextRequest, NextResponse } from 'next/server';
import { listAllContacts } from '@/lib/holded';
import {
  getCustomerByHoldedId, getCustomerByEmail, createCustomer, updateCustomer,
  logActivity, getAdminInfo,
} from '@/lib/db';

// POST /api/admin/customers/adopt-holded { holdedContactId }
// → vindt het contact in Holded, maakt of update een lokale customer-rij,
// returnt de definitieve customer (met counts).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const holdedId = String(body.holdedContactId || '').trim();
    if (!holdedId) {
      return NextResponse.json({ error: 'holdedContactId required' }, { status: 400 });
    }
    const admin = getAdminInfo(req);

    // 1. Bestaat de koppeling al? Dan returnen we die direct.
    const existing = await getCustomerByHoldedId(holdedId);
    if (existing) {
      return NextResponse.json({ customer: existing, alreadyLinked: true });
    }

    // 2. Haal contact op uit Holded.
    const all = await listAllContacts();
    const hit = all.find((c) => c.id === holdedId);
    if (!hit) {
      return NextResponse.json({ error: 'Holded contact not found' }, { status: 404 });
    }

    // 3. Email-match: bestaande lokale rij verrijken met Holded-id.
    let customer;
    if (hit.email) {
      const byEmail = await getCustomerByEmail(hit.email);
      if (byEmail) {
        await updateCustomer(byEmail.id, {
          name: byEmail.name || hit.name || '',
          email: hit.email,
          phone: byEmail.phone || hit.phone || null,
          mobile: byEmail.mobile || hit.mobile || null,
          holded_contact_id: hit.id,
        });
        customer = await getCustomerByHoldedId(hit.id);
      }
    }

    // 4. Anders: nieuwe rij aanmaken met alles uit Holded.
    if (!customer) {
      const addr = hit.address;
      customer = await createCustomer({
        name: hit.name || '(unnamed)',
        email: hit.email || null,
        phone: hit.phone || null,
        mobile: hit.mobile || null,
        address: addr?.address || null,
        city: addr?.city || null,
        postal_code: addr?.postalCode || null,
        country: addr?.country || 'ES',
        vat_number: hit.vatnumber || null,
        holded_contact_id: hit.id,
        source: 'holded_import',
      });
    }

    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Holded customer linked from search',
      entityType: 'customer',
      entityId: String(customer!.id),
      entityLabel: customer!.name,
    });
    return NextResponse.json({ customer, alreadyLinked: false });
  } catch (err) {
    console.error('[customers/adopt-holded] error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'adopt failed' }, { status: 500 });
  }
}
