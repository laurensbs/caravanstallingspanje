import { NextResponse } from 'next/server';

// Public catalog read. We're now the consumer — the master is the
// reparatiepaneel project at HUB_INBOX_URL. We add VAT to the ex-VAT prices
// and round to a "nice" number so customers see clean amounts.
function nicePrice(eur: number): number {
  // Round so the cents end on .00 / .50 / .95 — whichever is closer below.
  const candidates = [
    Math.floor(eur),
    Math.floor(eur) + 0.5,
    Math.floor(eur) + 0.95,
    Math.ceil(eur),
  ];
  let best = candidates[0];
  let bestDelta = Math.abs(eur - best);
  for (const c of candidates) {
    const d = Math.abs(eur - c);
    if (d < bestDelta) {
      bestDelta = d;
      best = c;
    }
  }
  return best;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const HUB = (process.env.HUB_INBOX_URL || 'https://caravanreparatiespanje.vercel.app').replace(/\/$/, '');

export async function GET() {
  try {
    const res = await fetch(`${HUB}/api/services-public`, {
      // Light cache so we don't hit the workshop on every page-load.
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return NextResponse.json({ services: [] });
    }
    const data = await res.json();
    type Raw = {
      id: string;
      name: string;
      description: string | null;
      category: string | null;
      priceExclVat: number;
      taxPercent: number;
    };
    const list = (data.services as Raw[] | undefined)?.map((s) => {
      const incl = s.priceExclVat * (1 + (s.taxPercent ?? 21) / 100);
      return {
        // Reuse the upstream id as our slug — stable across requests.
        slug: slugify(s.name) || s.id,
        upstreamId: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        // Frontend uses this; cleaned up to a nice round amount.
        price_eur: nicePrice(incl),
      };
    }) || [];
    return NextResponse.json({ services: list });
  } catch (error) {
    console.error('Public services catalog error:', error);
    return NextResponse.json({ services: [] });
  }
}
