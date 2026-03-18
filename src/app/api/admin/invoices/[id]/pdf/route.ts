import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { generateInvoicePDF } from '@/lib/pdf';

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

// GET /api/admin/invoices/[id]/pdf — generate PDF for an invoice
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const sql = getDb();

    const invoices = await sql`
      SELECT i.*, c.first_name, c.last_name, c.email, c.phone, c.address
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ${id}
    `;

    if (invoices.length === 0) {
      return NextResponse.json({ error: 'Factuur niet gevonden' }, { status: 404 });
    }

    const inv = invoices[0];
    const subtotal = Number(inv.subtotal || inv.total || 0);
    const tax = Number(inv.tax || (subtotal * 0.21));
    const total = Number(inv.total || (subtotal + tax));

    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber: inv.invoice_number,
      date: new Date(inv.created_at).toLocaleDateString('nl-NL'),
      dueDate: inv.due_date ? new Date(inv.due_date).toLocaleDateString('nl-NL') : '-',
      status: inv.status,
      customer: {
        name: `${inv.first_name || ''} ${inv.last_name || ''}`.trim(),
        email: inv.email || '',
        phone: inv.phone || '',
        address: inv.address || undefined,
      },
      items: [{
        description: inv.description || 'Stallingkosten',
        quantity: 1,
        unitPrice: subtotal,
        total: subtotal,
      }],
      subtotal,
      tax,
      total,
      notes: inv.notes || undefined,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${inv.invoice_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation failed:', error);
    return NextResponse.json({ error: 'PDF genereren mislukt' }, { status: 500 });
  }
}
