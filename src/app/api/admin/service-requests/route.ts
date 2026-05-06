import { NextRequest, NextResponse } from 'next/server';
import { listServiceRequestsForAdmin } from '@/lib/db';

const VALID_STATUS = new Set(['new', 'in_progress', 'done', 'cancelled', 'all']);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const statusParam = url.searchParams.get('status') || 'all';
  const status = VALID_STATUS.has(statusParam) ? statusParam as 'new' | 'in_progress' | 'done' | 'cancelled' | 'all' : 'all';
  const items = await listServiceRequestsForAdmin({ status });
  return NextResponse.json({ items });
}
