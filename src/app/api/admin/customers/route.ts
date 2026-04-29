import { NextRequest, NextResponse } from 'next/server';
import {
  listCustomers, createCustomer, getCustomerByEmail, setCustomerHoldedId,
  getCustomerCounts, logActivity, getAdminInfo,
} from '@/lib/db';
import { findContactByEmail, findContactByPhone, pushContactToHolded } from '@/lib/holded';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') || '1');
  const search = url.searchParams.get('search') || undefined;
  try {
    const result = await listCustomers({ page, pageSize: 50, search });
    // Counts er bij — alleen voor de eerste pagina nodig.
    const enriched = await Promise.all(result.customers.map(async (c) => {
      const counts = await getCustomerCounts(c.id, c.email);
      return { ...c, counts };
    }));
    return NextResponse.json({ ...result, customers: enriched });
  } catch (err) {
    console.error('customers GET error:', err);
    return NextResponse.json({ error: 'list failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const admin = getAdminInfo(req);
    const name = String(body.name || '').trim();
    if (!name) return NextResponse.json({ error: 'naam is verplicht' }, { status: 400 });

    const email = body.email ? String(body.email).trim() : null;
    const phone = body.phone ? String(body.phone).trim() : null;

    // Bestaat al lokaal?
    if (email) {
      const existing = await getCustomerByEmail(email);
      if (existing) {
        return NextResponse.json({ customer: existing, alreadyExisted: true });
      }
    }

    // Probeer Holded match (op email, dan phone) zodat we niet dubbel pushen.
    let holdedId: string | null = null;
    let holdedSyncFailed = false;
    let holdedSyncError: string | null = null;
    let holdedSource: 'matched-email' | 'matched-phone' | 'created' | 'failed' | 'no-key' = 'failed';
    try {
      if (email) {
        const match = await findContactByEmail(email);
        if (match) { holdedId = match.id; holdedSource = 'matched-email'; }
      }
      if (!holdedId && phone) {
        const match = await findContactByPhone(phone);
        if (match) { holdedId = match.id; holdedSource = 'matched-phone'; }
      }
      if (!holdedId) {
        holdedId = await pushContactToHolded({
          name,
          email,
          phone,
          mobile: body.mobile || null,
          address: body.address || null,
          city: body.city || null,
          postal_code: body.postal_code || null,
          country: body.country || 'ES',
          vat_number: body.vat_number || null,
        });
        holdedSource = 'created';
      }
    } catch (err) {
      console.error('[customers POST] holded push failed:', err);
      holdedSyncFailed = true;
      holdedSyncError = err instanceof Error ? err.message : 'unknown';
      holdedSource = holdedSyncError.includes('HOLDED_API_KEY') ? 'no-key' : 'failed';
      await logActivity({
        actor: admin.name, role: admin.role,
        action: 'Holded sync mislukt (klant-aanmaak)',
        entityType: 'customer',
        entityLabel: name,
        details: holdedSyncError,
      }).catch(() => {});
    }

    const customer = await createCustomer({
      name,
      email,
      phone,
      mobile: body.mobile || null,
      address: body.address || null,
      city: body.city || null,
      postal_code: body.postal_code || null,
      country: body.country || 'ES',
      vat_number: body.vat_number || null,
      notes: body.notes || null,
      holded_contact_id: holdedId,
      holded_sync_failed: holdedSyncFailed,
      source: 'manual',
    });

    void setCustomerHoldedId; // toekomstige sync flow

    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Klant aangemaakt',
      entityType: 'customer',
      entityId: String(customer.id),
      entityLabel: name,
    });
    return NextResponse.json({
      customer,
      alreadyExisted: false,
      holdedSource,
      holdedSyncError,
    });
  } catch (err) {
    console.error('customer create error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'create failed' }, { status: 500 });
  }
}
