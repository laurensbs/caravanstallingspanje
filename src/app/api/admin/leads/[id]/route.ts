import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead update error:', error);
    return NextResponse.json({ error: 'Fout bij bijwerken lead' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM leads WHERE id = ${parseInt(id)}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead delete error:', error);
    return NextResponse.json({ error: 'Fout bij verwijderen lead' }, { status: 500 });
  }
}
