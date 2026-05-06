import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getServiceRequestById, updateServiceRequestStatus,
  logActivity, getAdminInfo,
} from '@/lib/db';

const patchSchema = z.object({
  status: z.enum(['new', 'in_progress', 'done', 'cancelled']),
  adminNote: z.string().max(2000).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  const item = await getServiceRequestById(idNum);
  if (!item) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  try {
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(', ') }, { status: 400 });
    }
    const updated = await updateServiceRequestStatus(idNum, parsed.data.status, parsed.data.adminNote ?? null);
    if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: `Service-aanvraag → ${parsed.data.status}`,
      entityType: 'customer_service_request',
      entityId: String(idNum),
    });
    return NextResponse.json({ item: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
