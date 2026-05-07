import { NextRequest } from 'next/server';
import { listAllCustomers, logActivity, getAdminInfo } from '@/lib/db';

// CSV-export van alle klanten. Excel-vriendelijk: BOM + comma's,
// dubbele quotes geescaped door verdubbeling, newlines binnen velden
// vervangen door spatie zodat de CSV niet stuk gaat in Excel.
//
// URL: GET /api/admin/customers/export
// Response: text/csv met filename customers-YYYY-MM-DD.csv

const FIELDS = [
  'id', 'name', 'email', 'phone', 'mobile',
  'address', 'postal_code', 'city', 'country', 'vat_number',
  'is_company', 'holded_contact_id', 'holded_synced_at',
  'last_login_at', 'password_set_at',
  'source', 'created_at',
] as const;

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v).replace(/[\r\n]+/g, ' ').replace(/"/g, '""');
  return `"${s}"`;
}

export async function GET(req: NextRequest) {
  const customers = await listAllCustomers();

  const lines: string[] = [];
  lines.push(FIELDS.join(','));
  for (const c of customers) {
    const row = FIELDS.map((f) => csvEscape((c as unknown as Record<string, unknown>)[f]));
    lines.push(row.join(','));
  }
  const csv = '﻿' + lines.join('\r\n'); // BOM voor Excel UTF-8 detectie

  const admin = getAdminInfo(req);
  await logActivity({
    actor: admin.name, role: admin.role,
    action: 'CSV-export klanten',
    entityType: 'customer',
    details: `${customers.length} rows`,
  }).catch(() => {});

  const today = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="customers-${today}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
