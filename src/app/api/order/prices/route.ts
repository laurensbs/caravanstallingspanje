import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/db';

// Public read of just the user-facing prices. No auth required — these
// are the same numbers we render on the form anyway.
export async function GET() {
  try {
    const map = await getSettings([
      'stalling_price_binnen',
      'stalling_price_buiten',
    ]);
    return NextResponse.json({
      stalling_binnen: Number(map.stalling_price_binnen ?? 0),
      stalling_buiten: Number(map.stalling_price_buiten ?? 0),
    });
  } catch (error) {
    console.error('Public prices GET error:', error);
    return NextResponse.json({ stalling_binnen: 0, stalling_buiten: 0 });
  }
}
