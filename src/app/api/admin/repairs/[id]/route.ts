import { NextRequest, NextResponse } from 'next/server';
import { getRepairInspectionById, updateRepairInspection, updateRepairStatus, deleteRepairInspection, logActivity, getAdminInfo } from '@/lib/db';
import { validateBody, repairInspectionSchema } from '@/lib/validations';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const inspection = await getRepairInspectionById(parseInt(id));
    if (!inspection) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ inspection });
  } catch (error) {
    console.error('Repair GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch repair' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = validateBody(repairInspectionSchema.partial(), body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    await updateRepairInspection(parseInt(id), validated.data);
    const admin = getAdminInfo(req);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Reparatie-inspectie bijgewerkt', entityType: 'repair', entityId: id, entityLabel: `${body.location_code || ''} - ${body.customer_name || ''}` });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Repair PUT error:', error);
    return NextResponse.json({ error: 'Failed to update repair' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    await updateRepairStatus(parseInt(id), status);
    const admin = getAdminInfo(req);
    const inspection = await getRepairInspectionById(parseInt(id));
    await logActivity({ actor: admin.name, role: admin.role, action: `Reparatiestatus → ${status}`, entityType: 'repair', entityId: id, entityLabel: `${inspection?.location_code || ''} - ${inspection?.customer_name || ''}` });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Repair PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const inspection = await getRepairInspectionById(parseInt(id));
    await deleteRepairInspection(parseInt(id));
    const admin = getAdminInfo(req);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Reparatie-inspectie verwijderd', entityType: 'repair', entityId: id, entityLabel: `${inspection?.location_code || ''} - ${inspection?.customer_name || ''}` });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Repair DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete repair' }, { status: 500 });
  }
}
