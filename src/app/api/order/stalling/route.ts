import { NextRequest, NextResponse } from 'next/server';
import { createStallingRequest, logActivity } from '@/lib/db';
import { validateBody, stallingOrderSchema } from '@/lib/validations';

// Stalling-aanvragen blijven LOKAAL — niet doorsturen naar reparatiepanel.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(stallingOrderSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const d = validated.data;

    const entry = await createStallingRequest({
      type: d.type,
      name: d.name,
      email: d.email,
      phone: d.phone || null,
      start_date: d.start_date,
      end_date: d.end_date || null,
      registration: d.registration || null,
      brand: d.brand || null,
      model: d.model || null,
      length: d.length || null,
      notes: d.notes || null,
    });

    await logActivity({
      action: 'Stalling-aanvraag ontvangen',
      entityType: 'stalling_request',
      entityId: String(entry.id),
      entityLabel: `${d.name} — ${d.type}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('stalling order error:', error);
    return NextResponse.json({ error: 'Aanvraag mislukt' }, { status: 500 });
  }
}
