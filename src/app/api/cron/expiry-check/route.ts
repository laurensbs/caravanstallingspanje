import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Cron endpoint for checking expiring documents and contracts
// Called via Vercel Cron or external scheduler
// Protected by CRON_SECRET header

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = {
      apkWarnings: 0,
      insuranceWarnings: 0,
      contractWarnings: 0,
      invoiceReminders: 0,
    };

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const dateStr30 = thirtyDaysFromNow.toISOString().split('T')[0];

    const fourteenDaysFromNow = new Date();
    fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);
    const dateStr14 = fourteenDaysFromNow.toISOString().split('T')[0];

    // 1. APK expiry warnings (30 days before)
    const expiringAPK = await sql`
      SELECT c.id, c.apk_expiry, cu.id as customer_id, cu.first_name || ' ' || cu.last_name as name
      FROM caravans c
      JOIN customers cu ON c.customer_id = cu.id
      WHERE c.apk_expiry IS NOT NULL 
        AND c.apk_expiry <= ${dateStr30}
        AND c.apk_expiry > CURRENT_DATE
        AND NOT EXISTS (
          SELECT 1 FROM notifications n 
          WHERE n.user_id = cu.id AND n.user_type = 'customer' 
          AND n.title = 'APK verloopt binnenkort'
          AND n.created_at > NOW() - INTERVAL '7 days'
        )
    `;

    for (const row of expiringAPK) {
      await sql`
        INSERT INTO notifications (user_type, user_id, title, message, link)
        VALUES ('customer', ${row.customer_id}, 'APK verloopt binnenkort', 
                ${'Uw APK keuring verloopt op ' + new Date(row.apk_expiry).toLocaleDateString('nl-NL') + '. Upload een nieuw APK rapport via uw account.'},
                '/mijn-account?tab=documenten')
      `;
      results.apkWarnings++;
    }

    // 2. Insurance expiry warnings (30 days before)
    const expiringInsurance = await sql`
      SELECT c.id, c.insurance_expiry, cu.id as customer_id, cu.first_name || ' ' || cu.last_name as name
      FROM caravans c
      JOIN customers cu ON c.customer_id = cu.id
      WHERE c.insurance_expiry IS NOT NULL 
        AND c.insurance_expiry <= ${dateStr30}
        AND c.insurance_expiry > CURRENT_DATE
        AND NOT EXISTS (
          SELECT 1 FROM notifications n 
          WHERE n.user_id = cu.id AND n.user_type = 'customer' 
          AND n.title = 'Verzekering verloopt binnenkort'
          AND n.created_at > NOW() - INTERVAL '7 days'
        )
    `;

    for (const row of expiringInsurance) {
      await sql`
        INSERT INTO notifications (user_type, user_id, title, message, link)
        VALUES ('customer', ${row.customer_id}, 'Verzekering verloopt binnenkort',
                ${'Uw verzekering verloopt op ' + new Date(row.insurance_expiry).toLocaleDateString('nl-NL') + '. Upload een nieuw verzekeringsbewijs.'},
                '/mijn-account?tab=documenten')
      `;
      results.insuranceWarnings++;
    }

    // 3. Contract expiry warnings (14 days before end)
    const expiringContracts = await sql`
      SELECT co.id, co.contract_number, co.end_date, co.auto_renew, cu.id as customer_id
      FROM contracts co
      JOIN customers cu ON co.customer_id = cu.id
      WHERE co.status = 'actief'
        AND co.end_date <= ${dateStr14}
        AND co.end_date > CURRENT_DATE
        AND NOT EXISTS (
          SELECT 1 FROM notifications n 
          WHERE n.user_id = cu.id AND n.user_type = 'customer' 
          AND n.title = 'Contract loopt af'
          AND n.created_at > NOW() - INTERVAL '7 days'
        )
    `;

    for (const row of expiringContracts) {
      const msg = row.auto_renew
        ? `Uw contract ${row.contract_number} wordt automatisch verlengd op ${new Date(row.end_date).toLocaleDateString('nl-NL')}.`
        : `Uw contract ${row.contract_number} loopt af op ${new Date(row.end_date).toLocaleDateString('nl-NL')}. Neem contact op om te verlengen.`;
      
      await sql`
        INSERT INTO notifications (user_type, user_id, title, message, link)
        VALUES ('customer', ${row.customer_id}, 'Contract loopt af', ${msg}, '/mijn-account?tab=contracten')
      `;
      results.contractWarnings++;
    }

    // 4. Overdue invoice reminders
    const overdueInvoices = await sql`
      SELECT i.id, i.invoice_number, i.total, i.due_date, cu.id as customer_id
      FROM invoices i
      JOIN customers cu ON i.customer_id = cu.id
      WHERE i.status IN ('open', 'verzonden')
        AND i.due_date < CURRENT_DATE
        AND NOT EXISTS (
          SELECT 1 FROM notifications n 
          WHERE n.user_id = cu.id AND n.user_type = 'customer' 
          AND n.title = 'Factuur verlopen'
          AND n.created_at > NOW() - INTERVAL '7 days'
        )
    `;

    for (const row of overdueInvoices) {
      await sql`
        INSERT INTO notifications (user_type, user_id, title, message, link)
        VALUES ('customer', ${row.customer_id}, 'Factuur verlopen',
                ${'Factuur ' + row.invoice_number + ' (€' + Number(row.total).toFixed(2) + ') is verlopen. Betaal zo snel mogelijk via uw account.'},
                '/mijn-account?tab=facturen')
      `;
      results.invoiceReminders++;
    }

    // Also notify admin about overdue items
    const totalWarnings = results.apkWarnings + results.insuranceWarnings + results.contractWarnings + results.invoiceReminders;
    if (totalWarnings > 0) {
      await sql`
        INSERT INTO notifications (user_type, user_id, title, message, link)
        VALUES ('admin', 1, 'Automatische waarschuwingen verstuurd',
                ${`${results.apkWarnings} APK, ${results.insuranceWarnings} verzekering, ${results.contractWarnings} contract, ${results.invoiceReminders} factuur waarschuwingen verstuurd.`},
                '/admin')
      `;
    }

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error('Cron expiry check error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
