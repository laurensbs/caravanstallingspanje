import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    if (status === 'afgerond') {
      await sql`UPDATE tasks SET status = 'afgerond', completed_at = NOW(), updated_at = NOW() WHERE id = ${id}`;
    } else {
      await sql`UPDATE tasks SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Staff task status error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
