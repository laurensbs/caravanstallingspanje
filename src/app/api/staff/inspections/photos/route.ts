import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Upload inspection photo (base64)
export async function POST(req: NextRequest) {
  try {
    const staffId = req.headers.get('x-staff-id');
    if (!staffId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { inspection_id, photo_data, caption } = data;

    if (!inspection_id || !photo_data) {
      return NextResponse.json({ error: 'inspection_id and photo_data required' }, { status: 400 });
    }

    // Validate base64 starts with data:image
    if (!photo_data.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
    }

    // Limit to ~5MB base64
    if (photo_data.length > 7_000_000) {
      return NextResponse.json({ error: 'Image too large (max 5MB)' }, { status: 400 });
    }

    // Ensure inspection_photos table exists
    await sql`CREATE TABLE IF NOT EXISTS inspection_photos (
      id SERIAL PRIMARY KEY,
      inspection_id INTEGER NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
      photo_data TEXT NOT NULL,
      caption TEXT,
      taken_by INTEGER,
      taken_at TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    )`;

    const result = await sql`
      INSERT INTO inspection_photos (inspection_id, photo_data, caption, taken_by, taken_at)
      VALUES (${inspection_id}, ${photo_data}, ${caption || null}, ${staffId}, NOW())
      RETURNING id, inspection_id, caption, taken_at, created_at
    `;

    // Update inspection photos count
    const count = await sql`SELECT COUNT(*) as cnt FROM inspection_photos WHERE inspection_id = ${inspection_id}`;

    return NextResponse.json({ 
      photo: { ...result[0], has_photo: true },
      total_photos: parseInt(count[0].cnt)
    }, { status: 201 });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}

// Get photos for an inspection
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const inspectionId = url.searchParams.get('inspection_id');

    if (!inspectionId) {
      return NextResponse.json({ error: 'inspection_id required' }, { status: 400 });
    }

    const photos = await sql`
      SELECT id, inspection_id, photo_data, caption, taken_at 
      FROM inspection_photos 
      WHERE inspection_id = ${inspectionId} 
      ORDER BY taken_at DESC
    `;

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Photos GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}
