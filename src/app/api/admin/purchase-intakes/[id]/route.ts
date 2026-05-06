import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { updatePurchaseIntakeStatus, logActivity, getAdminInfo } from '@/lib/db';

const schema = z.object({
  status: z.enum(['new', 'reviewed', 'offered', 'accepted', 'declined', 'closed']),
  admin_note: z.string().max(2000).optional().nullable(),
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
    const item = await updatePurchaseIntakeStatus(idNum, parsed.data.status, parsed.data.admin_note);
    if (!item) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: `Inkoop-aanvraag → ${parsed.data.status}`,
      entityType: 'purchase_intake',
      entityId: String(item.id),
      entityLabel: item.name,
    });
    return NextResponse.json({ item });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
