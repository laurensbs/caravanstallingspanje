import { NextRequest, NextResponse } from 'next/server';
import {
  getAllTransportRequests,
  updateTransportRequestStatus,
  deleteTransportRequest,
  logActivity,
  getAdminInfo,
} from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || undefined;
    const entries = await getAllTransportRequests(status);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Transport GET error:', error);
    return NextResponse.json({ error: 'Kon transporten niet laden' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, action, status } = await req.json();
    if (!id || !action) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    const admin = getAdminInfo(req);

    if (action === 'set-status' && typeof status === 'string') {
      await updateTransportRequestStatus(Number(id), status);
      await logActivity({
        actor: admin.name, role: admin.role,
        action: `Transport status → ${status}`,
        entityType: 'transport_request',
        entityId: String(id),
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      await deleteTransportRequest(Number(id));
      await logActivity({
        actor: admin.name, role: admin.role,
        action: 'Transport verwijderd',
        entityType: 'transport_request',
        entityId: String(id),
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Onbekende actie' }, { status: 400 });
  } catch (error) {
    console.error('Transport PATCH error:', error);
    return NextResponse.json({ error: 'Kon actie niet uitvoeren' }, { status: 500 });
  }
}
