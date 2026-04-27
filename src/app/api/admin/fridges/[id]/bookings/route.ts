import { NextRequest, NextResponse } from 'next/server';
import { createFridgeBooking, getFridgeById, logActivity, getAdminInfo } from '@/lib/db';
import { validateBody, fridgeBookingSchema } from '@/lib/validations';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = validateBody(fridgeBookingSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const booking = await createFridgeBooking(parseInt(id), validated.data);
    const fridge = await getFridgeById(parseInt(id));
    const admin = getAdminInfo(req);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Koelkast-periode toegevoegd', entityType: 'fridge', entityId: id, entityLabel: `${fridge?.name || ''} - ${validated.data.camping || ''}` });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Fridge booking POST error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
