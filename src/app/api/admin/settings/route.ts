import { NextRequest, NextResponse } from 'next/server';
import { getSettings, setSetting, logActivity, getAdminInfo } from '@/lib/db';
import { validateBody, settingsUpdateSchema } from '@/lib/validations';

const KEYS = [
  'stalling_price_binnen', 'stalling_price_buiten',
  'fridge_price_grote', 'fridge_price_tafel', 'fridge_price_airco',
  'fridge_stock_grote', 'fridge_stock_tafel', 'fridge_stock_airco',
  'transport_price_wij_rijden', 'transport_price_zelf',
  'stalling_address',
] as const;

export async function GET() {
  try {
    const map = await getSettings([...KEYS]);
    return NextResponse.json({
      stalling_price_binnen: Number(map.stalling_price_binnen ?? 0),
      stalling_price_buiten: Number(map.stalling_price_buiten ?? 0),
      fridge_price_grote: Number(map.fridge_price_grote ?? 40),
      fridge_price_tafel: Number(map.fridge_price_tafel ?? 25),
      fridge_price_airco: Number(map.fridge_price_airco ?? 50),
      fridge_stock_grote: Number(map.fridge_stock_grote ?? 110),
      fridge_stock_tafel: Number(map.fridge_stock_tafel ?? 20),
      fridge_stock_airco: Number(map.fridge_stock_airco ?? 10),
      transport_price_wij_rijden: Number(map.transport_price_wij_rijden ?? 100),
      transport_price_zelf: Number(map.transport_price_zelf ?? 50),
      stalling_address: typeof map.stalling_address === 'string'
        ? map.stalling_address
        : 'Stalling Cruïlles, Cruïlles (Girona), Spanje',
    });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Could not load settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(settingsUpdateSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: `Validation: ${validated.error}` }, { status: 400 });
    }
    const admin = getAdminInfo(req);

    // Zorg dat de tabel bestaat — op een verse DB die niet via /api/setup is
    // geïnitialiseerd zou setSetting anders crashen op 'relation does not exist'.
    const { sql } = await import('@/lib/db');
    await sql`CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    )`;

    const updates = Object.entries(validated.data).filter(([, v]) => v !== undefined);
    for (const [key, value] of updates) {
      try {
        await setSetting(key, value);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown';
        return NextResponse.json({ error: `Could not save ${key}: ${msg}` }, { status: 500 });
      }
    }
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Settings updated',
      entityType: 'settings',
      details: updates.map(([k, v]) => `${k}=${v}`).join(', '),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown';
    console.error('Settings PATCH error:', msg);
    return NextResponse.json({ error: `Save failed: ${msg}` }, { status: 500 });
  }
}
