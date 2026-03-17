import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status') || undefined;
    const offset = (page - 1) * limit;
    let requests, countResult;
    if (status) {
      requests = await sql`SELECT sr.*, c.brand as caravan_brand, c.model as caravan_model, c.license_plate as caravan_license_plate, cu.first_name || ' ' || cu.last_name as customer_name FROM service_requests sr LEFT JOIN caravans c ON sr.caravan_id = c.id LEFT JOIN customers cu ON sr.customer_id = cu.id WHERE sr.status = ${status} ORDER BY sr.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      countResult = await sql`SELECT COUNT(*) as count FROM service_requests WHERE status = ${status}`;
    } else {
      requests = await sql`SELECT sr.*, c.brand as caravan_brand, c.model as caravan_model, c.license_plate as caravan_license_plate, cu.first_name || ' ' || cu.last_name as customer_name FROM service_requests sr LEFT JOIN caravans c ON sr.caravan_id = c.id LEFT JOIN customers cu ON sr.customer_id = cu.id ORDER BY sr.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      countResult = await sql`SELECT COUNT(*) as count FROM service_requests`;
    }
    return NextResponse.json({ requests, total: Number(countResult[0].count) });
  } catch (error) {
    console.error('Services GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch service requests' }, { status: 500 });
  }
}
