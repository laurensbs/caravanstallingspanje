import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Conversations / threaded messaging for admin
// Tables auto-created on first use

async function ensureConversationsTable() {
  await sql`CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    contact_name TEXT,
    contact_email TEXT,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    last_message_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS contact_name TEXT`;
  await sql`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS contact_email TEXT`;
  await sql`CREATE TABLE IF NOT EXISTS conversation_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL,
    sender_id INTEGER,
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_conv_customer ON conversations(customer_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_conv_msg_conv ON conversation_messages(conversation_id)`;
}

export async function GET(request: NextRequest) {
  try {
    await ensureConversationsTable();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customer_id');

    // Optimized: use CTEs instead of correlated subqueries to avoid N+1
    let conversations;
    if (customerId) {
      conversations = await sql`
        WITH unread AS (
          SELECT conversation_id, COUNT(*) as cnt
          FROM conversation_messages WHERE is_read = false AND sender_type = 'customer'
          GROUP BY conversation_id
        ), latest_msg AS (
          SELECT DISTINCT ON (conversation_id) conversation_id, message
          FROM conversation_messages ORDER BY conversation_id, created_at DESC
        )
        SELECT c.*,
          COALESCE(cu.first_name || ' ' || cu.last_name, c.contact_name, 'Onbekend') as customer_name,
          COALESCE(cu.email, c.contact_email) as customer_email,
          COALESCE(u.cnt, 0) as unread_count, lm.message as last_message
        FROM conversations c
        LEFT JOIN customers cu ON c.customer_id = cu.id
        LEFT JOIN unread u ON u.conversation_id = c.id
        LEFT JOIN latest_msg lm ON lm.conversation_id = c.id
        WHERE c.customer_id = ${Number(customerId)}
        ORDER BY c.last_message_at DESC
      `;
    } else if (status) {
      conversations = await sql`
        WITH unread AS (
          SELECT conversation_id, COUNT(*) as cnt
          FROM conversation_messages WHERE is_read = false AND sender_type = 'customer'
          GROUP BY conversation_id
        ), latest_msg AS (
          SELECT DISTINCT ON (conversation_id) conversation_id, message
          FROM conversation_messages ORDER BY conversation_id, created_at DESC
        )
        SELECT c.*,
          COALESCE(cu.first_name || ' ' || cu.last_name, c.contact_name, 'Onbekend') as customer_name,
          COALESCE(cu.email, c.contact_email) as customer_email,
          COALESCE(u.cnt, 0) as unread_count, lm.message as last_message
        FROM conversations c
        LEFT JOIN customers cu ON c.customer_id = cu.id
        LEFT JOIN unread u ON u.conversation_id = c.id
        LEFT JOIN latest_msg lm ON lm.conversation_id = c.id
        WHERE c.status = ${status}
        ORDER BY c.last_message_at DESC
      `;
    } else {
      conversations = await sql`
        WITH unread AS (
          SELECT conversation_id, COUNT(*) as cnt
          FROM conversation_messages WHERE is_read = false AND sender_type = 'customer'
          GROUP BY conversation_id
        ), latest_msg AS (
          SELECT DISTINCT ON (conversation_id) conversation_id, message
          FROM conversation_messages ORDER BY conversation_id, created_at DESC
        )
        SELECT c.*,
          COALESCE(cu.first_name || ' ' || cu.last_name, c.contact_name, 'Onbekend') as customer_name,
          COALESCE(cu.email, c.contact_email) as customer_email,
          COALESCE(u.cnt, 0) as unread_count, lm.message as last_message
        FROM conversations c
        LEFT JOIN customers cu ON c.customer_id = cu.id
        LEFT JOIN unread u ON u.conversation_id = c.id
        LEFT JOIN latest_msg lm ON lm.conversation_id = c.id
        ORDER BY c.last_message_at DESC
        LIMIT 100
      `;
    }

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Conversations GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureConversationsTable();
    
    const body = await request.json();
    const { customer_id, subject, message, sender_type, sender_id, sender_name } = body;

    if (!subject || !message || !sender_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create conversation
    const conv = await sql`
      INSERT INTO conversations (customer_id, subject)
      VALUES (${customer_id || null}, ${subject})
      RETURNING *
    `;

    // Add first message
    await sql`
      INSERT INTO conversation_messages (conversation_id, sender_type, sender_id, sender_name, message)
      VALUES (${conv[0].id}, ${sender_type || 'admin'}, ${sender_id || null}, ${sender_name}, ${message})
    `;

    return NextResponse.json({ conversation: conv[0] }, { status: 201 });
  } catch (error) {
    console.error('Conversations POST error:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
