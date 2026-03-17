import { NextRequest, NextResponse } from 'next/server';
import { getSpotsByLocation, sql } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const spots = await getSpotsByLocation(Number(id));
    return NextResponse.json({ spots });
  } catch (error) {
    console.error('Spots GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch spots' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const result = await sql`INSERT INTO spots (location_id, label, zone, spot_type, status) VALUES (${id}, ${data.label}, ${data.zone || 'A'}, ${data.spot_type || 'buiten'}, ${data.status || 'vrij'}) RETURNING *`;
    return NextResponse.json({ spot: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Spot POST error:', error);
    return NextResponse.json({ error: 'Failed to create spot' }, { status: 500 });
  }
}
