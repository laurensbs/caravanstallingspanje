import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { validateBody, contractSchema } from '@/lib/validations';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = validateBody(contractSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;
    await sql`UPDATE contracts SET customer_id = ${data.customer_id}, caravan_id = ${data.caravan_id}, location_id = ${data.location_id}, spot_id = ${data.spot_id || null}, start_date = ${data.start_date}, end_date = ${data.end_date}, monthly_rate = ${data.monthly_rate}, deposit = ${data.deposit || 0}, auto_renew = ${data.auto_renew !== false}, status = ${data.status || 'actief'}, notes = ${data.notes || null}, updated_at = NOW() WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contract PUT error:', error);
    return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
  }
}
