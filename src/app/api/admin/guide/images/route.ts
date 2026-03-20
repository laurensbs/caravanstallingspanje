import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { createGuideImage, deleteGuideImage, getGuideImages, setGuideCoverImage } from '@/lib/db';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const entityType = url.searchParams.get('entity_type');
    const entityId = url.searchParams.get('entity_id');
    if (!entityType || !entityId) return NextResponse.json({ error: 'entity_type en entity_id verplicht' }, { status: 400 });
    const images = await getGuideImages(entityType, parseInt(entityId));
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Guide images GET error:', error);
    return NextResponse.json({ error: 'Ophalen mislukt' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const entityType = formData.get('entity_type') as string | null;
    const entityId = formData.get('entity_id') as string | null;
    const altText = formData.get('alt_text') as string | null;
    const isCover = formData.get('is_cover') === 'true';

    if (!file || !entityType || !entityId) {
      return NextResponse.json({ error: 'file, entity_type en entity_id verplicht' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Alleen JPEG, PNG, WebP en AVIF toegestaan' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Bestand mag maximaal 5MB zijn' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `guide/${entityType}/${entityId}/${Date.now()}.${ext}`;
    const blob = await put(filename, file, { access: 'public' });

    const image = await createGuideImage({
      entity_type: entityType,
      entity_id: parseInt(entityId),
      url: blob.url,
      alt_text: altText || undefined,
      is_cover: isCover,
    });

    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    console.error('Guide image upload error:', error);
    return NextResponse.json({ error: 'Upload mislukt' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id verplicht' }, { status: 400 });
    await deleteGuideImage(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Guide image delete error:', error);
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, entity_type, entity_id } = body;
    if (!id || !entity_type || !entity_id) return NextResponse.json({ error: 'id, entity_type en entity_id verplicht' }, { status: 400 });
    await setGuideCoverImage(id, entity_type, entity_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Guide image cover error:', error);
    return NextResponse.json({ error: 'Instellen mislukt' }, { status: 500 });
  }
}
