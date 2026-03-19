import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { checkAvailabilitySchema, validateBody } from '@/lib/validations';

const sql = neon(process.env.DATABASE_URL || '');

// POST /api/booking/check-availability — Check available spots
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateBody(checkAvailabilitySchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { storageType, locationId } = validation.data;
    const spotType = storageType === 'binnen' ? 'binnen' : 'buiten';

    // Count available spots
    const available = await sql`
      SELECT COUNT(*) as count 
      FROM spots 
      WHERE location_id = ${locationId} 
      AND spot_type = ${spotType} 
      AND status = 'vrij'
    `;

    const total = await sql`
      SELECT COUNT(*) as count 
      FROM spots 
      WHERE location_id = ${locationId} 
      AND spot_type = ${spotType}
    `;

    const locations = await sql`
      SELECT id, name, city, address 
      FROM locations 
      WHERE is_active = true 
      ORDER BY name
    `;

    const pricing: Record<string, number> = {
      buiten: 65,
      binnen: 95,
    };

    return NextResponse.json({
      available: Number(available[0]?.count || 0),
      total: Number(total[0]?.count || 0),
      monthlyRate: pricing[storageType] || 65,
      locations,
    });
  } catch {
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 });
  }
}
