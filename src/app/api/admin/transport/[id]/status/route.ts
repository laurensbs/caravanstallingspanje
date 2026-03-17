import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    if (status === 'afgeleverd') {
      await sql`UPDATE transport_orders SET status = 'afgeleverd', completed_date = NOW(), updated_at = NOW() WHERE id = ${id}`;
    } else {
      await sql`UPDATE transport_orders SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Transport status error:', error);
    return NextResponse.json({ error: 'Failed to update transport status' }, { status: 500 });
  }
}
