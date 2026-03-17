import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const staffId = req.headers.get('x-staff-id');
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || undefined;
    const limit = url.searchParams.get('limit') || '100';
    let tasks;
    if (status) {
      tasks = await sql`SELECT t.*, l.name as location_name FROM tasks t LEFT JOIN locations l ON t.location_id = l.id WHERE (t.assigned_to = ${staffId} OR t.assigned_to IS NULL) AND t.status = ${status} ORDER BY CASE t.priority WHEN 'urgent' THEN 0 WHEN 'hoog' THEN 1 WHEN 'normaal' THEN 2 ELSE 3 END, t.due_date NULLS LAST LIMIT ${Number(limit)}`;
    } else {
      tasks = await sql`SELECT t.*, l.name as location_name FROM tasks t LEFT JOIN locations l ON t.location_id = l.id WHERE t.assigned_to = ${staffId} OR t.assigned_to IS NULL ORDER BY CASE t.priority WHEN 'urgent' THEN 0 WHEN 'hoog' THEN 1 WHEN 'normaal' THEN 2 ELSE 3 END, t.due_date NULLS LAST LIMIT ${Number(limit)}`;
    }
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Staff tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
