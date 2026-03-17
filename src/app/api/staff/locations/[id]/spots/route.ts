import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const spots = await sql`SELECT s.*, c.brand as caravan_brand, c.model as caravan_model, c.license_plate as caravan_license_plate, cu.first_name || ' ' || cu.last_name as customer_name FROM spots s LEFT JOIN caravans c ON s.id = c.spot_id AND c.status = 'gestald' LEFT JOIN customers cu ON c.customer_id = cu.id WHERE s.location_id = ${id} ORDER BY s.zone, s.label`;
    return NextResponse.json({ spots });
  } catch (error) {
    console.error('Staff spots error:', error);
    return NextResponse.json({ error: 'Failed to fetch spots' }, { status: 500 });
  }
}
