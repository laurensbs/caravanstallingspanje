import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || undefined;
    let inspections;
    if (status) {
      inspections = await sql`SELECT i.*, c.brand as caravan_brand, c.model as caravan_model, c.license_plate as caravan_license_plate, sp.label as spot_label, l.name as location_name FROM inspections i LEFT JOIN caravans c ON i.caravan_id = c.id LEFT JOIN spots sp ON c.spot_id = sp.id LEFT JOIN locations l ON c.location_id = l.id WHERE i.status = ${status} ORDER BY i.created_at DESC`;
    } else {
      inspections = await sql`SELECT i.*, c.brand as caravan_brand, c.model as caravan_model, c.license_plate as caravan_license_plate, sp.label as spot_label, l.name as location_name FROM inspections i LEFT JOIN caravans c ON i.caravan_id = c.id LEFT JOIN spots sp ON c.spot_id = sp.id LEFT JOIN locations l ON c.location_id = l.id ORDER BY i.created_at DESC`;
    }
    return NextResponse.json({ inspections });
  } catch (error) {
    console.error('Inspections GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch inspections' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const staffId = req.headers.get('x-staff-id');
    const data = await req.json();
    const result = await sql`INSERT INTO inspections (caravan_id, inspected_by, inspection_type, status, checklist, notes, inspected_at) VALUES (${data.caravan_id}, ${staffId}, ${data.inspection_type || 'tweewekelijks'}, ${data.status || 'afgerond'}, ${JSON.stringify(data.checklist || {})}, ${data.notes || null}, NOW()) RETURNING *`;
    return NextResponse.json({ inspection: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Inspection POST error:', error);
    return NextResponse.json({ error: 'Failed to create inspection' }, { status: 500 });
  }
}
