import { NextRequest, NextResponse } from 'next/server';
import { getAllServices, createService, logActivity, getAdminInfo } from '@/lib/db';
import { validateBody, serviceCatalogSchema } from '@/lib/validations';

export async function GET() {
  try {
    const services = await getAllServices();
    return NextResponse.json({ services });
  } catch (error) {
    console.error('Services GET error:', error);
    return NextResponse.json({ error: 'Kon services niet laden' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(serviceCatalogSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const service = await createService({
      slug: validated.data.slug,
      name: validated.data.name,
      description: validated.data.description || null,
      price_eur: validated.data.price_eur,
      sort_order: validated.data.sort_order,
      active: validated.data.active,
    });
    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Service aangemaakt',
      entityType: 'service_catalog',
      entityId: String(service.id),
      entityLabel: service.name,
    });
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Aanmaken mislukt';
    console.error('Services POST error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
