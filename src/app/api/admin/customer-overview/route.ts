import { NextRequest, NextResponse } from 'next/server';
import { getCustomerOverview } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
    const overview = await getCustomerOverview(email);
    return NextResponse.json(overview);
  } catch (error) {
    console.error('Customer overview GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch overview' }, { status: 500 });
  }
}
