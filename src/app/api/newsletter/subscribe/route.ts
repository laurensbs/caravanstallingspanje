import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'E-mailadres is verplicht' }, { status: 400 });
    }
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 });
    }

    // Create table if not exists
    await sql`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      subscribed_at TIMESTAMPTZ DEFAULT NOW(),
      unsubscribed_at TIMESTAMPTZ,
      active BOOLEAN DEFAULT true
    )`;

    // Upsert: reactivate if previously unsubscribed
    await sql`INSERT INTO newsletter_subscribers (email, active, subscribed_at, unsubscribed_at)
      VALUES (${trimmed}, true, NOW(), NULL)
      ON CONFLICT (email) DO UPDATE SET active = true, subscribed_at = NOW(), unsubscribed_at = NULL`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json({ error: 'Inschrijving mislukt' }, { status: 500 });
  }
}
