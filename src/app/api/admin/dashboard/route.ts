import { NextResponse } from 'next/server';
import { getDashboardStats, getRecentActivity, sql } from '@/lib/db';

export async function GET() {
  try {
    const [stats, activity, expiringContracts, expiringInsurance, expiringApk, unreadMessages, newLeads, pendingServices, prevCustomers, prevCaravans, prevContracts, prevRevenue] = await Promise.all([
      getDashboardStats(),
      getRecentActivity(15),
      sql`SELECT co.contract_number, cu.first_name || ' ' || cu.last_name as customer_name, co.end_date
          FROM contracts co LEFT JOIN customers cu ON co.customer_id = cu.id
          WHERE co.status = 'actief' AND co.end_date <= CURRENT_DATE + INTERVAL '30 days' AND co.end_date >= CURRENT_DATE
          ORDER BY co.end_date ASC LIMIT 10`,
      sql`SELECT c.brand, c.model, c.license_plate, c.insurance_expiry, cu.first_name || ' ' || cu.last_name as customer_name
          FROM caravans c LEFT JOIN customers cu ON c.customer_id = cu.id
          WHERE c.insurance_expiry IS NOT NULL AND c.insurance_expiry <= CURRENT_DATE + INTERVAL '60 days' AND c.insurance_expiry >= CURRENT_DATE
          ORDER BY c.insurance_expiry ASC LIMIT 10`,
      sql`SELECT c.brand, c.model, c.license_plate, c.apk_expiry, cu.first_name || ' ' || cu.last_name as customer_name
          FROM caravans c LEFT JOIN customers cu ON c.customer_id = cu.id
          WHERE c.apk_expiry IS NOT NULL AND c.apk_expiry <= CURRENT_DATE + INTERVAL '60 days' AND c.apk_expiry >= CURRENT_DATE
          ORDER BY c.apk_expiry ASC LIMIT 10`,
      sql`SELECT COUNT(*) as count FROM contact_messages WHERE is_read = false`,
      sql`SELECT COUNT(*) as count FROM leads WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'`,
      sql`SELECT COUNT(*) as count FROM service_requests WHERE status IN ('aangevraagd', 'goedgekeurd')`,
      // Previous period comparisons (30 days ago)
      sql`SELECT COUNT(*) as total FROM customers WHERE created_at < CURRENT_DATE - INTERVAL '30 days'`,
      sql`SELECT COUNT(*) as total FROM caravans WHERE created_at < CURRENT_DATE - INTERVAL '30 days'`,
      sql`SELECT COUNT(*) as total FROM contracts WHERE status = 'actief' AND created_at < CURRENT_DATE - INTERVAL '30 days'`,
      sql`SELECT COALESCE(SUM(total),0) as prev_total FROM invoices WHERE status = 'betaald' AND EXTRACT(YEAR FROM paid_date) = EXTRACT(YEAR FROM CURRENT_DATE) AND paid_date < CURRENT_DATE - INTERVAL '30 days'`,
    ]);

    const alerts = {
      expiringContracts,
      expiringInsurance,
      expiringApk,
      unreadMessages: Number(unreadMessages[0]?.count || 0),
      newLeads: Number(newLeads[0]?.count || 0),
      pendingServices: Number(pendingServices[0]?.count || 0),
    };

    const trends = {
      newCustomers30d: stats.totalCustomers - Number(prevCustomers[0]?.total || 0),
      newCaravans30d: stats.totalCaravans - Number(prevCaravans[0]?.total || 0),
      newContracts30d: stats.activeContracts - Number(prevContracts[0]?.total || 0),
      revenueGrowth30d: stats.yearRevenue - Number(prevRevenue[0]?.prev_total || 0),
    };

    return NextResponse.json({ stats, activity, alerts, trends });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
