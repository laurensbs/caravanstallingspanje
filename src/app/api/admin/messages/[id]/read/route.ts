import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`UPDATE contact_messages SET is_read = true WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Message read error:', error);
    return NextResponse.json({ error: 'Failed to mark message as read' }, { status: 500 });
  }
}
