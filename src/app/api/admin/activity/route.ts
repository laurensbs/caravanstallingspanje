import { NextResponse } from 'next/server';
import { getRecentActivity } from '@/lib/db';

export async function GET() {
  try {
    const events = await getRecentActivity(15);
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Activity GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
