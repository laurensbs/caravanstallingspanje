import { NextRequest, NextResponse } from 'next/server';
import { getCustomerOverview } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
    const overview = await getCustomerOverview(email);
    return NextResponse.json(overview);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[admin/customer-overview GET] error:', msg, err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
