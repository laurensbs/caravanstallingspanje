import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCustomerSession } from '@/lib/auth';

async function getCustomerId(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get('customer_token')?.value;
  if (!token) return null;
  const session = await getCustomerSession(token);
  return session?.id || null;
}

// GET /api/customer/notifications
export async function GET(req: NextRequest) {
  const customerId = await getCustomerId(req);
  if (!customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const notifications = await sql`
      SELECT id, title, message, link, is_read, created_at
      FROM notifications
      WHERE user_type = 'customer' AND user_id = ${customerId}
      ORDER BY created_at DESC
      LIMIT 20
    `;
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST /api/customer/notifications — mark as read
export async function POST(req: NextRequest) {
  const customerId = await getCustomerId(req);
  if (!customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, action } = body;

    if (action === 'mark_read' && id) {
      await sql`UPDATE notifications SET is_read = true WHERE id = ${id} AND user_id = ${customerId}`;
      return NextResponse.json({ success: true });
    }

    if (action === 'mark_all_read') {
      await sql`UPDATE notifications SET is_read = true WHERE user_type = 'customer' AND user_id = ${customerId} AND is_read = false`;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
