import { NextRequest, NextResponse } from 'next/server';
import { getAllInvoices, createInvoice } from '@/lib/db';
import { validateBody, invoiceSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status') || undefined;
    const result = await getAllInvoices(page, limit, status);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Invoices GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(invoiceSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const invoice = await createInvoice(validated.data);
    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error('Invoice POST error:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
