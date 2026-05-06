import { NextRequest, NextResponse } from 'next/server';
import {
  uploadPublicFile, isOneDriveConfigured,
} from '@/lib/onedrive';
import {
  listCaravanPhotos, createCaravanPhoto, logActivity, getAdminInfo,
} from '@/lib/db';

// Admin-zijde foto-upload voor monteurs/Laurens. Doet upload + DB-insert
// in één stap (single multipart request). Klanten zien de foto met
// uploaded_by='admin' in /account/caravan en kunnen 'm niet weghalen.
//
// GET  → lijst bestaande foto's voor caravan-id
// POST → multipart/form-data { file: File, caption?: string }

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = /^image\/(jpeg|png|webp|heic|heif)$/i;

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caravanId = Number(id);
  if (!Number.isFinite(caravanId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }
  const photos = await listCaravanPhotos(caravanId);
  return NextResponse.json({ photos });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caravanId = Number(id);
  if (!Number.isFinite(caravanId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  if (!isOneDriveConfigured()) {
    return NextResponse.json(
      { error: 'OneDrive niet geconfigureerd op deze server.' },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Verwacht multipart/form-data.' }, { status: 400 });
  }

  const file = formData.get('file');
  const caption = String(formData.get('caption') || '').trim().slice(0, 300);

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file ontbreekt' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Bestand te groot (>10 MB).' }, { status: 413 });
  }
  if (!ALLOWED_TYPES.test(file.type)) {
    return NextResponse.json({ error: 'Alleen JPEG/PNG/WEBP/HEIC.' }, { status: 415 });
  }

  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const root = process.env.ONEDRIVE_ROOT_FOLDER || 'Stalling';
    const folderPath = `${root}/admin-uploads/caravan-${caravanId}`;
    const stamp = Date.now().toString(36);
    const safeOriginal = file.name.replace(/[^\w.\-() ]/g, '_').slice(-80);
    const fileName = `${stamp}-${safeOriginal}`;

    const result = await uploadPublicFile(folderPath, fileName, buffer, file.type);

    const photo = await createCaravanPhoto({
      caravan_id: caravanId,
      url: result.url,
      web_url: result.webUrl || null,
      file_name: fileName,
      size_kb: Math.round(file.size / 1024),
      caption: caption || null,
      uploaded_by: 'admin',
    });

    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Admin-foto toegevoegd aan caravan',
      entityType: 'caravan_photo',
      entityId: String(photo.id),
    });

    return NextResponse.json({ photo });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upload mislukt';
    console.error('[admin/caravans/photos] failed:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
