import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json();
    if (!name || !email || !message) return NextResponse.json({ error: 'Naam, e-mail en bericht zijn verplicht' }, { status: 400 });

    await sql`INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (${name}, ${email}, ${phone || null}, ${subject || null}, ${message})`;
    return NextResponse.json({ success: true, message: 'Bericht succesvol verzonden' }, { status: 201 });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Bericht verzenden mislukt' }, { status: 500 });
  }
}
