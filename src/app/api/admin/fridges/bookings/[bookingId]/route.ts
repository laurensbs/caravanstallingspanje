import { NextRequest, NextResponse } from 'next/server';
import { updateFridgeBooking, deleteFridgeBooking, logActivity, getAdminInfo } from '@/lib/db';
import { validateBody, fridgeBookingSchema } from '@/lib/validations';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    const { bookingId } = await params;
    const body = await req.json();
    const validated = validateBody(fridgeBookingSchema.partial(), body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    await updateFridgeBooking(parseInt(bookingId), validated.data);
    const admin = getAdminInfo(req);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Fridge period updated', entityType: 'fridge_booking', entityId: bookingId, entityLabel: validated.data.camping || '' });
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[admin/fridges/bookings PUT] error:', msg, err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    const { bookingId } = await params;
    await deleteFridgeBooking(parseInt(bookingId));
    const admin = getAdminInfo(req);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Fridge period deleted', entityType: 'fridge_booking', entityId: bookingId });
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[admin/fridges/bookings DELETE] error:', msg, err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
