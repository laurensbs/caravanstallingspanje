import { NextRequest, NextResponse } from 'next/server';
import { getAllCaravans, sql, logActivity, getAdminInfo } from '@/lib/db';
import { validateBody, caravanSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || undefined;
    const result = await getAllCaravans(page, limit, search, status);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Caravans GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch caravans' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(caravanSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;
    const result = await sql`INSERT INTO caravans (customer_id, brand, model, year, license_plate, length_m, weight_kg, has_mover, location_id, spot_id, status, insurance_expiry, apk_expiry, notes) VALUES (${data.customer_id}, ${data.brand}, ${data.model || null}, ${data.year || null}, ${data.license_plate || null}, ${data.length_m || null}, ${data.weight_kg || null}, ${data.has_mover || false}, ${data.location_id || null}, ${data.spot_id || null}, ${data.status || 'gestald'}, ${data.insurance_expiry || null}, ${data.apk_expiry || null}, ${data.notes || null}) RETURNING *`;
    const admin = getAdminInfo(req);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Caravan aangemaakt', entityType: 'caravan', entityId: String(result[0].id), entityLabel: `${data.brand} ${data.model || ''} ${data.license_plate || ''}`.trim() });
    return NextResponse.json({ caravan: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Caravan POST error:', error);
    return NextResponse.json({ error: 'Failed to create caravan' }, { status: 500 });
  }
}
