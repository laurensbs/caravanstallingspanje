import { NextRequest, NextResponse } from 'next/server';
import { getCustomerByEmail, updateCustomer } from '@/lib/db';
import { updateContactInHolded } from '@/lib/holded';
import { verifyCustomerToken } from '@/lib/auth';

// Klant wijzigt z'n eigen contactgegevens. Email is BEWUST niet
// editable — die is z'n login-identifier. Voor email-wijziging moet
// admin tussenkomen (security-keuze, voorkomt account-takeover via
// gestolen sessie).
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('customer_token')?.value;
    const session = token ? await verifyCustomerToken(token) : null;
    if (!session) {
      return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const customer = await getCustomerByEmail(session.email);
    if (!customer) {
      return NextResponse.json({ error: 'Account niet gevonden.' }, { status: 404 });
    }

    // Whitelist: alleen velden die klant zelf mag aanpassen. Email,
    // password, holded-id, source etc. blijven onaangeroerd.
    const updates = {
      name: typeof body.name === 'string' ? body.name.trim() : undefined,
      phone: typeof body.phone === 'string' ? body.phone.trim() : undefined,
      mobile: typeof body.mobile === 'string' ? body.mobile.trim() : undefined,
      address: typeof body.address === 'string' ? body.address.trim() : undefined,
      city: typeof body.city === 'string' ? body.city.trim() : undefined,
      postal_code: typeof body.postal_code === 'string' ? body.postal_code.trim() : undefined,
      country: typeof body.country === 'string' ? body.country.trim() : undefined,
      vat_number: typeof body.vat_number === 'string' ? body.vat_number.trim() : undefined,
    };
    if (updates.name !== undefined && updates.name.length < 2) {
      return NextResponse.json({ error: 'Naam is te kort.' }, { status: 400 });
    }
    await updateCustomer(customer.id, updates);

    // Best-effort sync naar Holded — als 't faalt logt admin-update-flow
    // het via holded_sync_failed; klant ziet er geen probleem van.
    if (customer.holded_contact_id) {
      try {
        await updateContactInHolded(customer.holded_contact_id, {
          name: updates.name ?? customer.name,
          phone: updates.phone ?? customer.phone,
          mobile: updates.mobile ?? customer.mobile,
          address: updates.address ?? customer.address,
          city: updates.city ?? customer.city,
          postal_code: updates.postal_code ?? customer.postal_code,
          country: updates.country ?? customer.country,
          vat_number: updates.vat_number ?? customer.vat_number,
        });
      } catch (err) {
        console.warn('[account/update-details] holded sync failed:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'update failed';
    console.error('[account/update-details] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
