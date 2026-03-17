import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    await sql`UPDATE caravans SET brand = ${data.brand}, model = ${data.model}, year = ${data.year || null}, license_plate = ${data.license_plate}, length_m = ${data.length_m || null}, weight_kg = ${data.weight_kg || null}, has_mover = ${data.has_mover || false}, location_id = ${data.location_id || null}, spot_id = ${data.spot_id || null}, status = ${data.status || 'gestald'}, insurance_expiry = ${data.insurance_expiry || null}, apk_expiry = ${data.apk_expiry || null}, notes = ${data.notes || null}, updated_at = NOW() WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Caravan PUT error:', error);
    return NextResponse.json({ error: 'Failed to update caravan' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM caravans WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Caravan DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete caravan' }, { status: 500 });
  }
}
