import { NextResponse } from 'next/server';
import { listContactsPaginated } from '@/lib/holded';

// Diagnose-endpoint: checkt of HOLDED_API_KEY werkt door één pagina op
// te halen. Bij success: aantal contacten op pagina 1. Bij fail: de
// echte foutmelding (401 = key fout, 429 = rate limit, etc).
export async function GET() {
  const hasKey = !!process.env.HOLDED_API_KEY;
  if (!hasKey) {
    return NextResponse.json({
      ok: false,
      error: 'HOLDED_API_KEY ontbreekt op de server. Voeg toe in Vercel → Settings → Environment Variables.',
      hasKey: false,
    }, { status: 503 });
  }
  try {
    const batch = await listContactsPaginated(1, 5);
    return NextResponse.json({
      ok: true,
      hasKey: true,
      sampleCount: Array.isArray(batch) ? batch.length : 0,
      sampleIds: Array.isArray(batch) ? batch.slice(0, 3).map((c) => c.id) : [],
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      hasKey: true,
      error: err instanceof Error ? err.message : 'unknown',
    }, { status: 502 });
  }
}
