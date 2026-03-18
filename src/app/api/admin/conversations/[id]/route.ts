import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Get conversation messages + reply to conversation

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const convId = Number(id);

    const conversation = await sql`
      SELECT c.*, cu.first_name || ' ' || cu.last_name as customer_name, cu.email as customer_email
      FROM conversations c
      LEFT JOIN customers cu ON c.customer_id = cu.id
      WHERE c.id = ${convId}
    `;

    if (!conversation[0]) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const messages = await sql`
      SELECT * FROM conversation_messages
      WHERE conversation_id = ${convId}
      ORDER BY created_at ASC
    `;

    // Mark admin-side messages from customer as read
    await sql`
      UPDATE conversation_messages 
      SET is_read = true 
      WHERE conversation_id = ${convId} AND sender_type = 'customer' AND is_read = false
    `;

    return NextResponse.json({ conversation: conversation[0], messages });
  } catch (error) {
    console.error('Conversation GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const convId = Number(id);
    const body = await request.json();
    const { message, sender_type, sender_id, sender_name } = body;

    if (!message || !sender_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const msg = await sql`
      INSERT INTO conversation_messages (conversation_id, sender_type, sender_id, sender_name, message)
      VALUES (${convId}, ${sender_type || 'admin'}, ${sender_id || null}, ${sender_name}, ${message})
      RETURNING *
    `;

    // Update conversation timestamp
    await sql`
      UPDATE conversations SET last_message_at = NOW() WHERE id = ${convId}
    `;

    // If admin replies, notify customer
    if (sender_type === 'admin') {
      const conv = await sql`SELECT customer_id FROM conversations WHERE id = ${convId}`;
      if (conv[0]?.customer_id) {
        await sql`
          INSERT INTO notifications (user_type, user_id, title, message, link)
          VALUES ('customer', ${conv[0].customer_id}, 'Nieuw bericht', 
                  ${message.substring(0, 100)}, '/mijn-account?tab=berichten')
        `;
      }
    }

    return NextResponse.json({ message: msg[0] }, { status: 201 });
  } catch (error) {
    console.error('Conversation reply error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const convId = Number(id);
    const body = await request.json();
    const { status } = body;

    if (status) {
      await sql`UPDATE conversations SET status = ${status} WHERE id = ${convId}`;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Conversation PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}
