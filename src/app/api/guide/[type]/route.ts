import { NextRequest, NextResponse } from 'next/server';
import {
  getGuideCampings, getGuidePlaces, getGuideBeaches,
  getGuideAttractions, getGuideRestaurants, getGuideBlogPosts,
  getGuideFeatured, getGuideStats,
} from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  try {
    const { type: rawType } = await params;
    // Accept both Dutch and English type names
    const typeAliases: Record<string, string> = {
      places: 'plaatsen', beaches: 'stranden', attractions: 'bezienswaardigheden',
    };
    const type = typeAliases[rawType] || rawType;
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
    const search = url.searchParams.get('search') || '';
    const region = url.searchParams.get('region') || '';

    if (type === 'featured') {
      const featured = await getGuideFeatured();
      const stats = await getGuideStats();
      return NextResponse.json({ ...featured, stats });
    }

    if (type === 'campings') {
      const stars = url.searchParams.get('stars') ? parseInt(url.searchParams.get('stars')!) : undefined;
      return NextResponse.json(await getGuideCampings(page, limit, search, region, stars));
    }
    if (type === 'plaatsen') return NextResponse.json(await getGuidePlaces(page, limit, search, region));
    if (type === 'stranden') {
      const beachType = url.searchParams.get('beach_type') || '';
      return NextResponse.json(await getGuideBeaches(page, limit, search, region, beachType));
    }
    if (type === 'bezienswaardigheden') {
      const category = url.searchParams.get('category') || '';
      return NextResponse.json(await getGuideAttractions(page, limit, search, region, category));
    }
    if (type === 'restaurants') {
      const cuisineType = url.searchParams.get('cuisine_type') || '';
      return NextResponse.json(await getGuideRestaurants(page, limit, search, region, cuisineType));
    }
    if (type === 'blog') {
      const category = url.searchParams.get('category') || '';
      return NextResponse.json(await getGuideBlogPosts(page, limit, search, category, true));
    }

    return NextResponse.json({ error: 'Ongeldig type' }, { status: 400 });
  } catch (error) {
    console.error('Public guide GET error:', error);
    return NextResponse.json({ error: 'Ophalen mislukt' }, { status: 500 });
  }
}
