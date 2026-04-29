import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Forceert alle ALTER TABLE / CREATE TABLE migrations zonder gebruik te
// maken van de in-memory module cache. Bezoek na deploy via
// GET /api/admin/run-migrations om de productie-DB op één zet bij te werken.
// Idempotent: alles is IF NOT EXISTS.
export async function GET() {
  const log: string[] = [];
  const ran = async (label: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      log.push(`✓ ${label}`);
    } catch (err) {
      log.push(`✗ ${label}: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  };

  // ─── Customers ───
  await ran('customers table', async () => {
    await sql`CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      mobile TEXT,
      address TEXT,
      city TEXT,
      postal_code TEXT,
      country TEXT DEFAULT 'ES',
      vat_number TEXT,
      notes TEXT,
      holded_contact_id TEXT,
      holded_sync_failed BOOLEAN DEFAULT false,
      source TEXT DEFAULT 'manual',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`;
  });
  // Volledige kolom-lijst voor de customers-tabel. Idempotent — als er
  // ooit een halve / lege variant is aangemaakt vullen we 'm hiermee bij.
  await ran('customers.name', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT ''`);
  await ran('customers.email', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT`);
  await ran('customers.phone', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone TEXT`);
  await ran('customers.mobile', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS mobile TEXT`);
  await ran('customers.address', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT`);
  await ran('customers.city', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS city TEXT`);
  await ran('customers.postal_code', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS postal_code TEXT`);
  await ran('customers.country', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'ES'`);
  await ran('customers.vat_number', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS vat_number TEXT`);
  await ran('customers.notes', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT`);
  await ran('customers.created_at', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()`);
  await ran('customers.updated_at', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`);
  await ran('customers.holded_contact_id', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_contact_id TEXT`);
  await ran('customers.holded_sync_failed', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_sync_failed BOOLEAN DEFAULT false`);
  await ran('customers.deleted_at', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`);
  await ran('customers.holded_synced_at', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_synced_at TIMESTAMP`);
  await ran('customers.source', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual'`);

  await ran('idx_customers_email_lower_alive', () => sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email_lower_alive ON customers (LOWER(email)) WHERE email IS NOT NULL AND deleted_at IS NULL`);
  await ran('idx_customers_holded_id', () => sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_holded_id ON customers (holded_contact_id) WHERE holded_contact_id IS NOT NULL`);
  await ran('idx_customers_phone', () => sql`CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone)`);

  // ─── Fridges ───
  await ran('fridges.holded_contact_id', () => sql`ALTER TABLE fridges ADD COLUMN IF NOT EXISTS holded_contact_id TEXT`);
  await ran('fridges.extra_email', () => sql`ALTER TABLE fridges ADD COLUMN IF NOT EXISTS extra_email TEXT`);
  await ran('fridges.customer_id', () => sql`ALTER TABLE fridges ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL`);

  // ─── Fridge bookings ───
  await ran('fridge_bookings.holded_invoice_id', () => sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS holded_invoice_id TEXT`);
  await ran('fridge_bookings.holded_invoice_number', () => sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS holded_invoice_number TEXT`);
  await ran('fridge_bookings.holded_invoice_status', () => sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS holded_invoice_status TEXT`);
  await ran('fridge_bookings.holded_invoice_synced_at', () => sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS holded_invoice_synced_at TIMESTAMP`);
  await ran('fridge_bookings.holded_invoice_url', () => sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS holded_invoice_url TEXT`);

  // ─── Stalling requests ───
  await ran('stalling_requests.customer_id', () => sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL`);
  await ran('stalling_requests.holded_invoice_id', () => sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS holded_invoice_id TEXT`);
  await ran('stalling_requests.holded_invoice_number', () => sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS holded_invoice_number TEXT`);
  await ran('stalling_requests.holded_invoice_status', () => sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS holded_invoice_status TEXT`);
  await ran('stalling_requests.holded_invoice_synced_at', () => sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS holded_invoice_synced_at TIMESTAMP`);
  await ran('stalling_requests.holded_invoice_url', () => sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS holded_invoice_url TEXT`);
  await ran('stalling_requests.customer_notified_at', () => sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS customer_notified_at TIMESTAMP`);
  await ran('stalling_requests.notified_status', () => sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS notified_status TEXT`);

  // ─── Transport requests ───
  await ran('transport_requests.customer_id', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL`);
  await ran('transport_requests.transport_mode', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS transport_mode TEXT`);
  await ran('transport_requests.outbound_time', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS outbound_time TEXT`);
  await ran('transport_requests.return_time', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS return_time TEXT`);
  await ran('transport_requests.created_via', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS created_via TEXT NOT NULL DEFAULT 'public'`);
  await ran('transport_requests.holded_invoice_id', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS holded_invoice_id TEXT`);
  await ran('transport_requests.holded_invoice_number', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS holded_invoice_number TEXT`);
  await ran('transport_requests.holded_invoice_status', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS holded_invoice_status TEXT`);
  await ran('transport_requests.holded_invoice_synced_at', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS holded_invoice_synced_at TIMESTAMP`);
  await ran('transport_requests.holded_invoice_url', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS holded_invoice_url TEXT`);

  // ─── Contact messages ───
  await ran('contact_messages table', async () => {
    await sql`CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      handled_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`;
  });

  return NextResponse.json({ ok: true, log });
}
