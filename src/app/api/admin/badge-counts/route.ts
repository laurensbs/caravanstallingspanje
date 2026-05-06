import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { log } from '@/lib/log';

// Pending-counts per admin-area, voor sidebar-badges. "Pending" = waar de
// admin nog actie op moet ondernemen (status review/open/new/onbeantwoord).
// Géén 24h-window — een idee uit vorige week dat nog op 'new' staat hoort
// ook getelt te worden.
//
// Cache: dynamic (no-store). Sidebar polled elke 30s; geen DB-storm.

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type CountMap = {
  stalling: number;
  transport: number;
  fridge: number;
  contact: number;
  ideas: number;
  waitlist: number;
  service_requests: number;
};

async function safeCount(promise: Promise<{ count: number | string }[]>): Promise<number> {
  try {
    const rows = await promise;
    const c = rows[0]?.count;
    return typeof c === 'number' ? c : Number(c ?? 0);
  } catch {
    return 0;
  }
}

export async function GET() {
  try {
    const [stalling, transport, fridge, contact, ideas, waitlist, service_requests] = await Promise.all([
      safeCount(sql`SELECT COUNT(*)::int AS count FROM stalling_requests WHERE status = 'controleren'` as unknown as Promise<{ count: number }[]>),
      safeCount(sql`SELECT COUNT(*)::int AS count FROM transport_requests WHERE status = 'controleren'` as unknown as Promise<{ count: number }[]>),
      safeCount(sql`SELECT COUNT(*)::int AS count FROM fridge_bookings WHERE status = 'controleren'` as unknown as Promise<{ count: number }[]>),
      safeCount(sql`SELECT COUNT(*)::int AS count FROM contact_messages WHERE status = 'open'` as unknown as Promise<{ count: number }[]>),
      safeCount(sql`SELECT COUNT(*)::int AS count FROM ideas WHERE status = 'new'` as unknown as Promise<{ count: number }[]>),
      safeCount(sql`SELECT COUNT(*)::int AS count FROM fridge_waitlist WHERE status = 'wachtend'` as unknown as Promise<{ count: number }[]>),
      safeCount(sql`SELECT COUNT(*)::int AS count FROM customer_service_requests WHERE status IN ('new', 'in_progress')` as unknown as Promise<{ count: number }[]>),
    ]);

    const counts: CountMap = { stalling, transport, fridge, contact, ideas, waitlist, service_requests };
    return NextResponse.json(counts, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    log.error('admin_badge_counts_failed', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
