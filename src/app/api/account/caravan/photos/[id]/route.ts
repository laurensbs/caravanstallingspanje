import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerToken } from '@/lib/auth';
import {
  getCustomerByEmail, getCaravansByCustomer, getCaravanPhotoById, deleteCaravanPhoto,
} from '@/lib/db';

// Alleen de eigenaar (klant van de gekoppelde caravan) mag een eigen foto
// verwijderen. Door admin geüploade foto's mogen klanten niet weghalen.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

  const token = req.cookies.get('customer_token')?.value;
  const session = token ? await verifyCustomerToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const customer = await getCustomerByEmail(session.email);
  if (!customer) return NextResponse.json({ error: 'Account niet gevonden.' }, { status: 404 });

  const photo = await getCaravanPhotoById(idNum);
  if (!photo) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const caravans = await getCaravansByCustomer(customer.id);
  const owns = caravans.some((c) => c.id === photo.caravan_id);
  if (!owns) return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 });
  if (photo.uploaded_by !== 'customer') {
    return NextResponse.json({ error: 'Alleen eigen-geüploade foto\'s kun je verwijderen.' }, { status: 403 });
  }

  try {
    const ok = await deleteCaravanPhoto(idNum);
    if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
