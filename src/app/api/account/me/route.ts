import { NextRequest, NextResponse } from 'next/server';
import { getCustomerByEmail } from '@/lib/db';
import { verifyCustomerToken } from '@/lib/auth';

// Geeft de huidige klant + must_change_password flag terug. Gebruikt door
// portal-pagina's om sessie te valideren en eventueel naar het wachtwoord-
// wijzig-scherm te redirecten.
export async function GET(req: NextRequest) {
  const token = req.cookies.get('customer_token')?.value;
  const session = token ? await verifyCustomerToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
  }
  const customer = await getCustomerByEmail(session.email) as
    | (Awaited<ReturnType<typeof getCustomerByEmail>> & { must_change_password?: boolean | null })
    | null;
  if (!customer) {
    return NextResponse.json({ error: 'Account niet gevonden.' }, { status: 404 });
  }
  return NextResponse.json({
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      mobile: customer.mobile,
      address: customer.address,
      city: customer.city,
      postal_code: customer.postal_code,
      country: customer.country,
      vat_number: customer.vat_number,
      mustChangePassword: !!customer.must_change_password,
    },
  });
}
