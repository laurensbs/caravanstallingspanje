import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { readFile } from 'fs/promises';
import path from 'path';
import { getInspectionCertificateById } from '@/lib/db';
import InspectionCertificatePdf from '@/components/pdf/InspectionCertificatePdf';

// Admin-versie van de PDF-stream — geen customer_id check zodat Laurens
// elk certificaat kan bekijken (ook van klanten zonder portaal-account).
// Middleware checkt al admin-token voor /api/admin/*.
export const runtime = 'nodejs';
export const maxDuration = 30;

let cachedLogo: string | null = null;

async function getLogo(): Promise<string | null> {
  if (cachedLogo !== null) return cachedLogo || null;
  try {
    const buf = await readFile(path.join(process.cwd(), 'public', 'images', 'logo.png'));
    cachedLogo = `data:image/png;base64,${buf.toString('base64')}`;
    return cachedLogo;
  } catch {
    cachedLogo = '';
    return null;
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

  const cert = await getInspectionCertificateById(idNum);
  if (!cert) return NextResponse.json({ error: 'not found' }, { status: 404 });

  try {
    const logo = await getLogo();
    const stream = await renderToStream(
      <InspectionCertificatePdf cert={cert} logoBase64={logo || undefined} />
    );
    const reader = stream as unknown as NodeJS.ReadableStream;
    const webStream = new ReadableStream({
      start(controller) {
        reader.on('data', (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
        reader.on('end', () => controller.close());
        reader.on('error', (err: Error) => controller.error(err));
      },
    });
    return new Response(webStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="keuring-${cert.certificate_number}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    console.error('[admin-inspection-pdf] render failed:', err);
    return NextResponse.json({ error: 'PDF-render mislukt' }, { status: 500 });
  }
}
