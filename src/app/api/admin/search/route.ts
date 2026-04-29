import { NextRequest, NextResponse } from 'next/server';
import { searchCustomers, sql } from '@/lib/db';
import { parseRef, formatRef, refKindForFridge } from '@/lib/refs';

// Globale zoek voor het admin-paneel: klanten + koelkast-bookings +
// stalling/transport requests + ref-codes (KK-12, ST-7, ...). Output is
// genormaliseerd naar { kind, label, sub, href }.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const term = `%${q}%`;
  const out: Array<{ kind: string; label: string; sub: string; href: string; ref?: string }> = [];

  try {
    // 1. Ref-code direct hit ("KK-12", "TR-3", ...)
    const refMatch = parseRef(q.toUpperCase());
    if (refMatch) {
      const id = refMatch.id;
      if (refMatch.kind === 'koelkast' || refMatch.kind === 'airco') {
        out.push({
          kind: 'booking', label: `Koelkast-booking ${q.toUpperCase()}`, sub: 'Open in beheer',
          href: `/admin/koelkasten?focus=${id}`, ref: q.toUpperCase(),
        });
      } else if (refMatch.kind === 'stalling') {
        out.push({
          kind: 'stalling', label: `Stalling ${q.toUpperCase()}`, sub: 'Open in beheer',
          href: `/admin/stalling?focus=${id}`, ref: q.toUpperCase(),
        });
      } else if (refMatch.kind === 'transport') {
        out.push({
          kind: 'transport', label: `Transport ${q.toUpperCase()}`, sub: 'Open in beheer',
          href: `/admin/transport?focus=${id}`, ref: q.toUpperCase(),
        });
      } else if (refMatch.kind === 'service') {
        out.push({
          kind: 'service', label: `Service-aanvraag ${q.toUpperCase()}`, sub: 'Doorgezet naar werkplaats',
          href: `/admin/dashboard`, ref: q.toUpperCase(),
        });
      } else if (refMatch.kind === 'contact') {
        out.push({
          kind: 'contact', label: `Bericht ${q.toUpperCase()}`, sub: 'Open in inbox',
          href: `/admin/contact`, ref: q.toUpperCase(),
        });
      }
    }

    // 2. Customers — typeahead. Limit 5.
    const customers = await searchCustomers(q, 5);
    for (const c of customers) {
      out.push({
        kind: 'customer',
        label: c.name,
        sub: [c.email, c.phone].filter(Boolean).join(' · ') || 'Klant',
        href: `/admin/klanten/${c.id}`,
      });
    }

    // 3. Fridges (klanten zonder customer_id, of op kenteken in notes/camping)
    const fridgeRows = await sql`
      SELECT f.id, f.name, f.email, f.device_type
      FROM fridges f
      WHERE f.name ILIKE ${term} OR f.email ILIKE ${term} OR f.notes ILIKE ${term}
      ORDER BY f.created_at DESC LIMIT 5`;
    for (const r of fridgeRows as unknown as { id: number; name: string; email: string | null; device_type: string }[]) {
      out.push({
        kind: 'fridge',
        label: r.name,
        sub: `${r.device_type}${r.email ? ` · ${r.email}` : ''}`,
        href: `/admin/koelkasten?focus=${r.id}`,
      });
    }

    // 4. Bookings op camping/kenteken — neem ook spot_number mee.
    const bookingRows = await sql`
      SELECT b.id, b.camping, b.start_date, b.end_date, b.spot_number,
             f.name AS f_name, f.device_type AS f_device_type
      FROM fridge_bookings b
      JOIN fridges f ON f.id = b.fridge_id
      WHERE b.camping ILIKE ${term} OR b.spot_number ILIKE ${term}
      ORDER BY b.start_date DESC NULLS LAST LIMIT 5`;
    for (const r of bookingRows as unknown as {
      id: number; camping: string | null; start_date: string | null; end_date: string | null;
      spot_number: string | null; f_name: string; f_device_type: string;
    }[]) {
      const ref = formatRef(refKindForFridge(r.f_device_type), r.id);
      out.push({
        kind: 'booking',
        label: `${r.f_name} · ${r.camping || '—'}${r.spot_number ? ` (${r.spot_number})` : ''}`,
        sub: `${ref} · ${r.start_date || '?'} → ${r.end_date || '?'}`,
        href: `/admin/koelkasten?focus=${r.id}`,
        ref,
      });
    }

    // 5. Stalling-requests
    const stallingRows = await sql`
      SELECT id, name, email, type, status, registration FROM stalling_requests
      WHERE name ILIKE ${term} OR email ILIKE ${term} OR registration ILIKE ${term}
      ORDER BY created_at DESC LIMIT 5`;
    for (const r of stallingRows as unknown as {
      id: number; name: string; email: string; type: string; status: string; registration: string | null;
    }[]) {
      out.push({
        kind: 'stalling',
        label: `${r.name} · ${r.type}`,
        sub: `Stalling ST-${r.id} · ${r.status}${r.registration ? ` · ${r.registration}` : ''}`,
        href: `/admin/stalling`,
        ref: `ST-${r.id}`,
      });
    }

    // 6. Transport-requests
    const transportRows = await sql`
      SELECT id, name, email, camping, registration, status FROM transport_requests
      WHERE name ILIKE ${term} OR email ILIKE ${term}
        OR camping ILIKE ${term} OR registration ILIKE ${term}
      ORDER BY created_at DESC LIMIT 5`;
    for (const r of transportRows as unknown as {
      id: number; name: string; email: string; camping: string | null; registration: string | null; status: string;
    }[]) {
      out.push({
        kind: 'transport',
        label: `${r.name} · ${r.camping || '—'}`,
        sub: `Transport TR-${r.id} · ${r.status}${r.registration ? ` · ${r.registration}` : ''}`,
        href: `/admin/transport`,
        ref: `TR-${r.id}`,
      });
    }

    return NextResponse.json({ results: out.slice(0, 25) });
  } catch (err) {
    console.error('[admin search]', err);
    return NextResponse.json({ results: [], error: err instanceof Error ? err.message : 'search failed' }, { status: 500 });
  }
}
