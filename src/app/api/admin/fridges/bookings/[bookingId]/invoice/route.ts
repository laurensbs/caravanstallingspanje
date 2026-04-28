import { NextRequest, NextResponse } from 'next/server';
import { getBookingById, getFridgeById, setBookingHoldedInvoice, setFridgeHoldedContact, logActivity, getAdminInfo } from '@/lib/db';
import { ensureContact, createInvoice } from '@/lib/holded';
import { validateBody, holdedInvoiceSchema } from '@/lib/validations';

export async function POST(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    const { bookingId } = await params;
    const body = await req.json();
    const validated = validateBody(holdedInvoiceSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });

    const booking = await getBookingById(parseInt(bookingId));
    if (!booking) return NextResponse.json({ error: 'Periode niet gevonden' }, { status: 404 });
    if (booking.holded_invoice_id) {
      return NextResponse.json(
        {
          error: 'Voor deze periode bestaat al een factuur',
          holdedInvoiceId: booking.holded_invoice_id,
          holdedInvoiceNumber: booking.holded_invoice_number,
        },
        { status: 409 },
      );
    }

    const fridge = await getFridgeById(booking.fridge_id);
    if (!fridge) return NextResponse.json({ error: 'Klant niet gevonden' }, { status: 404 });

    let holdedContactId: string | undefined = fridge.holded_contact_id;
    if (!holdedContactId) {
      if (!fridge.email) return NextResponse.json({ error: 'Klant heeft geen e-mailadres' }, { status: 400 });
      const contact = await ensureContact({ name: fridge.name, email: fridge.email });
      holdedContactId = contact.id;
      await setFridgeHoldedContact(fridge.id, contact.id);
    }

    const dateUnix = validated.data.date ? Math.floor(new Date(validated.data.date).getTime() / 1000) : undefined;
    const invoice = await createInvoice({
      contactId: holdedContactId,
      desc: validated.data.description,
      date: dateUnix,
      notes: validated.data.notes,
      items: [
        {
          name: validated.data.description,
          units: validated.data.units,
          subtotal: validated.data.subtotal,
          tax: validated.data.tax,
        },
      ],
    });

    await setBookingHoldedInvoice(parseInt(bookingId), invoice.id, invoice.invoiceNum);

    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name,
      role: admin.role,
      action: 'Holded factuur aangemaakt',
      entityType: 'fridge_booking',
      entityId: bookingId,
      entityLabel: invoice.invoiceNum || invoice.id,
    });

    return NextResponse.json({ holdedInvoiceId: invoice.id, holdedInvoiceNumber: invoice.invoiceNum });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Holded-fout';
    console.error('Holded invoice error:', msg);
    await logActivity({ action: 'Holded factuur mislukt', entityType: 'fridge_booking', details: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
