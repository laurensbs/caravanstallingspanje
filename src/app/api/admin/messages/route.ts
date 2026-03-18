import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
    const offset = (page - 1) * limit;
    const messages = await sql`SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const cnt = await sql`SELECT COUNT(*) as total FROM contact_messages`;
    return NextResponse.json({ messages, total: Number(cnt[0].total), page, limit });
  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
