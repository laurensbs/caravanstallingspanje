import { NextResponse } from 'next/server';
import { getHoldedInvoiceSummary } from '@/lib/db';

// Aggregaat voor het admin-dashboard. Per kind (koelkast/stalling/transport)
// hoeveel facturen in welke status zitten — paid / unpaid / partial / unknown.
export async function GET() {
  try {
    const rows = await getHoldedInvoiceSummary();
    return NextResponse.json({ rows });
  } catch (err) {
    console.error('holded-status GET:', err);
    return NextResponse.json({ rows: [] }, { status: 500 });
  }
}
