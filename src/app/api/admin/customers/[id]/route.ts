import { NextRequest, NextResponse } from 'next/server';
import {
  getCustomerById, updateCustomer, getCustomerCounts,
  getCustomerWithRelated, softDeleteCustomer, setCustomerHoldedId,
  logActivity, getAdminInfo, sql,
} from '@/lib/db';
import { updateContactInHolded, pushContactToHolded } from '@/lib/holded';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const idNum = Number(id);
  // ?related=true geeft fridges/stalling/transports erbij voor de detail-pagina.
  if (url.searchParams.get('related') === 'true') {
    const data = await getCustomerWithRelated(idNum);
    if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const counts = await getCustomerCounts(data.customer.id, data.customer.email);
    return NextResponse.json({ ...data, counts });
  }
  const customer = await getCustomerById(idNum);
  if (!customer) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const counts = await getCustomerCounts(customer.id, customer.email);
  return NextResponse.json({ customer: { ...customer, counts } });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const idNum = Number(id);
  const body = await req.json();
  const admin = getAdminInfo(req);

  await updateCustomer(idNum, body);

  // Best-effort sync naar Holded: alleen als er een holded_contact_id is.
  // Bij een fout markeren we sync_failed maar laten de lokale update staan.
  const customer = await getCustomerById(idNum);
  if (customer?.holded_contact_id) {
    try {
      await updateContactInHolded(customer.holded_contact_id, {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        mobile: customer.mobile,
        address: customer.address,
        city: customer.city,
        postal_code: customer.postal_code,
        country: customer.country,
        vat_number: customer.vat_number,
      });
      await sql`UPDATE customers SET holded_synced_at = NOW(), holded_sync_failed = false WHERE id = ${idNum}`;
    } catch (err) {
      await sql`UPDATE customers SET holded_sync_failed = true WHERE id = ${idNum}`;
      await logActivity({
        actor: admin.name, role: admin.role,
        action: 'Holded sync failed (customer)',
        entityType: 'customer',
        entityId: id,
        details: err instanceof Error ? err.message : 'unknown',
      });
    }
  }

  await logActivity({
    actor: admin.name, role: admin.role,
    action: 'Customer updated',
    entityType: 'customer',
    entityId: id,
    entityLabel: customer?.name,
  });
  const fresh = await getCustomerById(idNum);
  return NextResponse.json({ customer: fresh });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const idNum = Number(id);
  const admin = getAdminInfo(req);
  const customer = await getCustomerById(idNum);
  if (!customer) return NextResponse.json({ error: 'not found' }, { status: 404 });
  await softDeleteCustomer(idNum);
  await logActivity({
    actor: admin.name, role: admin.role,
    action: 'Customer deleted (soft)',
    entityType: 'customer',
    entityId: id,
    entityLabel: customer.name,
  });
  return NextResponse.json({ success: true });
}

// POST = "Sync nu naar Holded" voor één customer.
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const idNum = Number(id);
  const url = new URL(req.url);
  if (url.searchParams.get('action') !== 'sync-holded') {
    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  }
  const admin = getAdminInfo(req);
  const customer = await getCustomerById(idNum);
  if (!customer) return NextResponse.json({ error: 'not found' }, { status: 404 });

  try {
    if (customer.holded_contact_id) {
      await updateContactInHolded(customer.holded_contact_id, {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        mobile: customer.mobile,
        address: customer.address,
        city: customer.city,
        postal_code: customer.postal_code,
        country: customer.country,
        vat_number: customer.vat_number,
      });
      await sql`UPDATE customers SET holded_synced_at = NOW(), holded_sync_failed = false WHERE id = ${idNum}`;
    } else {
      const newId = await pushContactToHolded({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        mobile: customer.mobile,
        address: customer.address,
        city: customer.city,
        postal_code: customer.postal_code,
        country: customer.country,
        vat_number: customer.vat_number,
      });
      await setCustomerHoldedId(idNum, newId, false);
      await sql`UPDATE customers SET holded_synced_at = NOW() WHERE id = ${idNum}`;
    }
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Customer synced with Holded',
      entityType: 'customer',
      entityId: id,
      entityLabel: customer.name,
    });
    const fresh = await getCustomerById(idNum);
    return NextResponse.json({ customer: fresh });
  } catch (err) {
    await sql`UPDATE customers SET holded_sync_failed = true WHERE id = ${idNum}`;
    return NextResponse.json({ error: err instanceof Error ? err.message : 'sync failed' }, { status: 502 });
  }
}
