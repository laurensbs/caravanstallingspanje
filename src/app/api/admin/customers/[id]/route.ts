import { NextRequest, NextResponse } from 'next/server';
import { getCustomerById, updateCustomer, getCustomerCounts, logActivity, getAdminInfo } from '@/lib/db';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const customer = await getCustomerById(Number(id));
  if (!customer) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const counts = await getCustomerCounts(customer.id, customer.email);
  return NextResponse.json({ customer: { ...customer, counts } });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const admin = getAdminInfo(req);
  await updateCustomer(Number(id), body);
  await logActivity({
    actor: admin.name, role: admin.role,
    action: 'Klant bijgewerkt',
    entityType: 'customer',
    entityId: id,
  });
  const customer = await getCustomerById(Number(id));
  return NextResponse.json({ customer });
}
