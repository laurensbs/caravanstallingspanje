import { NextRequest, NextResponse } from 'next/server';
import { deleteServiceHistoryEntry, logActivity, getAdminInfo } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  try {
    const ok = await deleteServiceHistoryEntry(idNum);
    if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Service-historie verwijderd',
      entityType: 'caravan_service_history',
      entityId: String(idNum),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
