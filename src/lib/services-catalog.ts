// Server-side fetcher voor de services-catalogus die in het reparatie-
// paneel beheerd wordt. Lokale fallback als de hub onbereikbaar is.
//
// Gebruikt door /tarieven en /diensten Specialiteiten zodat alle prijzen
// op de website één source-of-truth hebben — de master in reparatie-paneel.

export interface PublicService {
  slug: string;
  upstreamId: string;
  name: string;
  description: string | null;
  category: string | null;
  /** Inclusief BTW, afgerond op .00/.50/.95. */
  priceEur: number;
}

const HUB = (process.env.HUB_INBOX_URL || 'https://caravanreparatiespanje.vercel.app').replace(/\/$/, '');

const FALLBACK: PublicService[] = [
  { slug: 'wax-behandeling',     upstreamId: 'fallback-wax',    name: 'Wax-behandeling',     description: 'Beschermlaag voor de carrosserie',    category: 'onderhoud',  priceEur: 95 },
  { slug: 'grote-schoonmaak',    upstreamId: 'fallback-clean',  name: 'Grote schoonmaak',    description: 'Volledige interieur + exterieur',     category: 'schoonmaak', priceEur: 125 },
  { slug: 'ozon-behandeling',    upstreamId: 'fallback-ozon',   name: 'Ozon-behandeling',    description: 'Geur- en bacterieneutralisatie',      category: 'onderhoud',  priceEur: 85 },
  { slug: 'banden-controle',     upstreamId: 'fallback-banden', name: 'Banden-controle',     description: 'Spanning, profiel, leeftijd',         category: 'inspectie',  priceEur: 35 },
];

function nicePrice(eur: number): number {
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
    if (d < bestDelta) { bestDelta = d; best = c; }
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

export async function fetchServicesCatalog(): Promise<{ services: PublicService[]; stale: boolean }> {
  try {
    const res = await fetch(`${HUB}/api/services-public`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return { services: FALLBACK, stale: true };
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
        priceEur: nicePrice(incl),
      } as PublicService;
    }) || [];
    if (list.length === 0) return { services: FALLBACK, stale: true };
    return { services: list, stale: false };
  } catch (err) {
    console.warn('[services-catalog] fetch failed, using fallback:', err);
    return { services: FALLBACK, stale: true };
  }
}

/** Groepeert services per category-key. Onbekende categories krijgen 'overig'. */
export function groupByCategory(services: PublicService[]): Record<string, PublicService[]> {
  const map: Record<string, PublicService[]> = {};
  for (const s of services) {
    const key = (s.category || 'overig').toLowerCase();
    if (!map[key]) map[key] = [];
    map[key].push(s);
  }
  return map;
}
