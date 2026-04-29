import { NextRequest, NextResponse } from 'next/server';
import {
  getStallingRequestById, updateStallingRequest, deleteStallingRequest,
  logActivity, getAdminInfo,
} from '@/lib/db';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const entry = await getStallingRequestById(Number(id));
  if (!entry) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ entry });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const idNum = Number(id);
  const body = await req.json();
  const admin = getAdminInfo(req);
  await updateStallingRequest(idNum, body);
  await logActivity({
    actor: admin.name, role: admin.role,
    action: 'Stalling bijgewerkt',
    entityType: 'stalling_request',
    entityId: id,
  });
  const fresh = await getStallingRequestById(idNum);
  return NextResponse.json({ entry: fresh });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const admin = getAdminInfo(req);
  await deleteStallingRequest(Number(id));
  await logActivity({
    actor: admin.name, role: admin.role,
    action: 'Stalling verwijderd',
    entityType: 'stalling_request',
    entityId: id,
  });
  return NextResponse.json({ success: true });
}
