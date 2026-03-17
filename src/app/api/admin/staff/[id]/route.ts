import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    if (data.is_active !== undefined) {
      await sql`UPDATE staff SET is_active = ${data.is_active}, updated_at = NOW() WHERE id = ${id}`;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Staff PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}
