import { NextRequest, NextResponse } from 'next/server';
import { getAllRepairInspections, createRepairInspection, getRepairStats, logActivity, getAdminInfo } from '@/lib/db';
import { validateBody, repairInspectionSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(500, Math.max(1, parseInt(url.searchParams.get('limit') || '200')));
    const yearParam = url.searchParams.get('year');
    const year = yearParam && yearParam !== '' ? parseInt(yearParam) : undefined;
    const status = url.searchParams.get('status') || undefined;
    const area = url.searchParams.get('area') || undefined;
    const search = url.searchParams.get('search') || undefined;

    if (url.searchParams.get('stats') === 'true') {
      const stats = await getRepairStats(year);
      return NextResponse.json(stats);
    }

    const result = await getAllRepairInspections(page, limit, year, status, area, search);
    return NextResponse.json({ ...result, page, limit });
  } catch (error) {
    console.error('Repairs GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch repairs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(repairInspectionSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const inspection = await createRepairInspection(validated.data);
    const admin = getAdminInfo(req);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Reparatie-inspectie aangemaakt', entityType: 'repair', entityId: String(inspection.id), entityLabel: `${validated.data.location_code} - ${validated.data.customer_name}` });
    return NextResponse.json({ inspection }, { status: 201 });
  } catch (error) {
    console.error('Repairs POST error:', error);
    return NextResponse.json({ error: 'Failed to create repair inspection' }, { status: 500 });
  }
}
