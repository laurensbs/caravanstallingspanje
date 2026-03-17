import { NextResponse } from 'next/server';
import { getDashboardStats, getRecentActivity } from '@/lib/db';

export async function GET() {
  try {
    const [stats, activity] = await Promise.all([
      getDashboardStats(),
      getRecentActivity(15),
    ]);
    return NextResponse.json({ stats, activity });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
