import { NextRequest, NextResponse } from 'next/server';
import { sql, logActivity, getAdminInfo } from '@/lib/db';
import { validateBody, caravanSchema } from '@/lib/validations';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = validateBody(caravanSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;
    await sql`UPDATE caravans SET brand = ${data.brand}, model = ${data.model || null}, year = ${data.year || null}, license_plate = ${data.license_plate || null}, length_m = ${data.length_m || null}, weight_kg = ${data.weight_kg || null}, has_mover = ${data.has_mover || false}, location_id = ${data.location_id || null}, spot_id = ${data.spot_id || null}, status = ${data.status || 'gestald'}, insurance_expiry = ${data.insurance_expiry || null}, apk_expiry = ${data.apk_expiry || null}, notes = ${data.notes || null}, updated_at = NOW() WHERE id = ${id}`;
    const admin = getAdminInfo(req);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Caravan bijgewerkt', entityType: 'caravan', entityId: id, entityLabel: `${data.brand} ${data.model || ''} ${data.license_plate || ''}`.trim() });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Caravan PUT error:', error);
    return NextResponse.json({ error: 'Failed to update caravan' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await sql`SELECT brand, model, license_plate FROM caravans WHERE id = ${id}`;
    await sql`DELETE FROM caravans WHERE id = ${id}`;
    const admin = getAdminInfo(req);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Caravan verwijderd', entityType: 'caravan', entityId: id, entityLabel: existing[0] ? `${existing[0].brand} ${existing[0].model || ''} ${existing[0].license_plate || ''}`.trim() : id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Caravan DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete caravan' }, { status: 500 });
  }
}
