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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const convId = Number(id);

    // Verify conversation belongs to customer
    const conv = await sql`
      SELECT * FROM conversations WHERE id = ${convId} AND customer_id = ${customer.id as number}
    `;
    if (!conv[0]) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const messages = await sql`
      SELECT * FROM conversation_messages
      WHERE conversation_id = ${convId}
      ORDER BY created_at ASC
    `;

    // Mark admin messages as read
    await sql`
      UPDATE conversation_messages 
      SET is_read = true 
      WHERE conversation_id = ${convId} AND sender_type = 'admin' AND is_read = false
    `;

    return NextResponse.json({ conversation: conv[0], messages });
  } catch (error) {
    console.error('Customer conversation GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const convId = Number(id);

    // Verify ownership
    const conv = await sql`
      SELECT * FROM conversations WHERE id = ${convId} AND customer_id = ${customer.id as number}
    `;
    if (!conv[0]) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const safeMessage = String(message).slice(0, 5000);

    const msg = await sql`
      INSERT INTO conversation_messages (conversation_id, sender_type, sender_id, sender_name, message)
      VALUES (${convId}, 'customer', ${customer.id as number}, ${customer.name as string || 'Klant'}, ${safeMessage})
      RETURNING *
    `;

    await sql`UPDATE conversations SET last_message_at = NOW() WHERE id = ${convId}`;

    // Notify admin
    await sql`
      INSERT INTO notifications (user_type, user_id, title, message, link)
      VALUES ('admin', 1, 'Nieuw antwoord van klant', ${safeMessage.substring(0, 100)}, '/admin/berichten')
    `;

    return NextResponse.json({ message: msg[0] }, { status: 201 });
  } catch (error) {
    console.error('Customer reply error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
