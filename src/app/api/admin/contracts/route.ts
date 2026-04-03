import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { createContract, logActivity, getAdminInfo } from '@/lib/db';
import { validateBody, contractSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const rawSql = neon(process.env.DATABASE_URL!);
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(500, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
    const offset = (page - 1) * limit;
    const status = url.searchParams.get('status') || '';
    const search = url.searchParams.get('search') || '';
    const sort = url.searchParams.get('sort') || 'created_at';
    const order = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let idx = 1;

    if (status) { conditions.push(`c.status = $${idx++}`); params.push(status); }
    if (search) { conditions.push(`(cu.first_name || ' ' || cu.last_name ILIKE $${idx} OR c.contract_number ILIKE $${idx} OR ca.license_plate ILIKE $${idx})`); params.push(`%${search}%`); idx++; }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortColumns: Record<string, string> = { created_at: 'c.created_at', start_date: 'c.start_date', end_date: 'c.end_date', monthly_rate: 'c.monthly_rate', customer_name: 'cu.last_name', status: 'c.status' };
    const sortCol = sortColumns[sort] || 'c.created_at';

    const rows = await rawSql(
      `SELECT c.*, cu.first_name || ' ' || cu.last_name as customer_name, ca.brand || ' ' || ca.model as caravan_name, ca.license_plate, l.name as location_name FROM contracts c LEFT JOIN customers cu ON c.customer_id = cu.id LEFT JOIN caravans ca ON c.caravan_id = ca.id LEFT JOIN locations l ON c.location_id = l.id ${where} ORDER BY ${sortCol} ${order} LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset]
    );
    const cnt = await rawSql(
      `SELECT COUNT(*) as total FROM contracts c LEFT JOIN customers cu ON c.customer_id = cu.id LEFT JOIN caravans ca ON c.caravan_id = ca.id ${where}`,
      params
    );
    return NextResponse.json({ contracts: rows, total: Number(cnt[0].total), page, limit });
  } catch (error) {
    console.error('Contracts GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(contractSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const contract = await createContract(validated.data);
    const admin = getAdminInfo(req);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Contract aangemaakt', entityType: 'contract', entityId: String(contract.id || contract.contract_number), entityLabel: contract.contract_number });
    return NextResponse.json({ contract }, { status: 201 });
  } catch (error) {
    console.error('Contract POST error:', error);
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
  }
}
