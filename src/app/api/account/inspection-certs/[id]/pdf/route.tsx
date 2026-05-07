import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { readFile } from 'fs/promises';
import path from 'path';
import { verifyCustomerToken } from '@/lib/auth';
import { getCustomerByEmail, getInspectionCertificateById } from '@/lib/db';
import InspectionCertificatePdf from '@/components/pdf/InspectionCertificatePdf';

// GET /api/account/inspection-certs/[id]/pdf
// Streamt PDF naar de browser. Authorization: customer_id van het cert
// moet matchen met de ingelogde klant. Onbevoegd → 404.
//
// Performance: een 3-pagina-rapport rendert in ~1-2s op Vercel free.
// PDF wordt niet gecached — als de klant in de toekomst een ander
// rapport ziet (bv. revisie), willen we niet stale-data tonen.

export const runtime = 'nodejs';
export const maxDuration = 30;

let cachedLogoBase64: string | null = null;

async function getLogoBase64(): Promise<string | null> {
  if (cachedLogoBase64 !== null) return cachedLogoBase64 || null;
  try {
    const filePath = path.join(process.cwd(), 'public', 'images', 'logo.png');
    const buf = await readFile(filePath);
    cachedLogoBase64 = `data:image/png;base64,${buf.toString('base64')}`;
    return cachedLogoBase64;
  } catch (err) {
    console.warn('[inspection-pdf] logo load failed:', err);
    cachedLogoBase64 = '';
    return null;
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

  const token = req.cookies.get('customer_token')?.value;
  const session = token ? await verifyCustomerToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const customer = await getCustomerByEmail(session.email);
  if (!customer) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const cert = await getInspectionCertificateById(idNum);
  if (!cert || cert.customer_id !== customer.id) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  try {
    const logo = await getLogoBase64();
    const stream = await renderToStream(
      <InspectionCertificatePdf cert={cert} logoBase64={logo || undefined} />
    );

    // Convert Node stream → Web ReadableStream zodat fetch/Response het accepteert.
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
    const msg = err instanceof Error ? err.message : 'render failed';
    console.error('[inspection-pdf] render failed:', msg, err);
    return NextResponse.json({ error: 'PDF-render mislukt — neem contact op.' }, { status: 500 });
  }
}
