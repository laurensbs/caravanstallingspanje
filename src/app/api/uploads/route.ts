import { NextRequest, NextResponse } from 'next/server';
import { uploadPublicFile, buildPublicUploadFolderPath, isOneDriveConfigured } from '@/lib/onedrive';

// Public upload endpoint voor foto's vanuit de website-formulieren
// (reparatie / inspectie / inkoop / contact). Elke request is één foto;
// de client stuurt parallel meerdere uploads en verzamelt URLs.
//
// Body:  multipart/form-data
//   file:  File (max 10 MB, image/* of application/pdf)
//   kind:  'repair-intake' | 'inspection-intake' | 'purchase' | 'contact' | 'sale-listing'
//   ref:   optionele groeperings-key (bv. session-id of timestamp+rand)
//
// Response:  { url, webUrl, fileName, sizeKb }
//   503 als OneDrive-env-vars ontbreken (graceful degrade — de form zelf
//   werkt nog steeds, alleen zonder foto's).

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_KINDS = new Set([
  'repair-intake', 'inspection-intake', 'purchase', 'contact', 'sale-listing',
]);
const ALLOWED_TYPES = /^(image\/(jpeg|png|webp|heic|heif)|application\/pdf)$/i;

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!isOneDriveConfigured()) {
    return NextResponse.json(
      { error: 'Foto-upload nog niet geconfigureerd op deze server.' },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Ongeldige request — verwacht multipart/form-data.' }, { status: 400 });
  }

  const file = formData.get('file');
  const kind = String(formData.get('kind') || '').trim();
  const ref = String(formData.get('ref') || '').trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file ontbreekt' }, { status: 400 });
  }
  if (!ALLOWED_KINDS.has(kind)) {
    return NextResponse.json({ error: `kind moet één van: ${[...ALLOWED_KINDS].join(', ')}` }, { status: 400 });
  }
  if (!ref || ref.length < 3 || ref.length > 80) {
    return NextResponse.json({ error: 'ref ontbreekt of ongeldig (3-80 tekens)' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `Bestand te groot (>10 MB).` }, { status: 413 });
  }
  if (!ALLOWED_TYPES.test(file.type)) {
    return NextResponse.json(
      { error: 'Alleen JPEG/PNG/WEBP/HEIC of PDF toegestaan.' },
      { status: 415 },
    );
  }

  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const folderPath = buildPublicUploadFolderPath(kind, ref);
    // Prefix met timestamp om collisions te voorkomen bij dezelfde naam.
    const stamp = Date.now().toString(36);
    const safeOriginal = file.name.replace(/[^\w.\-() ]/g, '_').slice(-80);
    const fileName = `${stamp}-${safeOriginal}`;

    const result = await uploadPublicFile(folderPath, fileName, buffer, file.type);

    return NextResponse.json({
      url: result.url,
      webUrl: result.webUrl,
      fileName,
      sizeKb: Math.round(file.size / 1024),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upload mislukt';
    console.error('[uploads] failed:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
