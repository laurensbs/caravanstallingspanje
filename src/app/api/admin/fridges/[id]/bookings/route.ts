import { NextRequest, NextResponse } from 'next/server';
import { createFridgeBooking, getFridgeById, countOverlappingBookings, logActivity, getAdminInfo } from '@/lib/db';
import { validateBody, fridgeBookingSchema } from '@/lib/validations';
import { getEffectiveStock, type DeviceType } from '@/lib/pricing';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = validateBody(fridgeBookingSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });

    const fridge = await getFridgeById(parseInt(id));
    if (!fridge) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    // Capaciteits-check: alleen als zowel start als end zijn ingevuld én force
    // niet expliciet is gezet. Admin kan met `force: true` overrullen voor
    // edge-cases (bv. extra unit beschikbaar uit reserve).
    const force = body.force === true;
    if (!force && validated.data.start_date && validated.data.end_date) {
      const stock = await getEffectiveStock();
      const cap = stock[fridge.device_type as DeviceType];
      if (typeof cap === 'number' && cap > 0) {
        const inUse = await countOverlappingBookings(
          fridge.device_type,
          validated.data.start_date,
          validated.data.end_date,
        );
        if (inUse >= cap) {
          return NextResponse.json({
            error: `Out of stock: all ${cap} ${fridge.device_type} units are already rented in this period (${inUse} active). Send 'force: true' to override.`,
            soldOut: true,
            inUse,
            capacity: cap,
          }, { status: 409 });
        }
      }
    }

    const booking = await createFridgeBooking(parseInt(id), validated.data);
    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: force ? 'Fridge period added (force)' : 'Fridge period added',
      entityType: 'fridge', entityId: id,
      entityLabel: `${fridge?.name || ''} - ${validated.data.camping || ''}`,
    });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Fridge booking POST error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
