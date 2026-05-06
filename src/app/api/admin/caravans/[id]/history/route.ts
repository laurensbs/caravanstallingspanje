import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getServiceHistory, createServiceHistoryEntry, logActivity, getAdminInfo,
} from '@/lib/db';

const schema = z.object({
  kind: z.enum(['cleaning', 'service', 'inspection', 'repair', 'other']),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).nullable().optional(),
  happened_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  const items = await getServiceHistory(idNum);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(', ') }, { status: 400 });
    }
    const entry = await createServiceHistoryEntry({ caravan_id: idNum, ...parsed.data });
    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: `Service-historie toegevoegd: ${parsed.data.title}`,
      entityType: 'caravan_service_history',
      entityId: String(entry.id),
    });
    return NextResponse.json({ item: entry });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
