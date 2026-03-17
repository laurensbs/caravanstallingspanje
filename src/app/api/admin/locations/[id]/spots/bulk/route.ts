import { NextRequest, NextResponse } from 'next/server';
import { bulkCreateSpots } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const { zone, spot_type, prefix, count } = data;
    await bulkCreateSpots(Number(id), zone, spot_type, prefix, Number(count));
    return NextResponse.json({ success: true, created: Number(count) }, { status: 201 });
  } catch (error) {
    console.error('Bulk spots error:', error);
    return NextResponse.json({ error: 'Failed to create spots' }, { status: 500 });
  }
}
