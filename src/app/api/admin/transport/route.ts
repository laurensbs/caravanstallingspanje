import { NextRequest, NextResponse } from 'next/server';
import {
  getAllTransportRequests,
  updateTransportRequestStatus,
  deleteTransportRequest,
  createTransportRequest,
  logActivity,
  getAdminInfo,
} from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || undefined;
    const entries = await getAllTransportRequests(status);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Transport GET error:', error);
    return NextResponse.json({ error: 'Kon transporten niet laden' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const required = ['name', 'email', 'camping', 'outbound_date', 'return_date'];
    for (const k of required) {
      if (!body[k]) return NextResponse.json({ error: `Veld "${k}" ontbreekt` }, { status: 400 });
    }
    const admin = getAdminInfo(req);
    const created = await createTransportRequest({
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      camping: body.camping,
      outbound_date: body.outbound_date,
      outbound_time: body.outbound_time || null,
      return_date: body.return_date,
      return_time: body.return_time || null,
      registration: body.registration || null,
      brand: body.brand || null,
      model: body.model || null,
      notes: body.notes || null,
      created_via: 'admin',
      status: 'gepland',
    });
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Transport handmatig toegevoegd',
      entityType: 'transport_request',
      entityId: String(created.id),
      entityLabel: `${body.name} — ${body.camping}`,
    });
    return NextResponse.json({ success: true, entry: created });
  } catch (error) {
    console.error('Transport POST error:', error);
    return NextResponse.json({ error: 'Kon transport niet aanmaken' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, action, status } = await req.json();
    if (!id || !action) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    const admin = getAdminInfo(req);

    if (action === 'set-status' && typeof status === 'string') {
      await updateTransportRequestStatus(Number(id), status);
      await logActivity({
        actor: admin.name, role: admin.role,
        action: `Transport status → ${status}`,
        entityType: 'transport_request',
        entityId: String(id),
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      await deleteTransportRequest(Number(id));
      await logActivity({
        actor: admin.name, role: admin.role,
        action: 'Transport verwijderd',
        entityType: 'transport_request',
        entityId: String(id),
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Onbekende actie' }, { status: 400 });
  } catch (error) {
    console.error('Transport PATCH error:', error);
    return NextResponse.json({ error: 'Kon actie niet uitvoeren' }, { status: 500 });
  }
}
