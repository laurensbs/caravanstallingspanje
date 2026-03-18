import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { validateBody, contactSchema } from '@/lib/validations';
import { sendContactConfirmation, sendContactNotificationToAdmin } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(contactSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const { name, email, phone, subject, message } = validated.data;

    // Store the contact message
    await sql`INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (${name}, ${email}, ${phone || null}, ${subject || null}, ${message})`;

    // Also create a conversation so admin can reply via berichten
    await sql`CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY, customer_id INTEGER, subject TEXT NOT NULL,
      status TEXT DEFAULT 'open', contact_email TEXT, contact_name TEXT,
      last_message_at TIMESTAMP DEFAULT NOW(), created_at TIMESTAMP DEFAULT NOW()
    )`;
    await sql`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS contact_email TEXT`;
    await sql`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS contact_name TEXT`;
    await sql`CREATE TABLE IF NOT EXISTS conversation_messages (
      id SERIAL PRIMARY KEY, conversation_id INTEGER NOT NULL,
      sender_type TEXT NOT NULL, sender_id INTEGER, sender_name TEXT NOT NULL,
      message TEXT NOT NULL, is_read BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT NOW()
    )`;

    // Check if visitor is an existing customer
    const existing = await sql`SELECT id FROM customers WHERE email = ${email} LIMIT 1`;
    const customerId = existing.length > 0 ? existing[0].id : null;

    const conv = await sql`INSERT INTO conversations (customer_id, subject, contact_email, contact_name) VALUES (${customerId}, ${subject || 'Contactformulier'}, ${email}, ${name}) RETURNING id`;
    await sql`INSERT INTO conversation_messages (conversation_id, sender_type, sender_name, message) VALUES (${conv[0].id}, 'customer', ${name}, ${message})`;

    // Send confirmation email to the sender
    await sendContactConfirmation(email, { name, subject: subject || '' });

    // Send notification to admin
    await sendContactNotificationToAdmin({ name, email, phone: phone || '', subject: subject || '', message });

    return NextResponse.json({ success: true, message: 'Bericht succesvol verzonden' }, { status: 201 });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Bericht verzenden mislukt' }, { status: 500 });
  }
}
