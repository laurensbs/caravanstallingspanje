import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Admin data export — CSV format
// Supports: customers, contracts, invoices, caravans, transport

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'customers';
    const format = searchParams.get('format') || 'csv';
    const status = searchParams.get('status');

    let rows: Record<string, unknown>[] = [];
    let filename = '';
    let headers: string[] = [];

    switch (type) {
      case 'customers': {
        rows = await sql`SELECT customer_number, first_name, last_name, email, phone, address, city, postal_code, country, company_name, created_at FROM customers ORDER BY last_name`;
        headers = ['Klantnummer', 'Voornaam', 'Achternaam', 'E-mail', 'Telefoon', 'Adres', 'Plaats', 'Postcode', 'Land', 'Bedrijf', 'Aangemeld'];
        filename = 'klanten';
        break;
      }
      case 'contracts': {
        const q = status
          ? sql`SELECT co.contract_number, cu.first_name || ' ' || cu.last_name as klant, ca.brand || ' ' || COALESCE(ca.model,'') as caravan, ca.license_plate, l.name as locatie, co.start_date, co.end_date, co.monthly_rate, co.status, co.auto_renew FROM contracts co LEFT JOIN customers cu ON co.customer_id = cu.id LEFT JOIN caravans ca ON co.caravan_id = ca.id LEFT JOIN locations l ON co.location_id = l.id WHERE co.status = ${status} ORDER BY co.end_date DESC`
          : sql`SELECT co.contract_number, cu.first_name || ' ' || cu.last_name as klant, ca.brand || ' ' || COALESCE(ca.model,'') as caravan, ca.license_plate, l.name as locatie, co.start_date, co.end_date, co.monthly_rate, co.status, co.auto_renew FROM contracts co LEFT JOIN customers cu ON co.customer_id = cu.id LEFT JOIN caravans ca ON co.caravan_id = ca.id LEFT JOIN locations l ON co.location_id = l.id ORDER BY co.end_date DESC`;
        rows = q instanceof Promise ? await q : q;
        headers = ['Contractnr', 'Klant', 'Caravan', 'Kenteken', 'Locatie', 'Startdatum', 'Einddatum', 'Maandbedrag', 'Status', 'Auto-verlenging'];
        filename = 'contracten';
        break;
      }
      case 'invoices': {
        const q = status
          ? sql`SELECT i.invoice_number, cu.first_name || ' ' || cu.last_name as klant, i.description, i.subtotal, i.tax_amount, i.total, i.status, i.due_date, i.paid_date, i.payment_method FROM invoices i LEFT JOIN customers cu ON i.customer_id = cu.id WHERE i.status = ${status} ORDER BY i.created_at DESC`
          : sql`SELECT i.invoice_number, cu.first_name || ' ' || cu.last_name as klant, i.description, i.subtotal, i.tax_amount, i.total, i.status, i.due_date, i.paid_date, i.payment_method FROM invoices i LEFT JOIN customers cu ON i.customer_id = cu.id ORDER BY i.created_at DESC`;
        rows = q instanceof Promise ? await q : q;
        headers = ['Factuurnr', 'Klant', 'Omschrijving', 'Subtotaal', 'BTW', 'Totaal', 'Status', 'Vervaldatum', 'Betaald op', 'Betaalmethode'];
        filename = 'facturen';
        break;
      }
      case 'caravans': {
        rows = await sql`SELECT ca.brand, ca.model, ca.year, ca.license_plate, ca.length_m, ca.weight_kg, ca.has_mover, ca.status, ca.insurance_expiry, ca.apk_expiry, cu.first_name || ' ' || cu.last_name as eigenaar, l.name as locatie, s.label as plek FROM caravans ca LEFT JOIN customers cu ON ca.customer_id = cu.id LEFT JOIN locations l ON ca.location_id = l.id LEFT JOIN spots s ON ca.spot_id = s.id ORDER BY ca.brand`;
        headers = ['Merk', 'Model', 'Bouwjaar', 'Kenteken', 'Lengte (m)', 'Gewicht (kg)', 'Mover', 'Status', 'Verzekering vervalt', 'APK vervalt', 'Eigenaar', 'Locatie', 'Plek'];
        filename = 'caravans';
        break;
      }
      case 'transport': {
        rows = await sql`SELECT ca.brand || ' ' || COALESCE(ca.model,'') as caravan, ca.license_plate, cu.first_name || ' ' || cu.last_name as klant, t.pickup_address, t.delivery_address, t.scheduled_date, t.completed_date, t.status, s.first_name || ' ' || s.last_name as medewerker FROM transport_orders t LEFT JOIN caravans ca ON t.caravan_id = ca.id LEFT JOIN customers cu ON ca.customer_id = cu.id LEFT JOIN staff s ON t.assigned_staff = s.id ORDER BY t.scheduled_date DESC`;
        headers = ['Caravan', 'Kenteken', 'Klant', 'Ophaaladres', 'Afleveradres', 'Gepland', 'Afgerond', 'Status', 'Medewerker'];
        filename = 'transport';
        break;
      }
      case 'revenue': {
        rows = await sql`
          SELECT 
            TO_CHAR(paid_date, 'YYYY-MM') as maand,
            COUNT(*) as aantal_facturen,
            SUM(subtotal) as subtotaal,
            SUM(tax_amount) as btw,
            SUM(total) as totaal
          FROM invoices 
          WHERE status = 'betaald' AND paid_date IS NOT NULL
          GROUP BY TO_CHAR(paid_date, 'YYYY-MM')
          ORDER BY maand DESC
        `;
        headers = ['Maand', 'Aantal facturen', 'Subtotaal', 'BTW', 'Totaal'];
        filename = 'omzet';
        break;
      }
      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
    }

    if (format === 'json') {
      return NextResponse.json({ data: rows, count: rows.length });
    }

    // Generate CSV
    const csvRows = [headers.join(';')];
    for (const row of rows) {
      const values = Object.values(row).map(v => {
        if (v === null || v === undefined) return '';
        const str = String(v);
        // Escape semicolons and quotes for CSV
        if (str.includes(';') || str.includes('"') || str.includes('\n')) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      });
      csvRows.push(values.join(';'));
    }

    const csvContent = '\ufeff' + csvRows.join('\n'); // BOM for Excel
    const dateStr = new Date().toISOString().split('T')[0];

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}-${dateStr}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
