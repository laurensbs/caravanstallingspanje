import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    const staff = await sql`SELECT s.id, s.first_name, s.last_name, s.email, s.phone, s.role, s.location_id, s.is_active, s.created_at, s.updated_at, l.name as location_name FROM staff s LEFT JOIN locations l ON s.location_id = l.id ORDER BY s.is_active DESC, s.first_name`;
    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Staff GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.email || !data.password || !data.first_name || !data.last_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const password_hash = await hashPassword(data.password);
    const result = await sql`INSERT INTO staff (first_name, last_name, email, phone, password_hash, role, location_id) VALUES (${data.first_name}, ${data.last_name}, ${data.email}, ${data.phone || null}, ${password_hash}, ${data.role || 'medewerker'}, ${data.location_id || null}) RETURNING id, first_name, last_name, email, role`;
    return NextResponse.json({ staff: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Staff POST error:', error);
    return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 });
  }
}
