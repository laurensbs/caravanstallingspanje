import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerToken } from '@/lib/auth';
import { getCustomerByEmail, listInspectionCertificatesForCustomer } from '@/lib/db';

// GET /api/account/inspection-certs
// Returnt alle keuringscertificaten van de ingelogde klant.
// Volgorde: meest recente eerst.
export async function GET(req: NextRequest) {
  const token = req.cookies.get('customer_token')?.value;
  const session = token ? await verifyCustomerToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const customer = await getCustomerByEmail(session.email);
  if (!customer) return NextResponse.json({ error: 'Account niet gevonden.' }, { status: 404 });

  const certs = await listInspectionCertificatesForCustomer(customer.id);
  return NextResponse.json({
    certificates: certs.map((c) => ({
      id: c.id,
      certificateNumber: c.certificate_number,
      inspectionDate: c.inspection_date,
      overallResult: c.overall_result,
      technicianName: c.technician_name,
      caravan: {
        brand: c.caravan_brand_snapshot,
        model: c.caravan_model_snapshot,
        registration: c.caravan_registration_snapshot,
      },
      createdAt: c.created_at,
    })),
  });
}
