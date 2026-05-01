import { NextRequest, NextResponse } from 'next/server';
import {
  getBookingById,
  getFridgeById,
  getCustomerById,
  setFridgeHoldedContact,
  setBookingHoldedInvoice,
  setBookingPaymentLink,
  logActivity,
  getAdminInfo,
} from '@/lib/db';
import {
  ensureContact,
  createProforma,
  getInvoice,
  getContactById,
  updateContactInHolded,
  type ContactInput,
} from '@/lib/holded';
import { sendMail, paymentLinkHtml } from '@/lib/email';
import { createCheckoutSession } from '@/lib/stripe';
import { formatRef, refKindForFridge } from '@/lib/refs';

// Admin verstuurt een betaallink naar een klant die handmatig in het systeem
// is gezet (bv. een bestaande huurder waar we offline met afgesproken hebben).
// In één call:
//   1. Pro forma in Holded aanmaken met ALLE bekende klant-gegevens (adres,
//      btw, telefoon) — pakt 'm uit lokale customers-record of haalt 'm uit
//      Holded zelf via ensureContact.
//   2. Stripe Checkout-sessie maken met 30 dagen geldigheid + booking-id in
//      metadata zodat de webhook 'm aan deze booking kan koppelen.
//   3. Mail met logo + grote "Nu betalen" knop naar de klant.
// Idempotent: bestaande pro forma wordt hergebruikt; we sturen wél een nieuwe
// Stripe-sessie + mail (klant kan 'm vragen om een herhaling).
export async function POST(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    const { bookingId } = await params;
    const id = Number(bookingId);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid booking id' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const amountEur = Number(body.amountEur);
    const description = String(body.description || '').trim();
    const overrideEmail = String(body.email || '').trim();
    const taxPercent = Number.isFinite(Number(body.taxPercent)) ? Number(body.taxPercent) : 21;

    if (!Number.isFinite(amountEur) || amountEur <= 0) {
      return NextResponse.json({ error: 'Enter a valid amount' }, { status: 400 });
    }
    if (!description || description.length < 3) {
      return NextResponse.json({ error: 'Enter a description' }, { status: 400 });
    }

    const booking = await getBookingById(id) as null | {
      id: number; fridge_id: number; camping: string | null;
      start_date: string | null; end_date: string | null; spot_number: string | null;
      status: string; holded_invoice_id: string | null; holded_invoice_number: string | null;
    };
    if (!booking) return NextResponse.json({ error: 'Period not found' }, { status: 404 });

    const fridge = await getFridgeById(booking.fridge_id) as null | {
      id: number; name: string; email: string | null; device_type: string;
      holded_contact_id: string | null; customer_id: number | null;
    };
    if (!fridge) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    const customerEmail = overrideEmail || fridge.email || '';
    if (!customerEmail) {
      return NextResponse.json({ error: 'Customer has no email address — please enter one' }, { status: 400 });
    }

    // ── Verzamel ALLE bekende klantdata voor Holded ──
    // Holded vult de pro forma met de data van het CONTACT zelf, niet wat
    // we in de proforma-create meegeven. Dus we moeten zorgen dat 't
    // contact volledig is gevuld vóór we 'r een pro forma op maken.
    const linked = fridge.customer_id ? await getCustomerById(fridge.customer_id) : null;
    const contactInput: ContactInput = {
      name: linked?.name || fridge.name,
      email: customerEmail,
      phone: linked?.phone || null,
      address: linked?.address || null,
      city: linked?.city || null,
      postal_code: linked?.postal_code || null,
      country: linked?.country || null,
      vat_number: linked?.vat_number || null,
    };
    const holdedContact = await ensureContact(contactInput);
    if (!fridge.holded_contact_id) {
      await setFridgeHoldedContact(fridge.id, holdedContact.id).catch(() => {});
    }

    // Patch Holded-contact met onze meest complete data zodat de pro forma
    // alle velden krijgt. We respecteren bestaande Holded-data: alleen leeg
    // → vullen, nooit overschrijven.
    try {
      const fullContact = await getContactById(holdedContact.id);
      if (fullContact) {
        const patch: Parameters<typeof updateContactInHolded>[1] = {};
        let needsPatch = false;
        if (linked?.phone && !fullContact.phone) { patch.phone = linked.phone; needsPatch = true; }
        if (linked?.mobile && !fullContact.mobile) { patch.mobile = linked.mobile; needsPatch = true; }
        if (linked?.address && !fullContact.address?.address) { patch.address = linked.address; needsPatch = true; }
        if (linked?.city && !fullContact.address?.city) { patch.city = linked.city; needsPatch = true; }
        if (linked?.postal_code && !fullContact.address?.postalCode) { patch.postal_code = linked.postal_code; needsPatch = true; }
        if (linked?.country && !fullContact.address?.country) { patch.country = linked.country; needsPatch = true; }
        if (linked?.vat_number && !fullContact.vatnumber) { patch.vat_number = linked.vat_number; needsPatch = true; }
        if (needsPatch) {
          await updateContactInHolded(holdedContact.id, patch).catch(() => {});
        }
      }
    } catch { /* niet kritisch — pro forma kan ook met bestaande data */ }

    // ── Pro forma — hergebruik bestaande als die er al is ──
    let holdedInvoiceId = booking.holded_invoice_id;
    let holdedInvoiceNumber = booking.holded_invoice_number;
    let holdedPublicUrl: string | undefined;
    if (!holdedInvoiceId) {
      const proforma = await createProforma({
        contactId: holdedContact.id,
        desc: description,
        items: [{ name: description, units: 1, subtotal: amountEur, tax: taxPercent }],
      });
      holdedInvoiceId = proforma.id;
      holdedInvoiceNumber = proforma.invoiceNum;
      await setBookingHoldedInvoice(id, proforma.id, proforma.invoiceNum);
    }
    // publicUrl tonen we in de mail-referentie — best-effort, niet fataal.
    if (holdedInvoiceId) {
      try {
        const inv = await getInvoice(holdedInvoiceId);
        holdedPublicUrl = inv?.publicUrl;
      } catch { /* niet kritisch */ }
    }

    // ── Stripe Checkout sessie (30 dagen geldig) ──
    const origin = req.nextUrl.origin;
    const ref = formatRef(refKindForFridge(fridge.device_type), id);
    const session = await createCheckoutSession({
      description,
      amountEur,
      successUrl: `${origin}/koelkast/bedankt?ref=${ref}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/koelkast?cancelled=1`,
      customerEmail,
      // Stripe Checkout Sessions zijn max 24u geldig. Klant betaalt
      // doorgaans dezelfde dag; admin kan altijd opnieuw versturen.
      expiresInHours: 23,
      metadata: {
        kind: 'fridge_booking_manual',
        refId: String(id),
        ref,
        originalAmountCents: String(Math.round(amountEur * 100)),
        description,
        // Adresvelden → webhook kan ze gebruiken voor de bevestigings-mail /
        // ensureLocalCustomer als de klant nog niet centraal staat.
        billing_name: contactInput.name,
        billing_phone: contactInput.phone || '',
        billing_address: contactInput.address || '',
        billing_postal_code: contactInput.postal_code || '',
        billing_city: contactInput.city || '',
        billing_country: contactInput.country || '',
        billing_vat: contactInput.vat_number || '',
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL' }, { status: 502 });
    }

    await setBookingPaymentLink(id, session.url, customerEmail, Math.round(amountEur * 100));

    // ── Mail naar klant ──
    const mail = paymentLinkHtml({
      name: contactInput.name,
      description,
      amountEur,
      checkoutUrl: session.url,
      invoiceNumber: holdedInvoiceNumber,
      startDate: booking.start_date,
      endDate: booking.end_date,
      camping: booking.camping,
    });
    const mailRes = await sendMail({
      to: customerEmail,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });

    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name,
      role: admin.role,
      action: mailRes.ok ? 'Payment link sent' : 'Payment link mail failed (link created)',
      entityType: 'fridge_booking',
      entityId: String(id),
      entityLabel: `${fridge.name} — ${customerEmail}`,
      details: holdedInvoiceNumber || description,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sentTo: customerEmail,
      mailOk: mailRes.ok,
      mailError: mailRes.ok ? null : mailRes.error,
      holdedInvoiceId,
      holdedInvoiceNumber,
      holdedPublicUrl,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sending failed';
    console.error('[payment-link] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
