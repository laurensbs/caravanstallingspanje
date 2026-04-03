import { NextRequest, NextResponse } from 'next/server';
import { getRecentActivity, getEntityActivity } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const entityType = url.searchParams.get('entityType');
    const entityId = url.searchParams.get('entityId');
    const limit = Math.min(200, parseInt(url.searchParams.get('limit') || '50'));

    let activity;
    if (entityType && entityId) {
      activity = await getEntityActivity(entityType, entityId, limit);
    } else {
      activity = await getRecentActivity(limit);
    }

    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Activity GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
