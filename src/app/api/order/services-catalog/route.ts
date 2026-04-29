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

// Statische fallback voor als reparatiepaneel onbereikbaar is. Klant kan
// in dat geval nog steeds een service kiezen + betalen; intake komt later
// alsnog door zodra reparatiepaneel weer bereikbaar is (of we leveren het
// handmatig na). Bedragen zijn incl. 21% btw.
const FALLBACK_SERVICES = [
  { slug: 'wax-behandeling',     upstreamId: 'fallback-wax',     name: 'Wax-behandeling',     description: 'Beschermlaag voor de carrosserie',     category: 'onderhoud', price_eur: 95 },
  { slug: 'grote-schoonmaak',    upstreamId: 'fallback-clean',   name: 'Grote schoonmaak',    description: 'Volledige interieur + exterieur',      category: 'onderhoud', price_eur: 125 },
  { slug: 'ozon-behandeling',    upstreamId: 'fallback-ozon',    name: 'Ozon-behandeling',    description: 'Geur- en bacterieneutralisatie',       category: 'onderhoud', price_eur: 85 },
  { slug: 'banden-controle',     upstreamId: 'fallback-banden',  name: 'Banden-controle',     description: 'Spanning, profiel, leeftijd',          category: 'inspectie', price_eur: 35 },
];

export async function GET() {
  try {
    const res = await fetch(`${HUB}/api/services-public`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return NextResponse.json({ services: FALLBACK_SERVICES, stale: true });
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
        slug: slugify(s.name) || s.id,
        upstreamId: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        price_eur: nicePrice(incl),
      };
    }) || [];
    if (list.length === 0) {
      return NextResponse.json({ services: FALLBACK_SERVICES, stale: true });
    }
    return NextResponse.json({ services: list });
  } catch (error) {
    console.error('Public services catalog error:', error);
    return NextResponse.json({ services: FALLBACK_SERVICES, stale: true });
  }
}
