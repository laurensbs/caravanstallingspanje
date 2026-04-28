import { NextRequest, NextResponse } from 'next/server';
import { updateService, deleteService, logActivity, getAdminInfo } from '@/lib/db';
import { validateBody, serviceCatalogSchema } from '@/lib/validations';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = validateBody(serviceCatalogSchema.partial(), body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    await updateService(parseInt(id), {
      slug: validated.data.slug,
      name: validated.data.name,
      description: validated.data.description,
      price_eur: validated.data.price_eur,
      sort_order: validated.data.sort_order,
      active: validated.data.active,
    });
    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Service bijgewerkt',
      entityType: 'service_catalog',
      entityId: id,
      entityLabel: validated.data.name || '',
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Service PUT error:', error);
    return NextResponse.json({ error: 'Bijwerken mislukt' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteService(parseInt(id));
    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Service verwijderd',
      entityType: 'service_catalog',
      entityId: id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Service DELETE error:', error);
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 });
  }
}
