import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, phone, interest, storage_type, caravan_brand, caravan_length, services, timeframe, source } = body;

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Geldig e-mailadres vereist' }, { status: 400 });
    }

    // Check if lead with this email already exists
    const existing = await sql`SELECT id FROM leads WHERE email = ${email.toLowerCase().trim()} ORDER BY created_at DESC LIMIT 1`;

    if (existing.length > 0) {
      // Update the existing lead with new info
      await sql`UPDATE leads SET
        name = COALESCE(${name || null}, name),
        phone = COALESCE(${phone || null}, phone),
        interest = COALESCE(${interest || null}, interest),
        storage_type = COALESCE(${storage_type || null}, storage_type),
        caravan_brand = COALESCE(${caravan_brand || null}, caravan_brand),
        caravan_length = COALESCE(${caravan_length || null}, caravan_length),
        services = COALESCE(${services || null}, services),
        timeframe = COALESCE(${timeframe || null}, timeframe),
        source = COALESCE(${source || null}, source)
        WHERE id = ${existing[0].id}`;
      return NextResponse.json({ success: true, updated: true }, { status: 200 });
    }

    await sql`INSERT INTO leads (email, name, phone, interest, storage_type, caravan_brand, caravan_length, services, timeframe, source)
      VALUES (${email.toLowerCase().trim()}, ${name || null}, ${phone || null}, ${interest || null}, ${storage_type || null}, ${caravan_brand || null}, ${caravan_length || null}, ${services || null}, ${timeframe || null}, ${source || 'quiz'})`;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 });
  }
}
