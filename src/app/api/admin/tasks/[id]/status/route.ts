import { NextRequest, NextResponse } from 'next/server';
import { sql, logActivity, getAdminInfo } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    if (status === 'afgerond') {
      await sql`UPDATE tasks SET status = 'afgerond', completed_at = NOW(), updated_at = NOW() WHERE id = ${id}`;
    } else {
      await sql`UPDATE tasks SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
    }
    const admin = getAdminInfo(req);
    const task = await sql`SELECT title FROM tasks WHERE id = ${id}`;
    await logActivity({ actor: admin.name, role: admin.role, action: `Taakstatus → ${status}`, entityType: 'task', entityId: id, entityLabel: task[0]?.title || `#${id}` });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Task status error:', error);
    return NextResponse.json({ error: 'Failed to update task status' }, { status: 500 });
  }
}
