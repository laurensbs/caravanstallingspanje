import { NextResponse } from 'next/server';
import { updateReviewStatus, logActivity, getAdminInfo } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await updateReviewStatus(parseInt(id), body.is_published, body.admin_reply);
    const admin = getAdminInfo(request);
    await logActivity({ actor: admin.name, role: admin.role, action: body.is_published ? 'Review gepubliceerd' : 'Review bijgewerkt', entityType: 'review', entityId: id, entityLabel: `Review #${id}`, details: body.admin_reply ? 'Met admin reactie' : undefined });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review update error:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
