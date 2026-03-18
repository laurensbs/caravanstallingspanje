import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { put } from '@vercel/blob';

// Upload inspection photo — now uses Vercel Blob storage
export async function POST(req: NextRequest) {
  try {
    const staffId = req.headers.get('x-staff-id');
    if (!staffId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('photo') as File | null;
    const inspectionId = formData.get('inspection_id') as string;
    const caption = formData.get('caption') as string || null;

    // Also support legacy base64 JSON format
    if (!file) {
      const data = await req.clone().json().catch(() => null);
      if (data?.photo_data && data?.inspection_id) {
        return handleBase64Upload(data.inspection_id, data.photo_data, data.caption, staffId);
      }
      return NextResponse.json({ error: 'photo file or photo_data required' }, { status: 400 });
    }

    if (!inspectionId) {
      return NextResponse.json({ error: 'inspection_id required' }, { status: 400 });
    }

    // Validate
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large (max 5MB)' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid image type' }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(`inspections/${inspectionId}/${Date.now()}-${file.name}`, file, {
      access: 'public',
      contentType: file.type,
    });

    // Ensure table exists
    await sql`CREATE TABLE IF NOT EXISTS inspection_photos (
      id SERIAL PRIMARY KEY,
      inspection_id INTEGER NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
      photo_url TEXT NOT NULL,
      photo_data TEXT,
      caption TEXT,
      taken_by INTEGER,
      taken_at TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    )`;

    // Add column if missing (for existing deployments)
    await sql`ALTER TABLE inspection_photos ADD COLUMN IF NOT EXISTS photo_url TEXT`;

    const result = await sql`
      INSERT INTO inspection_photos (inspection_id, photo_url, caption, taken_by, taken_at)
      VALUES (${inspectionId}, ${blob.url}, ${caption}, ${staffId}, NOW())
      RETURNING id, inspection_id, photo_url, caption, taken_at, created_at
    `;

    const count = await sql`SELECT COUNT(*) as cnt FROM inspection_photos WHERE inspection_id = ${inspectionId}`;

    return NextResponse.json({ 
      photo: { ...result[0], has_photo: true },
      total_photos: parseInt(count[0].cnt)
    }, { status: 201 });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}

// Legacy base64 handler (for backwards compatibility)
async function handleBase64Upload(inspectionId: string, photoData: string, caption: string | null, staffId: string) {
  if (!photoData.startsWith('data:image/')) {
    return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
  }
  if (photoData.length > 7_000_000) {
    return NextResponse.json({ error: 'Image too large (max 5MB)' }, { status: 400 });
  }

  // Convert base64 to blob upload
  const base64Content = photoData.split(',')[1];
  const mimeType = photoData.split(';')[0].split(':')[1];
  const buffer = Buffer.from(base64Content, 'base64');
  const blob = await put(`inspections/${inspectionId}/${Date.now()}.jpg`, buffer, {
    access: 'public',
    contentType: mimeType,
  });

  await sql`CREATE TABLE IF NOT EXISTS inspection_photos (
    id SERIAL PRIMARY KEY,
    inspection_id INTEGER NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    photo_data TEXT,
    caption TEXT,
    taken_by INTEGER,
    taken_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`ALTER TABLE inspection_photos ADD COLUMN IF NOT EXISTS photo_url TEXT`;

  const result = await sql`
    INSERT INTO inspection_photos (inspection_id, photo_url, caption, taken_by, taken_at)
    VALUES (${inspectionId}, ${blob.url}, ${caption}, ${staffId}, NOW())
    RETURNING id, inspection_id, photo_url, caption, taken_at, created_at
  `;
  const count = await sql`SELECT COUNT(*) as cnt FROM inspection_photos WHERE inspection_id = ${inspectionId}`;

  return NextResponse.json({ 
    photo: { ...result[0], has_photo: true },
    total_photos: parseInt(count[0].cnt)
  }, { status: 201 });
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
      SELECT id, inspection_id, COALESCE(photo_url, photo_data) as photo_url, caption, taken_at 
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
