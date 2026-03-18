import { NextRequest, NextResponse } from 'next/server';
import { getAllCustomers, createCustomer, sql } from '@/lib/db';
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
    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error('Customer POST error:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
