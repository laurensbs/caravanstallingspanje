import { NextRequest, NextResponse } from 'next/server';
import { sql, logActivity, getAdminInfo } from '@/lib/db';
import { validateBody, transportSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status') || undefined;
    const offset = (page - 1) * limit;
    let orders, countResult;
    if (status) {
      orders = await sql`SELECT t.*, c.brand as caravan_brand, c.model as caravan_model, c.license_plate as caravan_license_plate, cu.first_name || ' ' || cu.last_name as customer_name, s.first_name || ' ' || s.last_name as assigned_staff_name FROM transport_orders t LEFT JOIN caravans c ON t.caravan_id = c.id LEFT JOIN customers cu ON c.customer_id = cu.id LEFT JOIN staff s ON t.assigned_staff = s.id WHERE t.status = ${status} ORDER BY t.scheduled_date DESC LIMIT ${limit} OFFSET ${offset}`;
      countResult = await sql`SELECT COUNT(*) as count FROM transport_orders WHERE status = ${status}`;
    } else {
      orders = await sql`SELECT t.*, c.brand as caravan_brand, c.model as caravan_model, c.license_plate as caravan_license_plate, cu.first_name || ' ' || cu.last_name as customer_name, s.first_name || ' ' || s.last_name as assigned_staff_name FROM transport_orders t LEFT JOIN caravans c ON t.caravan_id = c.id LEFT JOIN customers cu ON c.customer_id = cu.id LEFT JOIN staff s ON t.assigned_staff = s.id ORDER BY t.scheduled_date DESC LIMIT ${limit} OFFSET ${offset}`;
      countResult = await sql`SELECT COUNT(*) as count FROM transport_orders`;
    }
    return NextResponse.json({ orders, total: Number(countResult[0].count) });
  } catch (error) {
    console.error('Transport GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch transport orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(transportSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;
    const result = await sql`INSERT INTO transport_orders (caravan_id, pickup_address, delivery_address, scheduled_date, notes) VALUES (${data.caravan_id}, ${data.pickup_address || null}, ${data.delivery_address || null}, ${data.scheduled_date}, ${data.notes || null}) RETURNING *`;
    const admin = getAdminInfo(req);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Transport aangemaakt', entityType: 'transport', entityId: String(result[0].id), entityLabel: `Transport #${result[0].id}` });
    return NextResponse.json({ order: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Transport POST error:', error);
    return NextResponse.json({ error: 'Failed to create transport order' }, { status: 500 });
  }
}
