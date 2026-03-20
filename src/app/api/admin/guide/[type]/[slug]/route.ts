import { NextRequest, NextResponse } from 'next/server';
import {
  getGuideCampingBySlug, updateGuideCamping, deleteGuideCamping,
  getGuidePlaceBySlug, updateGuidePlace, deleteGuidePlace,
  getGuideBeachBySlug, updateGuideBeach, deleteGuideBeach,
  getGuideAttractionBySlug, updateGuideAttraction, deleteGuideAttraction,
  getGuideRestaurantBySlug, updateGuideRestaurant, deleteGuideRestaurant,
  getGuideBlogPostBySlug, updateGuideBlogPost, deleteGuideBlogPost,
  getGuideImages,
} from '@/lib/db';
import { validateBody, guideCampingSchema, guidePlaceSchema, guideBeachSchema, guideAttractionSchema, guideRestaurantSchema, guideBlogPostSchema } from '@/lib/validations';

const typeConfig = {
  campings: { getBySlug: getGuideCampingBySlug, update: updateGuideCamping, delete: deleteGuideCamping, schema: guideCampingSchema, imageType: 'camping' },
  plaatsen: { getBySlug: getGuidePlaceBySlug, update: updateGuidePlace, delete: deleteGuidePlace, schema: guidePlaceSchema, imageType: 'place' },
  stranden: { getBySlug: getGuideBeachBySlug, update: updateGuideBeach, delete: deleteGuideBeach, schema: guideBeachSchema, imageType: 'beach' },
  bezienswaardigheden: { getBySlug: getGuideAttractionBySlug, update: updateGuideAttraction, delete: deleteGuideAttraction, schema: guideAttractionSchema, imageType: 'attraction' },
  restaurants: { getBySlug: getGuideRestaurantBySlug, update: updateGuideRestaurant, delete: deleteGuideRestaurant, schema: guideRestaurantSchema, imageType: 'restaurant' },
  blog: { getBySlug: getGuideBlogPostBySlug, update: updateGuideBlogPost, delete: deleteGuideBlogPost, schema: guideBlogPostSchema, imageType: 'blog' },
} as const;

type GuideType = keyof typeof typeConfig;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ type: string; slug: string }> }) {
  try {
    const { type, slug } = await params;
    if (!(type in typeConfig)) return NextResponse.json({ error: 'Ongeldig type' }, { status: 400 });
    const config = typeConfig[type as GuideType];
    const item = await config.getBySlug(slug);
    if (!item) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    const images = await getGuideImages(config.imageType, item.id);
    return NextResponse.json({ item, images });
  } catch (error) {
    console.error('Guide detail GET error:', error);
    return NextResponse.json({ error: 'Ophalen mislukt' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ type: string; slug: string }> }) {
  try {
    const { type, slug } = await params;
    if (!(type in typeConfig)) return NextResponse.json({ error: 'Ongeldig type' }, { status: 400 });
    const config = typeConfig[type as GuideType];
    const existing = await config.getBySlug(slug);
    if (!existing) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    const body = await req.json();
    if (type === 'blog') body._was_published = existing.is_published;
    const validated = validateBody(config.schema as Parameters<typeof validateBody>[0], body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const updated = await config.update(existing.id, { ...(validated.data as Record<string, unknown>), published_at: existing.published_at });
    return NextResponse.json({ item: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'Slug bestaat al' }, { status: 409 });
    }
    console.error('Guide PUT error:', error);
    return NextResponse.json({ error: 'Bijwerken mislukt' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ type: string; slug: string }> }) {
  try {
    const { type, slug } = await params;
    if (!(type in typeConfig)) return NextResponse.json({ error: 'Ongeldig type' }, { status: 400 });
    const config = typeConfig[type as GuideType];
    const existing = await config.getBySlug(slug);
    if (!existing) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    await config.delete(existing.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Guide DELETE error:', error);
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 });
  }
}
