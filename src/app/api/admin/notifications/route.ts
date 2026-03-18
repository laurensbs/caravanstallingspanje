import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

// GET /api/admin/notifications — list notifications for admin
export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const limit = Number(req.nextUrl.searchParams.get('limit') || '20');
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    
    const notifications = await sql`
      SELECT id, title, message, link, is_read, created_at
      FROM notifications
      WHERE user_type = 'admin'
      ORDER BY created_at DESC
      LIMIT ${safeLimit}
    `;
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST /api/admin/notifications — mark notification as read
export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const body = await req.json();
    const { id, action } = body;

    if (action === 'mark_read' && id) {
      await sql`UPDATE notifications SET is_read = true WHERE id = ${id}`;
      return NextResponse.json({ success: true });
    }

    if (action === 'mark_all_read') {
      await sql`UPDATE notifications SET is_read = true WHERE user_type = 'admin' AND is_read = false`;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
