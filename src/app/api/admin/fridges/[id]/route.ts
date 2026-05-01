import { NextRequest, NextResponse } from 'next/server';
import { getFridgeById, updateFridge, deleteFridge, logActivity, getAdminInfo } from '@/lib/db';
import { validateBody, fridgeSchema } from '@/lib/validations';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const fridge = await getFridgeById(parseInt(id));
    if (!fridge) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ fridge });
  } catch (error) {
    console.error('Fridge GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch fridge' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = validateBody(fridgeSchema.partial(), body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    await updateFridge(parseInt(id), {
      name: validated.data.name,
      email: validated.data.email,
      extra_email: validated.data.extra_email,
      device_type: validated.data.device_type,
      notes: validated.data.notes,
      customer_id: validated.data.customer_id ?? null,
    });
    const admin = getAdminInfo(req);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Fridge updated', entityType: 'fridge', entityId: id, entityLabel: validated.data.name || '' });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fridge PUT error:', error);
    return NextResponse.json({ error: 'Failed to update fridge' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const fridge = await getFridgeById(parseInt(id));
    await deleteFridge(parseInt(id));
    const admin = getAdminInfo(req);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Fridge deleted', entityType: 'fridge', entityId: id, entityLabel: fridge?.name || '' });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fridge DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete fridge' }, { status: 500 });
  }
}
