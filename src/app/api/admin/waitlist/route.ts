import { NextRequest, NextResponse } from 'next/server';
import { getWaitlist, deleteWaitlistEntry, markWaitlistNotified, logActivity, getAdminInfo } from '@/lib/db';

export async function GET() {
  try {
    const entries = await getWaitlist();
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Waitlist GET error:', error);
    return NextResponse.json({ error: 'Kon wachtlijst niet laden' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, action } = await req.json();
    if (!id || !action) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

    const admin = getAdminInfo(req);

    if (action === 'notify') {
      await markWaitlistNotified(Number(id));
      await logActivity({
        actor: admin.name, role: admin.role,
        action: 'Wachtlijst genotificeerd',
        entityType: 'waitlist',
        entityId: String(id),
      });
      return NextResponse.json({ success: true });
    }
    if (action === 'delete') {
      await deleteWaitlistEntry(Number(id));
      await logActivity({
        actor: admin.name, role: admin.role,
        action: 'Wachtlijst verwijderd',
        entityType: 'waitlist',
        entityId: String(id),
      });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Onbekende actie' }, { status: 400 });
  } catch (error) {
    console.error('Waitlist PATCH error:', error);
    return NextResponse.json({ error: 'Kon actie niet uitvoeren' }, { status: 500 });
  }
}
