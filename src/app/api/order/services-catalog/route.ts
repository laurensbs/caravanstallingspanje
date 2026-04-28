import { NextResponse } from 'next/server';
import { getActiveServices } from '@/lib/db';

// Public — used by the /diensten/service page to render available services.
// Only returns active rows, no internal fields.
export async function GET() {
  try {
    const rows = await getActiveServices();
    return NextResponse.json({
      services: rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        description: r.description,
        price_eur: Number(r.price_eur),
      })),
    });
  } catch (error) {
    console.error('Public services GET error:', error);
    return NextResponse.json({ services: [] });
  }
}
