import { NextRequest, NextResponse } from 'next/server';
import { setIdeaStatus, setIdeaFeatured, deleteIdea, logActivity, getAdminInfo } from '@/lib/db';

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const admin = getAdminInfo(req);

  if (typeof body.featured === 'boolean') {
    await setIdeaFeatured(Number(id), body.featured);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: `Idee featured → ${body.featured ? 'aan' : 'uit'}`,
      entityType: 'idea',
      entityId: id,
    });
    return NextResponse.json({ success: true });
  }

  const status = String(body.status || '').trim();
  if (!status) return NextResponse.json({ error: 'status of featured required' }, { status: 400 });
  await setIdeaStatus(Number(id), status);
  await logActivity({
    actor: admin.name, role: admin.role,
    action: `Idee status → ${status}`,
    entityType: 'idea',
    entityId: id,
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const admin = getAdminInfo(req);
  await deleteIdea(Number(id));
  await logActivity({
    actor: admin.name, role: admin.role,
    action: 'Idee verwijderd',
    entityType: 'idea',
    entityId: id,
  });
  return NextResponse.json({ success: true });
}
