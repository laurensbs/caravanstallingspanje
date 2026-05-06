// Server-side fetcher voor de aangesloten-campings data.
//
// Master = caravanverhuur admin-paneel: /api/campings publiek endpoint
// op caravanverhuurspanje.com. Daar beheert eigenaar live de namen,
// websites, beschrijvingen, faciliteiten en foto-URLs (cubeupload).
//
// Fallback = lokale campings-data.ts (kopie uit caravanverhuur repo)
// als de hub onbereikbaar is. ISR met 5 min revalidate zodat updates
// binnen 5 min op de stallings-site verschijnen.

import { campings as fallbackCampings, type Camping } from './campings-data';

const HUB =
  (process.env.CARAVANVERHUUR_URL || 'https://caravanverhuurspanje.com').replace(/\/$/, '');

type ApiCamping = {
  id: string | number;
  name: string;
  slug: string;
  location: string;
  region: string;
  description: string;
  longDescription?: string;
  website?: string;
  photos?: string[];
  coordinates?: { lat: number; lng: number };
  facilities?: string[];
  nearestDestinations?: string[];
  bestFor?: string[];
  active?: boolean;
};

function normalizeApiCamping(c: ApiCamping): Camping {
  return {
    id: String(c.id),
    name: c.name,
    slug: c.slug,
    location: c.location,
    region: (c.region as Camping['region']) || 'Baix Empordà',
    description: c.description,
    longDescription: c.longDescription,
    website: c.website,
    photos: Array.isArray(c.photos) ? c.photos : [],
    coordinates: c.coordinates || { lat: 0, lng: 0 },
    facilities: Array.isArray(c.facilities) ? c.facilities : [],
    nearestDestinations: Array.isArray(c.nearestDestinations) ? c.nearestDestinations : [],
    bestFor: Array.isArray(c.bestFor) ? c.bestFor : [],
  };
}

export async function fetchAffiliateCampings(): Promise<{
  campings: Camping[];
  source: 'hub' | 'fallback';
}> {
  try {
    const res = await fetch(`${HUB}/api/campings`, {
      next: { revalidate: 300 }, // 5 minuten ISR
    });
    if (!res.ok) {
      console.warn('[campings] hub returned', res.status, '- using fallback');
      return { campings: fallbackCampings, source: 'fallback' };
    }
    const data = await res.json();
    const list = Array.isArray(data?.campings) ? data.campings as ApiCamping[] : [];
    if (list.length === 0) {
      return { campings: fallbackCampings, source: 'fallback' };
    }
    return { campings: list.map(normalizeApiCamping), source: 'hub' };
  } catch (err) {
    console.warn('[campings] hub fetch failed, using fallback:', err);
    return { campings: fallbackCampings, source: 'fallback' };
  }
}

export type { Camping };
