import { NextRequest, NextResponse } from 'next/server';
import { getCustomerById, getActivityForCustomer } from '@/lib/db';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const customer = await getCustomerById(Number(id));
  if (!customer) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const events = await getActivityForCustomer(customer.id, customer.email, 30);
  return NextResponse.json({ events });
}
