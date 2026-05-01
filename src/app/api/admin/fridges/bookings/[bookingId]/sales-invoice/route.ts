import { NextRequest, NextResponse } from 'next/server';
import { setBookingSalesInvoice, getBookingById, logActivity, getAdminInfo } from '@/lib/db';

// Toggle: pro forma → sales invoice flag voor een fridge_booking. Body:
// { converted: boolean }. Aanvinken = timestamp + admin-naam; uitvinken
// (Undo) = beide leeg. Activity-log voor audit-trail.
export async function POST(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    const { bookingId } = await params;
    const id = Number(bookingId);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid booking id' }, { status: 400 });
    }
    const body = await req.json().catch(() => ({}));
    const converted = !!body.converted;

    const booking = await getBookingById(id) as null | {
      id: number; holded_invoice_number: string | null;
    };
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const admin = getAdminInfo(req);
    await setBookingSalesInvoice(id, converted, admin.name);

    await logActivity({
      actor: admin.name, role: admin.role,
      action: converted ? 'Marked converted to sales invoice' : 'Reverted sales invoice flag',
      entityType: 'fridge_booking',
      entityId: String(id),
      entityLabel: booking.holded_invoice_number || undefined,
    });

    return NextResponse.json({ success: true, converted });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[sales-invoice toggle fridge] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
