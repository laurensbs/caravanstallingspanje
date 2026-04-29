import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/db';
import { getEffectivePrices, getEffectiveStock } from '@/lib/pricing';

// Public read of all user-facing prices: stalling jaarprijs + koelkast-week
// + airco-week + huidige voorraad. Geen auth — staat ook gewoon op de
// publieke formulieren.
export async function GET() {
  try {
    const [stallingMap, fridgePrices, fridgeStock] = await Promise.all([
      getSettings(['stalling_price_binnen', 'stalling_price_buiten']),
      getEffectivePrices(),
      getEffectiveStock(),
    ]);
    return NextResponse.json({
      stalling_binnen: Number(stallingMap.stalling_price_binnen ?? 0),
      stalling_buiten: Number(stallingMap.stalling_price_buiten ?? 0),
      fridge: {
        'Grote koelkast': fridgePrices['Grote koelkast'],
        'Tafelmodel koelkast': fridgePrices['Tafelmodel koelkast'],
        'Airco': fridgePrices['Airco'],
      },
      stock: {
        'Grote koelkast': fridgeStock['Grote koelkast'],
        'Tafelmodel koelkast': fridgeStock['Tafelmodel koelkast'],
        'Airco': fridgeStock['Airco'],
      },
    });
  } catch (error) {
    console.error('Public prices GET error:', error);
    return NextResponse.json({ stalling_binnen: 0, stalling_buiten: 0 });
  }
}
