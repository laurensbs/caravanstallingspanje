import { NextRequest, NextResponse } from 'next/server';
import { getAllFridges, createFridge, getFridgeStats, logActivity, getAdminInfo } from '@/lib/db';
import { validateBody, fridgeSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const yearParam = url.searchParams.get('year');
    const year = yearParam && yearParam !== '' ? parseInt(yearParam) : undefined;
    const status = url.searchParams.get('status') || undefined;
    const search = url.searchParams.get('search') || undefined;

    if (url.searchParams.get('stats') === 'true') {
      const stats = await getFridgeStats(year);
      return NextResponse.json(stats);
    }

    const result = await getAllFridges(year, status, search);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Fridges GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch fridges' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(fridgeSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const fridge = await createFridge({
      name: validated.data.name,
      email: validated.data.email || null,
      extra_email: validated.data.extra_email || null,
      device_type: validated.data.device_type,
      notes: validated.data.notes,
    });
    const admin = getAdminInfo(req);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Koelkast aangemaakt', entityType: 'fridge', entityId: String(fridge.id), entityLabel: validated.data.name });
    return NextResponse.json({ fridge }, { status: 201 });
  } catch (error) {
    console.error('Fridges POST error:', error);
    return NextResponse.json({ error: 'Failed to create fridge' }, { status: 500 });
  }
}
