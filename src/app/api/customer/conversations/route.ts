import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCustomerSession } from '@/lib/auth';

async function getCustomerFromRequest(request: NextRequest) {
  const token = request.cookies.get('customer_token')?.value;
  if (!token) return null;
  try {
    return await getCustomerSession(token);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await sql`
      SELECT c.*,
        (SELECT COUNT(*) FROM conversation_messages cm WHERE cm.conversation_id = c.id AND cm.is_read = false AND cm.sender_type = 'admin') as unread_count,
        (SELECT cm.message FROM conversation_messages cm WHERE cm.conversation_id = c.id ORDER BY cm.created_at DESC LIMIT 1) as last_message,
        (SELECT cm.sender_name FROM conversation_messages cm WHERE cm.conversation_id = c.id ORDER BY cm.created_at DESC LIMIT 1) as last_sender
      FROM conversations c
      WHERE c.customer_id = ${customer.id as number}
      ORDER BY c.last_message_at DESC
    `;

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Customer conversations GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, message } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    // Truncate to safe lengths
    const safeSubject = String(subject).slice(0, 200);
    const safeMessage = String(message).slice(0, 5000);

    // Create conversation
    const conv = await sql`
      INSERT INTO conversations (customer_id, subject)
      VALUES (${customer.id as number}, ${safeSubject})
      RETURNING *
    `;

    // Add first message
    await sql`
      INSERT INTO conversation_messages (conversation_id, sender_type, sender_id, sender_name, message)
      VALUES (${conv[0].id}, 'customer', ${customer.id as number}, ${customer.name as string || 'Klant'}, ${safeMessage})
    `;

    // Notify admin
    await sql`
      INSERT INTO notifications (user_type, user_id, title, message, link)
      VALUES ('admin', 1, 'Nieuw klantbericht', ${safeSubject}, '/admin/berichten')
    `;

    return NextResponse.json({ conversation: conv[0] }, { status: 201 });
  } catch (error) {
    console.error('Customer conversations POST error:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
