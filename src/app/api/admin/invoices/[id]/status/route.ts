import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status, payment_method } = await req.json();
    if (status === 'betaald') {
      await sql`UPDATE invoices SET status = 'betaald', paid_date = NOW(), payment_method = ${payment_method || 'handmatig'}, updated_at = NOW() WHERE id = ${id}`;
    } else {
      await sql`UPDATE invoices SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invoice status error:', error);
    return NextResponse.json({ error: 'Failed to update invoice status' }, { status: 500 });
  }
}
