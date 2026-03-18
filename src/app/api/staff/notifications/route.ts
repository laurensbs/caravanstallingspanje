import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

// GET /api/staff/notifications
export async function GET(req: NextRequest) {
  const staffId = req.headers.get('x-staff-id');
  if (!staffId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const sql = getDb();
    const notifications = await sql`
      SELECT id, title, message, link, is_read, created_at
      FROM notifications
      WHERE user_type = 'staff' AND (user_id = ${staffId} OR user_id IS NULL)
      ORDER BY created_at DESC
      LIMIT 20
    `;
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST /api/staff/notifications — mark as read
export async function POST(req: NextRequest) {
  const staffId = req.headers.get('x-staff-id');
  if (!staffId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const sql = getDb();
    const body = await req.json();
    const { id, action } = body;

    if (action === 'mark_read' && id) {
      await sql`UPDATE notifications SET is_read = true WHERE id = ${id}`;
      return NextResponse.json({ success: true });
    }

    if (action === 'mark_all_read') {
      await sql`UPDATE notifications SET is_read = true WHERE user_type = 'staff' AND (user_id = ${staffId} OR user_id IS NULL) AND is_read = false`;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
