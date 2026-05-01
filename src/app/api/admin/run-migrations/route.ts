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
  // Legacy-tabel kan first_name/last_name/customer_number/password_hash
  // hebben uit een ander project; die maken we nullable zodat onze
  // INSERTs (die alleen 'name' vullen) niet crashen.
  await ran('customers.first_name nullable', () => sql`ALTER TABLE customers ALTER COLUMN first_name DROP NOT NULL`);
  await ran('customers.last_name nullable', () => sql`ALTER TABLE customers ALTER COLUMN last_name DROP NOT NULL`);
  await ran('customers.email nullable (legacy)', () => sql`ALTER TABLE customers ALTER COLUMN email DROP NOT NULL`);
  await ran('customers.name', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT ''`);
  // Vul name uit first_name+last_name voor bestaande rijen (eenmalig).
  await ran('customers.name backfill from first_name+last_name', () => sql`
    UPDATE customers
    SET name = TRIM(BOTH ' ' FROM CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')))
    WHERE (name IS NULL OR name = '') AND (first_name IS NOT NULL OR last_name IS NOT NULL)
  `);
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

  // Legacy UNIQUE-constraint uit een eerder DB-schema (heette
  // customers_email_key). Botst met case-insensitive matching + soft-deletes,
  // dus weghalen ten faveure van onze partial index hieronder.
  await ran('drop legacy customers_email_key', () => sql`ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_email_key`);
  await ran('drop legacy customers_email_unique', () => sql`ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_email_unique`);
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
  await ran('fridge_bookings.payment_link_url', () => sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS payment_link_url TEXT`);
  await ran('fridge_bookings.payment_link_sent_at', () => sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS payment_link_sent_at TIMESTAMP`);
  await ran('fridge_bookings.payment_link_email', () => sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS payment_link_email TEXT`);
  await ran('fridge_bookings.payment_link_amount_cents', () => sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS payment_link_amount_cents INTEGER`);
  await ran('fridge_bookings.device_type', () => sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS device_type TEXT`);
  // Holded full snapshot — alle Holded-velden inclusief custom fields zoals
  // kenteken/registratie. JSONB zodat we nieuwe velden kunnen toevoegen
  // zonder schema-wijzigingen.
  await ran('customers.is_company', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_company BOOLEAN DEFAULT false`);
  await ran('customers.holded_raw', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_raw JSONB`);
  await ran('customers.holded_custom_fields', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_custom_fields JSONB`);
  await ran('customers.holded_tags', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_tags JSONB`);
  await ran('customers.holded_code', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_code TEXT`);
  await ran('customers.holded_type', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_type TEXT`);
  await ran('customers.holded_iban', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_iban TEXT`);
  await ran('customers.holded_web', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_web TEXT`);
  await ran('customers.holded_secondary_email', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_secondary_email TEXT`);
  await ran('customers.holded_default_currency', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_default_currency TEXT`);
  await ran('customers.holded_billing_address', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_billing_address JSONB`);
  await ran('customers.holded_shipping_address', () => sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_shipping_address JSONB`);
  await ran('fridge_bookings.paid_at', () => sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP`);
  await ran('fridge_bookings.stripe_payment_intent_id', () => sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT`);
  await ran('fridge_bookings.sales_invoice_converted_at', () => sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS sales_invoice_converted_at TIMESTAMP`);
  await ran('fridge_bookings.sales_invoice_converted_by', () => sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS sales_invoice_converted_by TEXT`);
  await ran('stalling_requests.paid_at', () => sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP`);
  await ran('stalling_requests.stripe_payment_intent_id', () => sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT`);
  await ran('stalling_requests.sales_invoice_converted_at', () => sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS sales_invoice_converted_at TIMESTAMP`);
  await ran('stalling_requests.sales_invoice_converted_by', () => sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS sales_invoice_converted_by TEXT`);
  await ran('transport_requests.paid_at', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP`);
  await ran('transport_requests.stripe_payment_intent_id', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT`);
  await ran('transport_requests.sales_invoice_converted_at', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS sales_invoice_converted_at TIMESTAMP`);
  await ran('transport_requests.sales_invoice_converted_by', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS sales_invoice_converted_by TEXT`);

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
  await ran('transport_requests.pickup_location', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS pickup_location TEXT`);
  await ran('transport_requests.outbound_time', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS outbound_time TEXT`);
  await ran('transport_requests.return_time', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS return_time TEXT`);
  await ran('transport_requests.created_via', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS created_via TEXT NOT NULL DEFAULT 'public'`);
  await ran('transport_requests.holded_invoice_id', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS holded_invoice_id TEXT`);
  await ran('transport_requests.holded_invoice_number', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS holded_invoice_number TEXT`);
  await ran('transport_requests.holded_invoice_status', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS holded_invoice_status TEXT`);
  await ran('transport_requests.holded_invoice_synced_at', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS holded_invoice_synced_at TIMESTAMP`);
  await ran('transport_requests.holded_invoice_url', () => sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS holded_invoice_url TEXT`);

  // ─── Ideas (ideeënbus) ───
  await ran('ideas table', async () => {
    await sql`CREATE TABLE IF NOT EXISTS ideas (
      id SERIAL PRIMARY KEY,
      name TEXT,
      email TEXT,
      category TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`;
  });
  await ran('ideas.votes_up', () => sql`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS votes_up INTEGER DEFAULT 0`);
  await ran('ideas.votes_down', () => sql`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS votes_down INTEGER DEFAULT 0`);
  await ran('ideas.featured', () => sql`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false`);
  await ran('idx_ideas_status', () => sql`CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status)`);
  await ran('idx_ideas_created', () => sql`CREATE INDEX IF NOT EXISTS idx_ideas_created ON ideas(created_at DESC)`);
  await ran('seed watermachine featured idea', () => sql`INSERT INTO ideas (category, title, message, status, featured)
    SELECT 'verhuur',
      'Interesse in een watermachine?',
      'We onderzoeken of er interesse is in het huren van een watermachine voor op de camping. Met een watermachine heb je altijd koud drinkwater bij de hand, zonder steeds te hoeven sjouwen met zware flessen.

De verhuur zou bestaan uit:
• Een watermachine
• Een hervulbare fles
• Schoonmaaktabletten voor goed onderhoud

Altijd koud en schoon drinkwater — makkelijk en praktisch tijdens de vakantie.',
      'shortlist', true
    WHERE NOT EXISTS (SELECT 1 FROM ideas WHERE featured = true AND title ILIKE '%watermachine%')`);

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
