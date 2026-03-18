import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { bookingSchema, validateBody } from '@/lib/validations';
import { hashPassword, createCustomerToken } from '@/lib/auth';
import { createCheckoutSession, STORAGE_PRICES, formatCurrency } from '@/lib/stripe';
import { sendBookingConfirmation, sendWelcomeEmail } from '@/lib/email';

const sql = neon(process.env.DATABASE_URL || '');

// POST /api/booking/create — Create a booking (full flow)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateBody(bookingSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const data = validation.data;

    // 1. Find or create customer
    let customer = await sql`SELECT * FROM customers WHERE email = ${data.email} LIMIT 1`;
    let customerId: number;
    let isNewCustomer = false;

    if (customer.length > 0) {
      customerId = customer[0].id;
    } else {
      // Generate customer number
      const countRes = await sql`SELECT COUNT(*) as count FROM customers`;
      const num = 'KL-' + String(Number(countRes[0].count) + 1).padStart(6, '0');
      const passwordHash = await hashPassword(data.email + Date.now()); // Temporary password — user should reset

      const res = await sql`
        INSERT INTO customers (customer_number, first_name, last_name, email, password_hash, phone, country)
        VALUES (${num}, ${data.firstName}, ${data.lastName}, ${data.email}, ${passwordHash}, ${data.phone}, 'NL')
        RETURNING *
      `;
      customerId = res[0].id;
      isNewCustomer = true;
    }

    // 2. Create caravan record
    const caravanRes = await sql`
      INSERT INTO caravans (customer_id, brand, model, license_plate, year, weight_kg, has_mover, status)
      VALUES (${customerId}, ${data.brand}, ${data.model || null}, ${data.licensePlate || null}, ${data.year || null}, ${data.weight || null}, ${data.hasMover}, 'in_transit')
      RETURNING *
    `;
    const caravanId = caravanRes[0].id;

    // 3. Find an available spot
    const spotType = data.storageType === 'binnen' ? 'binnen' : 'buiten';
    const availableSpot = await sql`
      SELECT id, label, zone FROM spots 
      WHERE location_id = ${data.locationId} 
      AND spot_type = ${spotType} 
      AND status = 'vrij' 
      ORDER BY zone, label 
      LIMIT 1
    `;

    let spotId = null;
    if (availableSpot.length > 0) {
      spotId = availableSpot[0].id;
      // Reserve the spot
      await sql`UPDATE spots SET status = 'gereserveerd' WHERE id = ${spotId}`;
      // Assign spot to caravan
      await sql`UPDATE caravans SET location_id = ${data.locationId}, spot_id = ${spotId} WHERE id = ${caravanId}`;
    }

    // 4. Create contract
    const contractNum = 'CON-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-5);
    const pricing: Record<string, number> = { buiten: 65, binnen: 95, seizoen: 45 };
    const monthlyRate = pricing[data.storageType] || 65;

    const startDate = data.startDate;
    const endDate = new Date(new Date(startDate).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    await sql`
      INSERT INTO contracts (contract_number, customer_id, caravan_id, location_id, spot_id, start_date, end_date, monthly_rate, auto_renew, status)
      VALUES (${contractNum}, ${customerId}, ${caravanId}, ${data.locationId}, ${spotId}, ${startDate}, ${endDate}, ${monthlyRate}, true, 'actief')
    `;

    // 5. Create first invoice
    const invoiceYear = new Date().getFullYear();
    const invoiceCountRes = await sql`SELECT COUNT(*) as cnt FROM invoices WHERE invoice_number LIKE ${'FAC-' + invoiceYear + '%'}`;
    const seq = Number(invoiceCountRes[0].cnt) + 1;
    const invoiceNum = 'FAC-' + invoiceYear + '-' + String(seq).padStart(4, '0');
    const taxRate = 21;
    const taxAmount = monthlyRate * taxRate / 100;
    const total = monthlyRate + taxAmount;

    await sql`
      INSERT INTO invoices (invoice_number, customer_id, contract_id, description, subtotal, tax_rate, tax_amount, total, status, due_date)
      VALUES (${invoiceNum}, ${customerId}, (SELECT id FROM contracts WHERE contract_number = ${contractNum}), ${STORAGE_PRICES[data.storageType]?.label || 'Stalling'}, ${monthlyRate}, ${taxRate}, ${taxAmount}, ${total}, 'open', ${startDate})
    `;

    // 6. Log activity
    await sql`
      INSERT INTO activity_log (actor, role, action, entity_type, entity_id, entity_label, details)
      VALUES (${data.firstName + ' ' + data.lastName}, 'klant', 'boeking_aangemaakt', 'contract', ${contractNum}, ${contractNum}, ${`${STORAGE_PRICES[data.storageType]?.label || data.storageType} - ${data.brand} ${data.model || ''}`})
    `;

    // 7. Send emails
    const locationRes = await sql`SELECT name FROM locations WHERE id = ${data.locationId}`;
    const locationName = locationRes[0]?.name || 'Costa Brava';

    await sendBookingConfirmation(data.email, {
      name: data.firstName,
      storageType: STORAGE_PRICES[data.storageType]?.label || data.storageType,
      startDate: new Date(startDate).toLocaleDateString('nl-NL'),
      location: locationName,
      monthlyRate: formatCurrency(monthlyRate * 100),
    });

    if (isNewCustomer) {
      await sendWelcomeEmail(data.email, { name: data.firstName });
    }

    // 8. Optionally create Stripe checkout session
    let checkoutUrl = null;
    try {
      const session = await createCheckoutSession({
        customerEmail: data.email,
        storageType: data.storageType as 'buiten' | 'binnen' | 'seizoen',
        extras: data.extras,
        successUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://caravanstalling-spanje.com'}/reserveren?success=true&contract=${contractNum}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://caravanstalling-spanje.com'}/reserveren?cancelled=true`,
        metadata: {
          customerId: String(customerId),
          caravanId: String(caravanId),
          contractNumber: contractNum,
        },
      });
      checkoutUrl = session.url;
    } catch {
      // Stripe not configured — proceed without payment
    }

    // Create customer token for auto-login
    const token = await createCustomerToken({
      id: customerId,
      email: data.email,
      name: `${data.firstName} ${data.lastName}`,
    });

    const response = NextResponse.json({
      success: true,
      contractNumber: contractNum,
      invoiceNumber: invoiceNum,
      spotLabel: availableSpot[0]?.label || null,
      checkoutUrl,
      monthlyRate,
    });

    // Set customer token as cookie
    response.cookies.set('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Er is een fout opgetreden bij het aanmaken van de boeking' }, { status: 500 });
  }
}
