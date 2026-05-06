import { NextRequest, NextResponse } from 'next/server';
import { listOpenServiceRequests } from '@/lib/db';

// Lijst alle openstaande klant-service-aanvragen voor admin-dashboard.
export async function GET(_req: NextRequest) {
  const items = await listOpenServiceRequests();
  return NextResponse.json({ items });
}
