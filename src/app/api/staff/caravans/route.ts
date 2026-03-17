import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const caravans = await sql`SELECT id, brand, model, license_plate FROM caravans WHERE status = 'gestald' ORDER BY brand, model`;
    return NextResponse.json({ caravans });
  } catch (error) {
    console.error('Staff caravans error:', error);
    return NextResponse.json({ error: 'Failed to fetch caravans' }, { status: 500 });
  }
}
