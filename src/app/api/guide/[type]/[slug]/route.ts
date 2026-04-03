import { NextRequest, NextResponse } from 'next/server';
import {
  getGuideCampingBySlug, getGuidePlaceBySlug, getGuideBeachBySlug,
  getGuideAttractionBySlug, getGuideRestaurantBySlug, getGuideBlogPostBySlug,
  getGuideImages,
} from '@/lib/db';

const slugLookup: Record<string, { fn: (slug: string) => Promise<Record<string, unknown> | null>; imageType: string }> = {
  campings: { fn: getGuideCampingBySlug, imageType: 'camping' },
  plaatsen: { fn: getGuidePlaceBySlug, imageType: 'place' },
  places: { fn: getGuidePlaceBySlug, imageType: 'place' },
  stranden: { fn: getGuideBeachBySlug, imageType: 'beach' },
  beaches: { fn: getGuideBeachBySlug, imageType: 'beach' },
  bezienswaardigheden: { fn: getGuideAttractionBySlug, imageType: 'attraction' },
  attractions: { fn: getGuideAttractionBySlug, imageType: 'attraction' },
  restaurants: { fn: getGuideRestaurantBySlug, imageType: 'restaurant' },
  blog: { fn: getGuideBlogPostBySlug, imageType: 'blog' },
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ type: string; slug: string }> }) {
  try {
    const { type, slug } = await params;
    const config = slugLookup[type];
    if (!config) return NextResponse.json({ error: 'Ongeldig type' }, { status: 400 });
    const item = await config.fn(slug);
    if (!item) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    const images = await getGuideImages(config.imageType, item.id as number);
    return NextResponse.json({ item, images });
  } catch (error) {
    console.error('Public guide detail error:', error);
    return NextResponse.json({ error: 'Ophalen mislukt' }, { status: 500 });
  }
}
