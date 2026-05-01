import { NextRequest, NextResponse } from 'next/server';
import { getFridgeById, setFridgeHoldedContact, logActivity, getAdminInfo } from '@/lib/db';
import { ensureContact } from '@/lib/holded';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const fridge = await getFridgeById(parseInt(id));
    if (!fridge) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!fridge.email) return NextResponse.json({ error: 'Customer has no email address' }, { status: 400 });

    const contact = await ensureContact({ name: fridge.name, email: fridge.email });
    await setFridgeHoldedContact(parseInt(id), contact.id);

    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name,
      role: admin.role,
      action: 'Holded contact linked',
      entityType: 'fridge',
      entityId: id,
      entityLabel: fridge.name,
    });

    return NextResponse.json({ holdedContactId: contact.id });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Holded error';
    console.error('Holded contact error:', msg);
    await logActivity({ action: 'Holded contact failed', entityType: 'fridge', details: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
