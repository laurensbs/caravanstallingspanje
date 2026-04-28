import { NextRequest, NextResponse } from 'next/server';
import { getSettings, setSetting, logActivity, getAdminInfo } from '@/lib/db';
import { validateBody, settingsUpdateSchema } from '@/lib/validations';

const KEYS = ['stalling_price_binnen', 'stalling_price_buiten', 'transport_price'] as const;

export async function GET() {
  try {
    const map = await getSettings([...KEYS]);
    return NextResponse.json({
      stalling_price_binnen: Number(map.stalling_price_binnen ?? 0),
      stalling_price_buiten: Number(map.stalling_price_buiten ?? 0),
      transport_price: Number(map.transport_price ?? 0),
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
