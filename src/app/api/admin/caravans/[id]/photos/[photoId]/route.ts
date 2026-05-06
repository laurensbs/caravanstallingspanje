import { NextRequest, NextResponse } from 'next/server';
import {
  getCaravanPhotoById, deleteCaravanPhoto, logActivity, getAdminInfo,
} from '@/lib/db';

// Admin mag elke caravan-foto verwijderen (eigen of klant-upload).
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> },
) {
  const { id, photoId } = await params;
  const caravanId = Number(id);
  const idNum = Number(photoId);
  if (!Number.isFinite(caravanId) || !Number.isFinite(idNum)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const photo = await getCaravanPhotoById(idNum);
  if (!photo) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (photo.caravan_id !== caravanId) {
    return NextResponse.json({ error: 'photo hoort niet bij deze caravan' }, { status: 400 });
  }

  try {
    const ok = await deleteCaravanPhoto(idNum);
    if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Admin verwijderde caravan-foto',
      entityType: 'caravan_photo',
      entityId: String(idNum),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
