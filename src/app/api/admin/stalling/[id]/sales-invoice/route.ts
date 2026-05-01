import { NextRequest, NextResponse } from 'next/server';
import { setStallingSalesInvoice, getStallingRequestById, logActivity, getAdminInfo } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid stalling id' }, { status: 400 });
    }
    const body = await req.json().catch(() => ({}));
    const converted = !!body.converted;

    const r = await getStallingRequestById(id) as null | { id: number; holded_invoice_number: string | null };
    if (!r) return NextResponse.json({ error: 'Stalling request not found' }, { status: 404 });

    const admin = getAdminInfo(req);
    await setStallingSalesInvoice(id, converted, admin.name);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: converted ? 'Marked converted to sales invoice' : 'Reverted sales invoice flag',
      entityType: 'stalling_request',
      entityId: String(id),
      entityLabel: r.holded_invoice_number || undefined,
    });
    return NextResponse.json({ success: true, converted });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[sales-invoice toggle stalling] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
