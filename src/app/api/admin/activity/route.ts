import { NextRequest, NextResponse } from 'next/server';
import { getRecentActivity } from '@/lib/db';
import { log } from '@/lib/log';

export async function GET(req: NextRequest) {
  try {
    const limit = Math.min(200, Math.max(1, Number(req.nextUrl.searchParams.get('limit') || 15)));
    const events = await getRecentActivity(limit);
    return NextResponse.json({ events });
  } catch (err) {
    log.error('admin_activity_failed', err);
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
