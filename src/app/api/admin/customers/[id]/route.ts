import { NextRequest, NextResponse } from 'next/server';
import { sql, getCaravansByCustomer, getContractsByCustomer, getInvoicesByCustomer } from '@/lib/db';
import { validateBody, customerSchema } from '@/lib/validations';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await sql`SELECT * FROM customers WHERE id = ${id}`;
    if (result.length === 0) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    
    const url = new URL(req.url);
    if (url.searchParams.get('full') === 'true') {
      const customerId = Number(id);
      const [caravans, contracts, invoices, messages, serviceRequests] = await Promise.all([
        getCaravansByCustomer(customerId),
        getContractsByCustomer(customerId),
        getInvoicesByCustomer(customerId),
        sql`SELECT * FROM contact_messages WHERE email = ${result[0].email} ORDER BY created_at DESC LIMIT 20`,
        sql`SELECT * FROM service_requests WHERE customer_id = ${customerId} ORDER BY created_at DESC LIMIT 20`,
      ]);
      return NextResponse.json({ customer: result[0], caravans, contracts, invoices, messages, serviceRequests });
    }

    return NextResponse.json({ customer: result[0] });
  } catch (error) {
    console.error('Customer GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = validateBody(customerSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;
    await sql`UPDATE customers SET first_name = ${data.first_name}, last_name = ${data.last_name}, email = ${data.email}, phone = ${data.phone || null}, address = ${data.address || null}, city = ${data.city || null}, postal_code = ${data.postal_code || null}, country = ${data.country || 'NL'}, company_name = ${data.company_name || null}, notes = ${data.notes || null}, updated_at = NOW() WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Customer PUT error:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM customers WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Customer DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
