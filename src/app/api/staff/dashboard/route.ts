import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const staffId = req.headers.get('x-staff-id');
    const tasks_open = await sql`SELECT COUNT(*) as count FROM tasks WHERE (assigned_to = ${staffId} OR assigned_to IS NULL) AND status = 'open'`;
    const tasks_today = await sql`SELECT COUNT(*) as count FROM tasks WHERE (assigned_to = ${staffId} OR assigned_to IS NULL) AND due_date = CURRENT_DATE AND status != 'afgerond'`;
    const inspections_due = await sql`SELECT COUNT(*) as count FROM inspections WHERE status = 'gepland'`;
    const transports_today = await sql`SELECT COUNT(*) as count FROM transport_orders WHERE scheduled_date = CURRENT_DATE AND status != 'afgeleverd' AND status != 'geannuleerd'`;
    return NextResponse.json({ stats: { tasks_open: Number(tasks_open[0].count), tasks_today: Number(tasks_today[0].count), inspections_due: Number(inspections_due[0].count), transports_today: Number(transports_today[0].count) } });
  } catch (error) {
    console.error('Staff dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
