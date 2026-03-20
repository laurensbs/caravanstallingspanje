import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { createInvoice } from '@/lib/db';
import { validateBody, invoiceSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const rawSql = neon(process.env.DATABASE_URL!);
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(500, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
    const offset = (page - 1) * limit;
    const status = url.searchParams.get('status') || '';
    const search = url.searchParams.get('search') || '';
    const dateFrom = url.searchParams.get('dateFrom') || '';
    const dateTo = url.searchParams.get('dateTo') || '';
    const sort = url.searchParams.get('sort') || 'created_at';
    const order = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let idx = 1;

    if (status) { conditions.push(`i.status = $${idx++}`); params.push(status); }
    if (search) { conditions.push(`(cu.first_name || ' ' || cu.last_name ILIKE $${idx} OR i.invoice_number ILIKE $${idx} OR i.description ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    if (dateFrom) { conditions.push(`i.due_date >= $${idx++}::date`); params.push(dateFrom); }
    if (dateTo) { conditions.push(`i.due_date <= $${idx++}::date`); params.push(dateTo); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortColumns: Record<string, string> = { created_at: 'i.created_at', due_date: 'i.due_date', total: 'i.total', customer_name: 'cu.last_name', status: 'i.status' };
    const sortCol = sortColumns[sort] || 'i.created_at';

    const rows = await rawSql(
      `SELECT i.*, cu.first_name || ' ' || cu.last_name as customer_name, cu.email as customer_email FROM invoices i LEFT JOIN customers cu ON i.customer_id = cu.id ${where} ORDER BY ${sortCol} ${order} LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset]
    );
    const cnt = await rawSql(
      `SELECT COUNT(*) as total FROM invoices i LEFT JOIN customers cu ON i.customer_id = cu.id ${where}`,
      params
    );
    return NextResponse.json({ invoices: rows, total: Number(cnt[0].total) });
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
