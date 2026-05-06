import { NextResponse } from 'next/server';
import { listPurchaseIntakes } from '@/lib/db';

export async function GET() {
  try {
    const items = await listPurchaseIntakes();
    return NextResponse.json({ items });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
