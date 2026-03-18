import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { validateBody, contactSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(contactSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const { name, email, phone, subject, message } = validated.data;

    await sql`INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (${name}, ${email}, ${phone || null}, ${subject || null}, ${message})`;
    return NextResponse.json({ success: true, message: 'Bericht succesvol verzonden' }, { status: 201 });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Bericht verzenden mislukt' }, { status: 500 });
  }
}
