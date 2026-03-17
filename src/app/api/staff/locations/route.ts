import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const locations = await sql`SELECT l.*, (SELECT COUNT(*) FROM spots WHERE location_id = l.id) as total_spots, (SELECT COUNT(*) FROM spots WHERE location_id = l.id AND status = 'bezet') as occupied_spots FROM locations l WHERE l.is_active = true ORDER BY l.name`;
    return NextResponse.json({ locations });
  } catch (error) {
    console.error('Staff locations error:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}
