import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerToken } from '@/lib/auth';
import { getCustomerByEmail, getCaravansByCustomer, getServiceHistory } from '@/lib/db';

// Geeft de caravan(s) + service-historie van de ingelogde klant terug.
// Toont in /account dashboard caravan-card en /account/caravan tabs.
export async function GET(req: NextRequest) {
  const token = req.cookies.get('customer_token')?.value;
  const session = token ? await verifyCustomerToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const customer = await getCustomerByEmail(session.email);
  if (!customer) return NextResponse.json({ error: 'Account niet gevonden.' }, { status: 404 });

  const caravans = await getCaravansByCustomer(customer.id);
  if (caravans.length === 0) {
    return NextResponse.json({ caravan: null, history: [] });
  }
  // Toon alleen de eerste — voor klanten met meerdere caravans kunnen we
  // later een selector toevoegen.
  const caravan = caravans[0];
  const history = await getServiceHistory(caravan.id);
  return NextResponse.json({
    caravan: {
      id: caravan.id,
      kind: caravan.kind,
      brand: caravan.brand,
      model: caravan.model,
      year: caravan.year,
      registration: caravan.registration,
      lengthM: caravan.length_m ? Number(caravan.length_m) : null,
      spotCode: caravan.spot_code,
      storageType: caravan.storage_type,
      contractStart: caravan.contract_start,
      contractRenew: caravan.contract_renew,
      insuranceProvider: caravan.insurance_provider,
      notes: caravan.notes,
    },
    history: history.map((h) => ({
      id: h.id,
      kind: h.kind,
      title: h.title,
      description: h.description,
      happenedOn: h.happened_on,
      createdAt: h.created_at,
    })),
  });
}
