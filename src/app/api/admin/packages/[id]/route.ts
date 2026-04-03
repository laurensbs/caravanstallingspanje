import { NextRequest, NextResponse } from 'next/server';
import { sql, logActivity, getAdminInfo } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pkg = await sql`SELECT * FROM service_packages WHERE id = ${Number(id)}`;
    if (!pkg[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ package: pkg[0] });
  } catch (error) {
    console.error('Package GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch package' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, price_type, is_active, features, sort_order, category } = body;

    await sql`
      UPDATE service_packages SET
        name = COALESCE(${name || null}, name),
        description = COALESCE(${description ?? null}, description),
        price = COALESCE(${price ? Number(price) : null}, price),
        price_type = COALESCE(${price_type || null}, price_type),
        is_active = COALESCE(${is_active ?? null}, is_active),
        features = COALESCE(${features ? JSON.stringify(features) : null}, features),
        sort_order = COALESCE(${sort_order ?? null}, sort_order),
        category = COALESCE(${category || null}, category),
        updated_at = NOW()
      WHERE id = ${Number(id)}
    `;

    const admin = getAdminInfo(request);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Pakket bijgewerkt', entityType: 'package', entityId: id, entityLabel: name || `Pakket #${id}` });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Package PUT error:', error);
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await sql`SELECT name FROM service_packages WHERE id = ${Number(id)}`;
    await sql`DELETE FROM service_packages WHERE id = ${Number(id)}`;
    const admin = getAdminInfo(request);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Pakket verwijderd', entityType: 'package', entityId: id, entityLabel: existing[0]?.name || `#${id}` });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Package DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
  }
}
