import { NextRequest, NextResponse } from 'next/server';
import { sql, logActivity, getAdminInfo } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status, payment_method } = await req.json();
    if (status === 'betaald') {
      await sql`UPDATE invoices SET status = 'betaald', paid_date = NOW(), payment_method = ${payment_method || 'handmatig'}, updated_at = NOW() WHERE id = ${id}`;
    } else {
      await sql`UPDATE invoices SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
    }
    const admin = getAdminInfo(req);
    const inv = await sql`SELECT invoice_number FROM invoices WHERE id = ${id}`;
    await logActivity({ actor: admin.name, role: admin.role, action: `Factuurstatus → ${status}`, entityType: 'invoice', entityId: id, entityLabel: inv[0]?.invoice_number || `#${id}` });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invoice status error:', error);
    return NextResponse.json({ error: 'Failed to update invoice status' }, { status: 500 });
  }
}
