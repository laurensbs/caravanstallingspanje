import { NextRequest, NextResponse } from 'next/server';
import { getAllLocations, sql } from '@/lib/db';

export async function GET() {
  try {
    const locations = await getAllLocations();
    return NextResponse.json({ locations });
  } catch (error) {
    console.error('Locations GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const result = await sql`INSERT INTO locations (name, address, city, postal_code, country, phone, email, capacity_inside, capacity_outside, is_active) VALUES (${data.name}, ${data.address || null}, ${data.city || null}, ${data.postal_code || null}, ${data.country || 'ES'}, ${data.phone || null}, ${data.email || null}, ${data.capacity_inside || 0}, ${data.capacity_outside || 0}, ${data.is_active !== false}) RETURNING *`;
    return NextResponse.json({ location: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Location POST error:', error);
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  }
}
