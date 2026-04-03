import { NextRequest, NextResponse } from 'next/server';
import { sql, logActivity, getAdminInfo } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, notes } = body;

    const allowed = ['nieuw', 'gecontacteerd', 'offerte', 'klant', 'verloren'];
    if (status && !allowed.includes(status)) {
      return NextResponse.json({ error: 'Ongeldige status' }, { status: 400 });
    }

    if (status && notes !== undefined) {
      await sql`UPDATE leads SET status = ${status}, notes = ${notes} WHERE id = ${parseInt(id)}`;
    } else if (status) {
      await sql`UPDATE leads SET status = ${status} WHERE id = ${parseInt(id)}`;
    } else if (notes !== undefined) {
      await sql`UPDATE leads SET notes = ${notes} WHERE id = ${parseInt(id)}`;
    }
    const admin = getAdminInfo(req);
    const lead = await sql`SELECT name, email FROM leads WHERE id = ${parseInt(id)}`;
    await logActivity({ actor: admin.name, role: admin.role, action: status ? `Leadstatus → ${status}` : 'Lead bijgewerkt', entityType: 'lead', entityId: id, entityLabel: lead[0]?.name || lead[0]?.email || `#${id}` });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead update error:', error);
    return NextResponse.json({ error: 'Fout bij bijwerken lead' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const lead = await sql`SELECT name, email FROM leads WHERE id = ${parseInt(id)}`;
    await sql`DELETE FROM leads WHERE id = ${parseInt(id)}`;
    const admin = getAdminInfo(req);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Lead verwijderd', entityType: 'lead', entityId: id, entityLabel: lead[0]?.name || lead[0]?.email || `#${id}` });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead delete error:', error);
    return NextResponse.json({ error: 'Fout bij verwijderen lead' }, { status: 500 });
  }
}
