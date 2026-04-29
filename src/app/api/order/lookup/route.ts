import { NextRequest, NextResponse } from 'next/server';
import {
  getFridgeById,
  getStallingRequestById,
  getTransportRequestById,
  getPendingIntakeById,
} from '@/lib/db';
import { parseRef } from '@/lib/refs';
import { TEST_MODE } from '@/lib/pricing';

// Publieke lookup: GET /api/order/lookup?ref=KK-12 → details voor de
// klant-bevestigingspagina. Geen gevoelige data — alleen wat de klant
// zelf heeft ingevoerd.
export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref');
  if (!ref) return NextResponse.json({ error: 'ref required' }, { status: 400 });
  const parsed = parseRef(ref);
  if (!parsed) return NextResponse.json({ error: 'invalid ref' }, { status: 400 });

  const idNum = Number(parsed.id);

  try {
    if (parsed.kind === 'koelkast' || parsed.kind === 'airco') {
      // refId is fridge_booking.id
      const bookings = await sqlBookingLookup(idNum);
      if (!bookings) return NextResponse.json({ error: 'not found' }, { status: 404 });
      return NextResponse.json({
        kind: parsed.kind,
        ref,
        status: bookings.booking.status === 'compleet' ? 'betaald' : 'wacht op betaling',
        service: `${bookings.fridge.device_type} — ${bookings.booking.camping || 'locatie volgt'}${bookings.booking.spot_number ? ` plek ${bookings.booking.spot_number}` : ''}`,
        period: bookings.booking.start_date && bookings.booking.end_date
          ? `${bookings.booking.start_date} → ${bookings.booking.end_date}` : null,
        customerEmail: bookings.fridge.email,
        customerName: bookings.fridge.name,
        invoiceCreated: !!bookings.booking.holded_invoice_id,
        invoiceNumber: bookings.booking.holded_invoice_number,
        forwardedToWorkshop: false,
        testMode: TEST_MODE,
      });
    }
    if (parsed.kind === 'stalling') {
      const r = await getStallingRequestById(idNum) as null | {
        status: string; type: string; start_date: string;
        email: string; name: string; holded_invoice_id: string | null;
        holded_invoice_number: string | null;
      };
      if (!r) return NextResponse.json({ error: 'not found' }, { status: 404 });
      return NextResponse.json({
        kind: parsed.kind,
        ref,
        status: r.status === 'betaald' ? 'betaald' : 'wacht op betaling',
        service: `Stalling ${r.type}`,
        period: r.start_date ? `vanaf ${r.start_date}` : null,
        customerEmail: r.email,
        customerName: r.name,
        invoiceCreated: !!r.holded_invoice_id,
        invoiceNumber: r.holded_invoice_number,
        forwardedToWorkshop: false,
        testMode: TEST_MODE,
      });
    }
    if (parsed.kind === 'transport') {
      const r = await getTransportRequestById(idNum) as null | {
        status: string; camping: string | null; to_location: string;
        preferred_date: string | null; return_date: string | null;
        email: string; name: string;
      };
      if (!r) return NextResponse.json({ error: 'not found' }, { status: 404 });
      return NextResponse.json({
        kind: parsed.kind,
        ref,
        status: r.status,
        service: `Transport — ${r.camping || r.to_location}`,
        period: r.preferred_date ? `Heen ${r.preferred_date}${r.return_date ? ` · Terug ${r.return_date}` : ''}` : null,
        customerEmail: r.email,
        customerName: r.name,
        invoiceCreated: false,
        invoiceNumber: null,
        forwardedToWorkshop: false,
        testMode: TEST_MODE,
      });
    }
    if (parsed.kind === 'service') {
      const intake = await getPendingIntakeById(idNum);
      if (!intake) return NextResponse.json({ error: 'not found' }, { status: 404 });
      const payload = (intake.payload || {}) as {
        title?: string;
        customer?: { name?: string; email?: string };
        serviceCategory?: string;
      };
      return NextResponse.json({
        kind: parsed.kind,
        ref,
        status: intake.forwarded_at ? 'doorgestuurd' : intake.abandoned_at ? 'verlaten' : 'wacht op betaling',
        service: payload.title || payload.serviceCategory || 'Service',
        period: null,
        customerEmail: payload.customer?.email || null,
        customerName: payload.customer?.name || null,
        invoiceCreated: false,
        invoiceNumber: null,
        forwardedToWorkshop: !!intake.forwarded_at,
        forwardCode: intake.forward_repair_job_id,
        testMode: TEST_MODE,
      });
    }

    // reparatie / inspectie zijn 1-op-1 publicCodes uit reparatiepanel — die
    // hebben we niet lokaal en hoeven niet meer info te tonen dan de code zelf.
    return NextResponse.json({
      kind: parsed.kind,
      ref,
      status: 'ontvangen',
      service: parsed.kind === 'reparatie' ? 'Reparatie-aanvraag' : 'Inspectie-aanvraag',
      period: null,
      customerEmail: null,
      customerName: null,
      invoiceCreated: false,
      invoiceNumber: null,
      forwardedToWorkshop: true,
      testMode: TEST_MODE,
    });
  } catch (err) {
    console.error('[lookup] error:', err);
    return NextResponse.json({ error: 'lookup failed' }, { status: 500 });
  }
}

// Fridge boeking + parent fridge in één call.
async function sqlBookingLookup(bookingId: number) {
  const { sql } = await import('@/lib/db');
  const rows = await sql`
    SELECT b.*, f.name AS f_name, f.email AS f_email, f.device_type AS f_device_type
    FROM fridge_bookings b
    JOIN fridges f ON f.id = b.fridge_id
    WHERE b.id = ${bookingId} LIMIT 1`;
  const r = (rows as Array<{
    id: number; camping: string | null; start_date: string | null; end_date: string | null;
    spot_number: string | null; status: string;
    holded_invoice_id: string | null; holded_invoice_number: string | null;
    f_name: string; f_email: string | null; f_device_type: string;
  }>)[0];
  if (!r) return null;
  return {
    booking: {
      id: r.id,
      camping: r.camping,
      start_date: r.start_date,
      end_date: r.end_date,
      spot_number: r.spot_number,
      status: r.status,
      holded_invoice_id: r.holded_invoice_id,
      holded_invoice_number: r.holded_invoice_number,
    },
    fridge: { name: r.f_name, email: r.f_email, device_type: r.f_device_type },
  };
}

// Voor TS: als getFridgeById ergens nodig zou zijn, expliciet houden zodat
// future linker er aan komt.
void getFridgeById;
