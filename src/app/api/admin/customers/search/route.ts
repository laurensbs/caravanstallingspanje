import { NextRequest, NextResponse } from 'next/server';
import { searchCustomers, getCustomerByHoldedId } from '@/lib/db';
import { searchContactsInHolded } from '@/lib/holded';

// Zoekt eerst lokaal (snel), dan Holded-contacten die nog niet lokaal
// gekoppeld zijn. Frontend toont beide groepen apart zodat admin een
// Holded-only resultaat kan selecteren en lokaal adopteren.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  if (q.trim().length < 2) {
    return NextResponse.json({ customers: [], holded: [] });
  }

  // 1. Lokaal — instant.
  const customers = await searchCustomers(q, 10).catch(() => []);

  // 2. Holded — alleen contacten waarvan het ID nog niet lokaal bekend is.
  // Gracefully fail-safe als de API down/key ontbreekt; admin krijgt dan
  // gewoon alleen lokale resultaten.
  let holdedExtra: { id: string; name: string; email?: string; phone?: string }[] = [];
  let holdedError: string | null = null;
  try {
    const hits = await searchContactsInHolded(q, 8);
    const filtered: typeof holdedExtra = [];
    for (const c of hits) {
      if (!c.id || !c.name) continue;
      // Skip als lokaal al gekoppeld.
      const linked = await getCustomerByHoldedId(c.id);
      if (linked) continue;
      filtered.push({ id: c.id, name: c.name, email: c.email, phone: c.phone });
    }
    holdedExtra = filtered;
  } catch (err) {
    holdedError = err instanceof Error ? err.message : 'unknown';
    console.error('[customers/search] holded lookup failed:', holdedError);
  }

  return NextResponse.json({ customers, holded: holdedExtra, holdedError });
}
