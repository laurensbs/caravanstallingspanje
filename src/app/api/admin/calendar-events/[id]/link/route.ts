import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { linkCalendarEventToTransport, logActivity, getAdminInfo } from '@/lib/db';

const schema = z.object({
  transportRequestId: z.number().int().positive().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(', ') }, { status: 400 });
    }
    await linkCalendarEventToTransport(idNum, parsed.data.transportRequestId);
    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: parsed.data.transportRequestId ? 'Calendar-event aan transport gekoppeld' : 'Calendar-event ontkoppeld',
      entityType: 'calendar_event',
      entityId: String(idNum),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'unknown' }, { status: 500 });
  }
}
