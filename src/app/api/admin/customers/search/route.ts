import { NextRequest, NextResponse } from 'next/server';
import { searchCustomers } from '@/lib/db';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  if (q.trim().length < 2) {
    return NextResponse.json({ customers: [] });
  }
  try {
    const customers = await searchCustomers(q, 10);
    return NextResponse.json({ customers });
  } catch (err) {
    console.error('customer search error:', err);
    return NextResponse.json({ error: 'search failed' }, { status: 500 });
  }
}
