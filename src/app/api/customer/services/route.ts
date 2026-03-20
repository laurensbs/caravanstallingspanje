import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCustomerSession } from '@/lib/auth';
import { validateBody, serviceRequestSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('customer_token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const session = await getCustomerSession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const requests = await sql`
      SELECT sr.*, ca.brand || ' ' || COALESCE(ca.model,'') as caravan_name, ca.license_plate
      FROM service_requests sr
      LEFT JOIN caravans ca ON sr.caravan_id = ca.id
      WHERE sr.customer_id = ${session.id}
      ORDER BY sr.created_at DESC
    `;
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Customer service requests fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch service requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('customer_token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const session = await getCustomerSession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const body = await req.json();
    const validated = validateBody(serviceRequestSchema, { ...body, customer_id: session.id });
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const { caravan_id, service_type, description } = validated.data;

    // Verify caravan belongs to customer
    const caravan = await sql`SELECT id FROM caravans WHERE id = ${caravan_id} AND customer_id = ${session.id}`;
    if (caravan.length === 0) return NextResponse.json({ error: 'Caravan not found' }, { status: 404 });

    const result = await sql`INSERT INTO service_requests (customer_id, caravan_id, service_type, description) VALUES (${session.id}, ${caravan_id}, ${service_type}, ${description}) RETURNING *`;
    return NextResponse.json({ request: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Customer service request error:', error);
    return NextResponse.json({ error: 'Failed to submit service request' }, { status: 500 });
  }
}
