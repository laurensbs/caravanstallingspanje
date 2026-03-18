import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const staffId = req.headers.get('x-staff-id');
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || undefined;
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '100')));
    const offset = (page - 1) * limit;
    let tasks, cnt;
    if (status) {
      tasks = await sql`SELECT t.*, l.name as location_name FROM tasks t LEFT JOIN locations l ON t.location_id = l.id WHERE (t.assigned_to = ${staffId} OR t.assigned_to IS NULL) AND t.status = ${status} ORDER BY CASE t.priority WHEN 'urgent' THEN 0 WHEN 'hoog' THEN 1 WHEN 'normaal' THEN 2 ELSE 3 END, t.due_date NULLS LAST LIMIT ${limit} OFFSET ${offset}`;
      cnt = await sql`SELECT COUNT(*) as total FROM tasks WHERE (assigned_to = ${staffId} OR assigned_to IS NULL) AND status = ${status}`;
    } else {
      tasks = await sql`SELECT t.*, l.name as location_name FROM tasks t LEFT JOIN locations l ON t.location_id = l.id WHERE t.assigned_to = ${staffId} OR t.assigned_to IS NULL ORDER BY CASE t.priority WHEN 'urgent' THEN 0 WHEN 'hoog' THEN 1 WHEN 'normaal' THEN 2 ELSE 3 END, t.due_date NULLS LAST LIMIT ${limit} OFFSET ${offset}`;
      cnt = await sql`SELECT COUNT(*) as total FROM tasks WHERE assigned_to = ${staffId} OR assigned_to IS NULL`;
    }
    return NextResponse.json({ tasks, total: Number(cnt[0].total), page, limit });
  } catch (error) {
    console.error('Staff tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
