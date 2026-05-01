import { NextRequest, NextResponse } from 'next/server';
import { getAllFridges, createFridge, getFridgeStats, getActiveBookingsByType, logActivity, getAdminInfo, getNeedsSalesInvoiceCount } from '@/lib/db';
import { validateBody, fridgeSchema } from '@/lib/validations';
import { getEffectiveStock } from '@/lib/pricing';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const yearParam = url.searchParams.get('year');
    const year = yearParam && yearParam !== '' ? parseInt(yearParam) : undefined;
    const status = url.searchParams.get('status') || undefined;
    const search = url.searchParams.get('search') || undefined;

    if (url.searchParams.get('stats') === 'true') {
      // Elke sub-call los try-catchen zodat een rotte tabel niet de hele
      // dashboard-pagina laat crashen.
      const stats = await getFridgeStats(year).catch((e) => {
        console.error('[fridges/stats] getFridgeStats failed:', e);
        return { totalFridges: 0, totalBookings: 0, byStatus: [] };
      });
      const active = await getActiveBookingsByType().catch((e) => {
        console.error('[fridges/stats] getActiveBookingsByType failed:', e);
        return [];
      });
      const stock = await getEffectiveStock().catch((e) => {
        console.error('[fridges/stats] getEffectiveStock failed:', e);
        return { 'Grote koelkast': 110, 'Tafelmodel koelkast': 20, 'Airco': 10 };
      });
      const inUseLarge = active.find(a => a.device_type === 'Grote koelkast')?.count ?? 0;
      const inUseTable = active.find(a => a.device_type === 'Tafelmodel koelkast')?.count ?? 0;
      const inUseAirco = active.find(a => a.device_type === 'Airco')?.count ?? 0;
      const needsSalesInvoice = await getNeedsSalesInvoiceCount().catch((e) => {
        console.error('[fridges/stats] getNeedsSalesInvoiceCount failed:', e);
        return 0;
      });
      return NextResponse.json({
        ...stats,
        inUse: {
          large: { current: inUseLarge, capacity: stock['Grote koelkast'] },
          table: { current: inUseTable, capacity: stock['Tafelmodel koelkast'] },
          airco: { current: inUseAirco, capacity: stock['Airco'] },
        },
        needsSalesInvoice,
      });
    }

    const result = await getAllFridges(year, status, search);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Fridges GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch fridges' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(fridgeSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const fridge = await createFridge({
      name: validated.data.name,
      email: validated.data.email || null,
      extra_email: validated.data.extra_email || null,
      device_type: validated.data.device_type,
      notes: validated.data.notes,
      customer_id: validated.data.customer_id || null,
    });
    const admin = getAdminInfo(req);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Fridge created', entityType: 'fridge', entityId: String(fridge.id), entityLabel: validated.data.name });
    // Frontend verwacht altijd een bookings-array op een Fridge — ook voor
    // pas-aangemaakte fridges zonder periodes.
    return NextResponse.json({ fridge: { ...fridge, bookings: [] } }, { status: 201 });
  } catch (error) {
    console.error('Fridges POST error:', error);
    return NextResponse.json({ error: 'Failed to create fridge' }, { status: 500 });
  }
}
