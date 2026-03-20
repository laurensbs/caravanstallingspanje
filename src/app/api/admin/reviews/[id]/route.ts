import { NextResponse } from 'next/server';
import { updateReviewStatus } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await updateReviewStatus(parseInt(id), body.is_published, body.admin_reply);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review update error:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
