import { NextResponse } from 'next/server';
import { getRecentActivity } from '@/lib/db';

export async function GET() {
  try {
    const events = await getRecentActivity(15);
    return NextResponse.json({ events });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[admin/activity GET] error:', msg, err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
