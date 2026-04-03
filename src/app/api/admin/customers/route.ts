import { NextRequest, NextResponse } from 'next/server';
import { getAllCustomers, createCustomer, sql, logActivity, getAdminInfo } from '@/lib/db';
import { validateBody, customerSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search') || '';
    const result = await getAllCustomers(page, limit, search);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Customers GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(customerSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const customer = await createCustomer(validated.data);
    const admin = getAdminInfo(req);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Klant aangemaakt', entityType: 'customer', entityId: String(customer.id), entityLabel: `${validated.data.first_name} ${validated.data.last_name}` });
    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error('Customer POST error:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
