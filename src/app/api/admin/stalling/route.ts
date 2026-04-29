import { NextRequest, NextResponse } from 'next/server';
import {
  getAllStallingRequests, createStallingRequest, logActivity, getAdminInfo,
} from '@/lib/db';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status') || undefined;
  try {
    const entries = await getAllStallingRequests(status);
    return NextResponse.json({ entries });
  } catch (err) {
    console.error('stalling GET error:', err);
    return NextResponse.json({ error: 'list failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const required = ['type', 'name', 'email', 'start_date'];
    for (const k of required) {
      if (!body[k]) return NextResponse.json({ error: `Veld "${k}" ontbreekt` }, { status: 400 });
    }
    const admin = getAdminInfo(req);
    const created = await createStallingRequest({
      type: body.type === 'binnen' ? 'binnen' : 'buiten',
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      start_date: body.start_date,
      end_date: body.end_date || null,
      registration: body.registration || null,
      brand: body.brand || null,
      model: body.model || null,
      length: body.length || null,
      notes: body.notes || null,
    });
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Stalling handmatig toegevoegd',
      entityType: 'stalling_request',
      entityId: String(created.id),
      entityLabel: `${body.name} — ${body.type}`,
    });
    return NextResponse.json({ entry: created });
  } catch (err) {
    console.error('stalling POST error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'create failed' }, { status: 500 });
  }
}
