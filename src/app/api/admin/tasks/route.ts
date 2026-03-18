import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { validateBody, taskSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || undefined;
    let tasks;
    if (status) {
      tasks = await sql`SELECT t.*, s.first_name || ' ' || s.last_name as assigned_staff_name, l.name as location_name FROM tasks t LEFT JOIN staff s ON t.assigned_to = s.id LEFT JOIN locations l ON t.location_id = l.id WHERE t.status = ${status} ORDER BY CASE t.priority WHEN 'urgent' THEN 0 WHEN 'hoog' THEN 1 WHEN 'normaal' THEN 2 ELSE 3 END, t.due_date NULLS LAST`;
    } else {
      tasks = await sql`SELECT t.*, s.first_name || ' ' || s.last_name as assigned_staff_name, l.name as location_name FROM tasks t LEFT JOIN staff s ON t.assigned_to = s.id LEFT JOIN locations l ON t.location_id = l.id ORDER BY CASE t.priority WHEN 'urgent' THEN 0 WHEN 'hoog' THEN 1 WHEN 'normaal' THEN 2 ELSE 3 END, t.due_date NULLS LAST`;
    }
    return NextResponse.json({ tasks, total: tasks.length });
  } catch (error) {
    console.error('Tasks GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(taskSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;
    const result = await sql`INSERT INTO tasks (title, description, priority, assigned_to, location_id, due_date) VALUES (${data.title}, ${data.description || null}, ${data.priority || 'normaal'}, ${data.assigned_to || null}, ${data.location_id || null}, ${data.due_date || null}) RETURNING *`;
    return NextResponse.json({ task: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Task POST error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
