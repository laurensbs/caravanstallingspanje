import { NextRequest, NextResponse } from 'next/server';
import { sql, logActivity, getAdminInfo } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    if (data.is_active !== undefined) {
      await sql`UPDATE staff SET is_active = ${data.is_active}, updated_at = NOW() WHERE id = ${id}`;
    }
    const admin = getAdminInfo(req);
    const staff = await sql`SELECT first_name, last_name FROM staff WHERE id = ${id}`;
    await logActivity({ actor: admin.name, role: admin.role, action: data.is_active ? 'Medewerker geactiveerd' : 'Medewerker gedeactiveerd', entityType: 'staff', entityId: id, entityLabel: staff[0] ? `${staff[0].first_name} ${staff[0].last_name}` : `#${id}` });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Staff PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}
