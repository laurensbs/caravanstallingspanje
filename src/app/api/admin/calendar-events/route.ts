import { NextRequest, NextResponse } from 'next/server';
import { listCalendarEvents, getAllTransportRequests } from '@/lib/db';

// Alle events ±60 dagen + alle transport-aanvragen erbij voor de planning-UI.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const fromParam = url.searchParams.get('from');
  const toParam = url.searchParams.get('to');

  const now = new Date();
  const from = fromParam || new Date(now.getTime() - 14 * 86400_000).toISOString();
  const to = toParam || new Date(now.getTime() + 90 * 86400_000).toISOString();

  const [events, transports] = await Promise.all([
    listCalendarEvents({ from, to, limit: 500 }),
    getAllTransportRequests(),
  ]);
  return NextResponse.json({ events, transports });
}
