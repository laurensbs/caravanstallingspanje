import { NextRequest, NextResponse } from 'next/server';
import {
  getContactMessageById, markContactMessageHandled, markContactMessageOpen,
  deleteContactMessage, logActivity, getAdminInfo,
} from '@/lib/db';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const message = await getContactMessageById(Number(id));
  if (!message) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ message });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const admin = getAdminInfo(req);
  const idNum = Number(id);
  if (body.action === 'handle') {
    await markContactMessageHandled(idNum);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Contact-bericht afgehandeld',
      entityType: 'contact_message',
      entityId: id,
    });
  } else if (body.action === 'reopen') {
    await markContactMessageOpen(idNum);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Contact-bericht heropend',
      entityType: 'contact_message',
      entityId: id,
    });
  } else {
    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const admin = getAdminInfo(req);
  await deleteContactMessage(Number(id));
  await logActivity({
    actor: admin.name, role: admin.role,
    action: 'Contact-bericht verwijderd',
    entityType: 'contact_message',
    entityId: id,
  });
  return NextResponse.json({ success: true });
}
