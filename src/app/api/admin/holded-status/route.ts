import { NextResponse } from 'next/server';
import { getHoldedInvoiceSummary } from '@/lib/db';

// Aggregaat voor het admin-dashboard. Per kind (koelkast/stalling/transport)
// hoeveel facturen in welke status zitten — paid / unpaid / partial / unknown.
export async function GET() {
  try {
    const rows = await getHoldedInvoiceSummary();
    return NextResponse.json({ rows: Array.isArray(rows) ? rows : [] });
  } catch (err) {
    console.error('holded-status GET:', err);
    // Geen 500 — de client crasht dan op .filter. Lever lege rows en
    // log het probleem, het dashboard valt netjes terug op nul-tegels.
    return NextResponse.json({ rows: [], error: err instanceof Error ? err.message : 'unknown' });
  }
}
