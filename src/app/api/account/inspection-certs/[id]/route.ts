import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerToken } from '@/lib/auth';
import { getCustomerByEmail, getInspectionCertificateById } from '@/lib/db';

// GET /api/account/inspection-certs/[id] — JSON-detail van één certificaat.
// Authorization: customer_id van het certificaat moet matchen met session-klant.
// Onbestaand of andermans cert → 404 (geen 403 zodat we niet onthullen
// dat het cert wel bestaat maar van een ander is).
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

  return NextResponse.json({ certificate: cert });
}
