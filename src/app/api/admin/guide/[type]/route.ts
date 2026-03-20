import { NextRequest, NextResponse } from 'next/server';
import {
  getGuideCampings, createGuideCamping, getGuidePlaces, createGuidePlace,
  getGuideBeaches, createGuideBeach, getGuideAttractions, createGuideAttraction,
  getGuideRestaurants, createGuideRestaurant, getGuideBlogPosts, createGuideBlogPost,
} from '@/lib/db';
import { validateBody, guideCampingSchema, guidePlaceSchema, guideBeachSchema, guideAttractionSchema, guideRestaurantSchema, guideBlogPostSchema } from '@/lib/validations';

const typeConfig = {
  campings: { get: getGuideCampings, create: createGuideCamping, schema: guideCampingSchema },
  plaatsen: { get: getGuidePlaces, create: createGuidePlace, schema: guidePlaceSchema },
  stranden: { get: getGuideBeaches, create: createGuideBeach, schema: guideBeachSchema },
  bezienswaardigheden: { get: getGuideAttractions, create: createGuideAttraction, schema: guideAttractionSchema },
  restaurants: { get: getGuideRestaurants, create: createGuideRestaurant, schema: guideRestaurantSchema },
  blog: { get: getGuideBlogPosts, create: createGuideBlogPost, schema: guideBlogPostSchema },
} as const;

type GuideType = keyof typeof typeConfig;

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  try {
    const { type } = await params;
    if (!(type in typeConfig)) return NextResponse.json({ error: 'Ongeldig type' }, { status: 400 });
    const config = typeConfig[type as GuideType];
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const region = url.searchParams.get('region') || '';

    let result;
    if (type === 'campings') {
      const stars = url.searchParams.get('stars') ? parseInt(url.searchParams.get('stars')!) : undefined;
      result = await (config.get as typeof getGuideCampings)(page, limit, search, region, stars);
    } else if (type === 'stranden') {
      const beachType = url.searchParams.get('beach_type') || '';
      result = await (config.get as typeof getGuideBeaches)(page, limit, search, region, beachType);
    } else if (type === 'bezienswaardigheden') {
      const category = url.searchParams.get('category') || '';
      result = await (config.get as typeof getGuideAttractions)(page, limit, search, region, category);
    } else if (type === 'restaurants') {
      const cuisineType = url.searchParams.get('cuisine_type') || '';
      result = await (config.get as typeof getGuideRestaurants)(page, limit, search, region, cuisineType);
    } else if (type === 'blog') {
      const category = url.searchParams.get('category') || '';
      result = await (config.get as typeof getGuideBlogPosts)(page, limit, search, category, false);
    } else {
      result = await (config.get as typeof getGuidePlaces)(page, limit, search, region);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Guide GET error:', error);
    return NextResponse.json({ error: 'Ophalen mislukt' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  try {
    const { type } = await params;
    if (!(type in typeConfig)) return NextResponse.json({ error: 'Ongeldig type' }, { status: 400 });
    const config = typeConfig[type as GuideType];
    const body = await req.json();
    const validated = validateBody(config.schema as Parameters<typeof validateBody>[0], body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const item = await config.create(validated.data as Record<string, unknown>);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'Slug bestaat al' }, { status: 409 });
    }
    console.error('Guide POST error:', error);
    return NextResponse.json({ error: 'Aanmaken mislukt' }, { status: 500 });
  }
}
