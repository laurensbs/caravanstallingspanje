import { NextRequest, NextResponse } from 'next/server';
import { getSettings, setSetting, logActivity, getAdminInfo } from '@/lib/db';
import { validateBody, settingsUpdateSchema } from '@/lib/validations';

const KEYS = [
  'stalling_price_binnen', 'stalling_price_buiten',
  'fridge_price_grote', 'fridge_price_tafel', 'fridge_price_airco',
  'fridge_stock_grote', 'fridge_stock_tafel', 'fridge_stock_airco',
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
    });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Kon instellingen niet laden' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(settingsUpdateSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const admin = getAdminInfo(req);

    const updates = Object.entries(validated.data).filter(([, v]) => v !== undefined);
    for (const [key, value] of updates) {
      await setSetting(key, value);
    }
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Prijsinstellingen bijgewerkt',
      entityType: 'settings',
      details: updates.map(([k, v]) => `${k}=${v}`).join(', '),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings PATCH error:', error);
    return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 });
  }
}
