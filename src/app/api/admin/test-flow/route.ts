import { NextRequest, NextResponse } from 'next/server';
import {
  createFridge, createFridgeBooking, markBookingPaid, setBookingHoldedInvoice,
  createTransportRequest, markTransportRequestPaid, setTransportHoldedInvoice,
  createPendingIntakeReturningId, attachStripeSessionToPendingIntake, markPendingIntakeForwarded,
  getCustomerByEmail, createCustomer, linkFridgeToCustomer, linkTransportToCustomer,
  logActivity, getAdminInfo,
} from '@/lib/db';
import { invoiceForCustomer, findContactByEmail } from '@/lib/holded';
import { sendMail, paymentReceivedHtml } from '@/lib/email';
import { sendIntake, type IntakePayload } from '@/lib/work-order-hub';
import { formatRef } from '@/lib/refs';
import { getEffectivePrices } from '@/lib/pricing';

// Volledige end-to-end test van de klant-flow zonder Stripe-betaling.
// Het maakt een echte booking/transport + Holded-factuur + verstuurt
// een echte bevestigingsmail. Admin geeft alleen kind + e-mail mee.
// Resultaat: admin ziet exact wat klant in inbox/admin-paneel krijgt.
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

type TestKind = 'koelkast' | 'airco' | 'transport' | 'service';

const isAdmin = (req: NextRequest) => {
  const id = req.headers.get('x-admin-id');
  return !!(id && Number(id) > 0);
};

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'admin only' }, { status: 401 });
  }
  const body = await req.json();
  const kind = body.kind as TestKind | undefined;
  const email = String(body.email || '').trim();
  const name = String(body.name || 'Test Klant').trim();
  const skipMail = body.skipMail === true;

  if (!kind || !['koelkast', 'airco', 'transport', 'service'].includes(kind)) {
    return NextResponse.json({ error: 'kind moet koelkast/airco/transport/service zijn' }, { status: 400 });
  }
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'geldig e-mailadres vereist' }, { status: 400 });
  }

  const admin = getAdminInfo(req);
  const todayIso = new Date().toISOString().slice(0, 10);
  const plus7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const plus14 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const log: string[] = [`▶ Start test-flow: ${kind}, e-mail=${email}`];
  const result: {
    kind: TestKind;
    ref?: string;
    bookingId?: number;
    fridgeId?: number;
    transportId?: number;
    intakeId?: number;
    workshopJobId?: string;
    workshopPublicCode?: string;
    customerId?: number;
    holdedInvoiceId?: string;
    holdedInvoiceNum?: string;
    mailSent?: boolean;
    receiptUrl?: string;
    adminUrl?: string;
    log: string[];
  } = { kind, log };

  try {
    const prices = await getEffectivePrices().catch(() => ({
      'Grote koelkast': 40, 'Tafelmodel koelkast': 25, 'Airco': 50,
    } as Record<string, number>));

    let amountEur = 0;
    let description = '';
    let ref = '';

    if (kind === 'koelkast' || kind === 'airco') {
      const deviceType = kind === 'airco' ? 'Airco' : 'Grote koelkast';
      amountEur = prices[deviceType] ?? (kind === 'airco' ? 50 : 40);
      description = `${deviceType} — TEST — Camping Eurocamping plek T01 — ${todayIso} t/m ${plus7}`;

      log.push(`✓ Prijs: €${amountEur} (${deviceType})`);

      // 1. Klant in fridges-tabel
      const fridge = await createFridge({
        name: `${name} (TEST)`,
        email,
        device_type: deviceType,
        notes: 'TEST-flow vanuit admin — automatisch aangemaakt',
      });
      result.fridgeId = fridge.id;
      log.push(`✓ Fridge-rij aangemaakt: id=${fridge.id}`);

      // 2. Booking
      const booking = await createFridgeBooking(fridge.id, {
        camping: 'Camping Eurocamping (TEST)',
        start_date: todayIso,
        end_date: plus7,
        spot_number: 'T01',
        status: 'controleren',
        notes: 'TEST',
      });
      result.bookingId = booking.id;
      ref = formatRef(kind === 'airco' ? 'airco' : 'koelkast', booking.id);
      result.ref = ref;
      log.push(`✓ Booking aangemaakt: id=${booking.id} ref=${ref}`);

      // 3. Mark paid (simuleer webhook)
      await markBookingPaid(booking.id, `test_session_${Date.now()}`);
      log.push('✓ Booking status → compleet');
    } else if (kind === 'transport') {
      amountEur = 100;
      description = `Transport heen-en-terug — TEST — Camping Eurocamping`;
      const transport = await createTransportRequest({
        name: `${name} (TEST)`,
        email,
        phone: '+34 600 000 000',
        camping: 'Camping Eurocamping (TEST)',
        outbound_date: todayIso,
        return_date: plus14,
        registration: 'TEST-99',
        notes: 'TEST-flow vanuit admin',
        mode: 'wij_rijden',
        status: 'controleren',
      });
      result.transportId = transport.id;
      ref = formatRef('transport', transport.id);
      result.ref = ref;
      log.push(`✓ Transport-rij aangemaakt: id=${transport.id} ref=${ref}`);

      await markTransportRequestPaid(transport.id);
      log.push('✓ Transport status → betaald');
    } else if (kind === 'service') {
      amountEur = 95;
      description = `Service: Wax-behandeling (TEST)`;
      const intakePayload: IntakePayload = {
        type: 'service',
        customer: { name: `${name} (TEST)`, email, phone: '+34 600 000 000' },
        title: 'Service: Wax-behandeling (TEST)',
        description: 'TEST-flow vanuit admin — automatisch aangemaakt',
        serviceCategory: 'Wax-behandeling',
      };
      const intakeId = await createPendingIntakeReturningId(intakePayload);
      result.intakeId = intakeId;
      ref = formatRef('service', intakeId);
      result.ref = ref;
      log.push(`✓ Pending intake aangemaakt: id=${intakeId} ref=${ref}`);

      // Simuleer Stripe session-id koppeling
      await attachStripeSessionToPendingIntake(intakeId, `test_session_${Date.now()}`);
      log.push('✓ Stripe-session gekoppeld');

      // Stuur door naar reparatiepaneel (echte API-call)
      try {
        const intakeResult = await sendIntake(intakePayload);
        await markPendingIntakeForwarded(intakeId, intakeResult.repairJobId);
        result.workshopJobId = intakeResult.repairJobId;
        result.workshopPublicCode = intakeResult.publicCode;
        log.push(`✓ Doorgezet naar reparatiepaneel: jobId=${intakeResult.repairJobId} code=${intakeResult.publicCode}`);
      } catch (err) {
        log.push(`✗ Reparatiepaneel-doorzet mislukt: ${err instanceof Error ? err.message : 'unknown'}`);
      }
    }

    // 4. Customer-record
    let customer = await getCustomerByEmail(email);
    if (!customer) {
      const matched = await findContactByEmail(email).catch(() => null);
      customer = await createCustomer({
        name: `${name} (TEST)`,
        email,
        phone: '+34 600 000 000',
        holded_contact_id: matched?.id ?? null,
        source: 'stripe',
      });
      log.push(`✓ Customer aangemaakt: id=${customer.id}${matched ? ' (gekoppeld aan Holded)' : ''}`);
    } else {
      log.push(`✓ Bestaande customer gevonden: id=${customer.id}`);
    }
    result.customerId = customer.id;

    // 5. Link fridge/transport aan customer
    if (result.fridgeId) await linkFridgeToCustomer(result.fridgeId, customer.id);
    if (result.transportId) await linkTransportToCustomer(result.transportId, customer.id);
    log.push('✓ Booking gekoppeld aan customer');

    // 6. Holded-factuur
    try {
      const inv = await invoiceForCustomer({
        customer: { name: customer.name, email, phone: customer.phone || null },
        description,
        amountEur,
      });
      if (kind === 'koelkast' || kind === 'airco') {
        await setBookingHoldedInvoice(result.bookingId!, inv.id, inv.invoiceNum);
      } else if (kind === 'transport') {
        await setTransportHoldedInvoice(result.transportId!, inv.id, inv.invoiceNum);
      }
      result.holdedInvoiceId = inv.id;
      result.holdedInvoiceNum = inv.invoiceNum;
      log.push(`✓ Holded-factuur aangemaakt: ${inv.invoiceNum} (id=${inv.id})`);
    } catch (err) {
      log.push(`✗ Holded-factuur mislukt: ${err instanceof Error ? err.message : 'unknown'}`);
    }

    // 7. Bevestigingsmail naar test-email
    if (!skipMail) {
      try {
        const mail = paymentReceivedHtml({
          name,
          service: description,
          amountEur,
          reference: ref,
          invoiceNumber: result.holdedInvoiceNum || null,
        });
        const sent = await sendMail({ to: email, subject: mail.subject, html: mail.html, text: mail.text });
        result.mailSent = sent.ok;
        log.push(sent.ok ? `✓ Bevestigingsmail verstuurd naar ${email}` : `✗ Mail mislukt: ${sent.error}`);
      } catch (err) {
        log.push(`✗ Mail-fout: ${err instanceof Error ? err.message : 'unknown'}`);
      }
    } else {
      log.push('— Mail overgeslagen (skipMail=true)');
    }

    // 8. Activity-log
    const entityTypeMap: Record<TestKind, string> = {
      koelkast: 'fridge_booking',
      airco: 'fridge_booking',
      transport: 'transport_request',
      service: 'pending_intake',
    };
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'TEST-flow uitgevoerd',
      entityType: entityTypeMap[kind],
      entityId: String(result.bookingId || result.transportId || result.intakeId || ''),
      entityLabel: ref,
      details: `email=${email} bedrag=${amountEur}`,
    });

    // 9. URLs voor admin om te checken
    const origin = req.nextUrl.origin;
    result.receiptUrl = `${origin}${(kind === 'transport' || kind === 'service') ? '/diensten' : '/koelkast'}/bedankt?ref=${ref}`;
    if (kind === 'transport') {
      result.adminUrl = `${origin}/admin/transport`;
    } else if (kind === 'service') {
      result.adminUrl = `${origin}/admin/dashboard`;
    } else {
      result.adminUrl = `${origin}/admin/koelkasten?focus=${result.fridgeId}`;
    }
    log.push(`✓ Receipt-pagina: ${result.receiptUrl}`);
    log.push(`✓ Admin-overzicht: ${result.adminUrl}`);

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    log.push(`✗ Onverwachte fout: ${err instanceof Error ? err.message : 'unknown'}`);
    return NextResponse.json({ ok: false, ...result, error: err instanceof Error ? err.message : 'unknown' }, { status: 500 });
  }
}
