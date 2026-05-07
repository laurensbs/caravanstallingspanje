import { NextRequest, NextResponse } from 'next/server';
import { listInspectionCertificatesForAdmin } from '@/lib/db';

// GET /api/admin/inspection-certs?search=...
// Lijst alle certificaten voor admin-overzicht. Middleware checkt al
// admin-auth voor /api/admin/*.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const search = url.searchParams.get('search') || undefined;
  const items = await listInspectionCertificatesForAdmin({ search });
  return NextResponse.json({ items });
}
