import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '25');
    const status = url.searchParams.get('status');
    const offset = (page - 1) * limit;

    let rows, countResult;
    if (status) {
      rows = await sql`SELECT * FROM leads WHERE status = ${status} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      countResult = await sql`SELECT COUNT(*) as count FROM leads WHERE status = ${status}`;
    } else {
      rows = await sql`SELECT * FROM leads ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      countResult = await sql`SELECT COUNT(*) as count FROM leads`;
    }

    return NextResponse.json({ leads: rows, total: parseInt(countResult[0].count) });
  } catch (error) {
    console.error('Leads fetch error:', error);
    return NextResponse.json({ error: 'Fout bij ophalen leads' }, { status: 500 });
  }
}
